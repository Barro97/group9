document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const fileInput = document.getElementById('file-input');
    const chatMessages = document.querySelector('.chat-messages');

    // Auto-resize the textarea to fit the content
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = messageInput.scrollHeight + 'px';
        chatMessages.style.height = `calc(100% - ${Math.min(messageInput.scrollHeight, 150) + 20}px)`;
    });

    // Send message when Enter is pressed (without Shift)
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Send message when a file is selected
    fileInput.addEventListener('change', () => {
        sendMessage();
    });
});

async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const fileInput = document.getElementById('file-input');
    const messagesContainer = document.getElementById('chat-messages');
    const messageText = messageInput.value.trim();
    const files = fileInput.files;

    // If no message text or files, do nothing
    if (messageText === '' && files.length === 0) return;

    const now = new Date();
    const timestamp = now.toISOString();
    const currentDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Add a date header if the message is on a new date
    if (currentDate !== lastMessageDate) {
        const dateHeader = document.createElement('div');
        dateHeader.className = 'date-header';
        dateHeader.textContent = currentDate;
        messagesContainer.appendChild(dateHeader);
        lastMessageDate = currentDate;
    }

    // Create a new message element
    const messageElement = document.createElement('div');
    messageElement.className = 'message user';

    // Add message text content
    if (messageText !== '') {
        const messageContentElement = document.createElement('div');
        messageContentElement.className = 'message-content';
        messageContentElement.textContent = messageText;

        const timestampElement = document.createElement('span');
        timestampElement.className = 'message-timestamp';
        timestampElement.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        messageContentElement.appendChild(timestampElement);
        messageElement.appendChild(messageContentElement);
    }

    // Add file content
    for (let file of files) {
        const fileElement = document.createElement('div');
        fileElement.className = 'message-content';
        const fileReader = new FileReader();

        fileReader.onload = async (e) => {
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.maxWidth = '100%';
                fileElement.appendChild(img);
            } else {
                const link = document.createElement('a');
                link.href = e.target.result;
                link.download = file.name;
                link.textContent = file.name;
                fileElement.appendChild(link);
            }

            const timestampElement = document.createElement('span');
            timestampElement.className = 'message-timestamp';
            timestampElement.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            fileElement.appendChild(timestampElement);

            messageElement.appendChild(fileElement);
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        };

        fileReader.readAsDataURL(file);
    }

    // Append message element to container and scroll to bottom
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Reset input fields
    messageInput.value = '';
    messageInput.style.height = 'auto';
    fileInput.value = '';

    // Use the JavaScript variables for sender and receiver email
    const senderEmail = userEmail;
    const receiverEmail = profileEmail;

    // Prepare file data for sending
    const fileDataPromises = Array.from(files).map(async (file) => ({
        name: file.name,
        type: file.type,
        content: file.type.startsWith('image/') ? await toBase64(file) : ''
    }));

    const fileData = await Promise.all(fileDataPromises);

    // Send message to the server
    await fetch('/send_message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sender_email: senderEmail,
            receiver_email: receiverEmail,
            message: messageText,
            timestamp: timestamp,
            files: fileData
        })
    });

    // Reload messages
    await loadMessages(senderEmail, receiverEmail);
}

async function loadMessages(senderEmail, receiverEmail) {
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.innerHTML = '';

    // Fetch messages from the server
    const response = await fetch(`/get_messages/${encodeURIComponent(senderEmail)}/${encodeURIComponent(receiverEmail)}`);
    const { messages } = await response.json();

    lastMessageDate = '';

    // Loop through messages and display them
    messages.forEach((msg) => {
        const messageDate = new Date(msg.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        // Add a date header if the message is on a new date
        if (messageDate !== lastMessageDate) {
            const dateHeader = document.createElement('div');
            dateHeader.className = 'date-header';
            dateHeader.textContent = messageDate;
            messagesContainer.appendChild(dateHeader);
            lastMessageDate = messageDate;
        }

        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = 'message' + (msg.sender_email === senderEmail ? ' user' : '');

        // Add message content
        const messageContentElement = document.createElement('div');
        messageContentElement.className = 'message-content';
        messageContentElement.textContent = msg.message;

        const timestampElement = document.createElement('span');
        timestampElement.className = 'message-timestamp';
        timestampElement.textContent = new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        messageContentElement.appendChild(timestampElement);
        messageElement.appendChild(messageContentElement);

        // Add file attachments
        if (msg.files && msg.files.length > 0) {
            msg.files.forEach(file => {
                const fileElement = document.createElement('div');
                fileElement.className = 'message-content';

                if (file.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = file.content;
                    img.style.maxWidth = '100%';
                    fileElement.appendChild(img);
                } else {
                    const link = document.createElement('a');
                    link.href = file.content;
                    link.download = file.name;
                    link.textContent = file.name;
                    fileElement.appendChild(link);
                }

                const fileTimestampElement = document.createElement('span');
                fileTimestampElement.className = 'message-timestamp';
                fileTimestampElement.textContent = new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                fileElement.appendChild(fileTimestampElement);
                messageElement.appendChild(fileElement);
            });
        }

        // Append message element to container
        messagesContainer.appendChild(messageElement);
    });

    // Scroll to bottom of the chat
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
