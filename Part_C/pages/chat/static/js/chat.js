document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const fileInput = document.getElementById('file-input');
    const chatMessages = document.querySelector('.chat-messages');

    // Auto-resize the textarea
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = messageInput.scrollHeight + 'px';
        chatMessages.style.height = `calc(100% - ${Math.min(messageInput.scrollHeight, 150) + 20}px)`;
    });

    // Listen for keydown event on the input field
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Handle file input change
    fileInput.addEventListener('change', () => {
        sendMessage();
    });

    // Load the last chat user
    loadLastChatUser();
});

let lastMessageDate = '';

async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const fileInput = document.getElementById('file-input');
    const messagesContainer = document.getElementById('chat-messages');
    const messageText = messageInput.value.trim();
    const files = fileInput.files;
    if (messageText === '' && files.length === 0) return;

    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});
    const currentDate = now.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});

    if (currentDate !== lastMessageDate) {
        const dateHeader = document.createElement('div');
        dateHeader.className = 'date-header';
        dateHeader.textContent = currentDate;
        messagesContainer.appendChild(dateHeader);
        lastMessageDate = currentDate;
    }

    const messageElement = document.createElement('div');
    messageElement.className = 'message user';

    if (messageText !== '') {
        const messageContentElement = document.createElement('div');
        messageContentElement.className = 'message-content';
        messageContentElement.textContent = messageText;

        const timestampElement = document.createElement('span');
        timestampElement.className = 'message-timestamp';
        timestampElement.textContent = `${timestamp}`;

        messageContentElement.appendChild(timestampElement);
        messageElement.appendChild(messageContentElement);
    }

    for (let file of files) {
        const fileElement = document.createElement('div');
        fileElement.className = 'message-content';
        const fileReader = new FileReader();

        fileReader.onload = (e) => {
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
            timestampElement.textContent = `${timestamp}`;
            fileElement.appendChild(timestampElement);

            messageElement.appendChild(fileElement);
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        };

        fileReader.readAsDataURL(file);
    }

    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    messageInput.value = '';
    messageInput.style.height = 'auto';
    fileInput.value = '';

    // Send message to the server
    const userName = document.getElementById('user-name').textContent;

    const response = await fetch('/send_message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message_text: messageText,
            user_name: userName,
            timestamp: timestamp,
            files: Array.from(files).map(file => file.name) // Sending only file names for simplicity
        })
    });

    if (response.ok) {
        const responseElement = document.createElement('div');
        responseElement.className = 'message';

        const responseContentElement = document.createElement('div');
        responseContentElement.className = 'message-content response';
        responseContentElement.textContent = `Response to "${messageText}"`;

        const timestampElement = document.createElement('span');
        timestampElement.className = 'message-timestamp';
        timestampElement.textContent = `${timestamp}`;

        responseContentElement.appendChild(timestampElement);
        responseElement.appendChild(responseContentElement);
        messagesContainer.appendChild(responseElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

async function selectUser(userName, userTitle, userPicture, userProfileLink) {
    const chatHeader = document.querySelector('.chat-header');
    const messagesContainer = document.getElementById('chat-messages');
    const userNameElement = document.getElementById('user-name');
    const userTitleElement = document.getElementById('user-title');
    const userPictureElement = document.getElementById('user-picture');
    const userProfileLinkElement = document.querySelector('.profile-link a');

    chatHeader.textContent = `Chat with ${userName}`;
    userNameElement.textContent = userName;
    userTitleElement.textContent = userTitle;
    userPictureElement.src = userPicture;
    userProfileLinkElement.href = userProfileLink;

    messagesContainer.innerHTML = '';

    const response = await fetch(`/get_messages?user_name=${encodeURIComponent(userName)}`);
    const messages = await response.json();

    lastMessageDate = '';

    messages.forEach((msg) => {
        const messageDate = new Date(msg.timestamp).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});

        if (messageDate !== lastMessageDate) {
            const dateHeader = document.createElement('div');
            dateHeader.className = 'date-header';
            dateHeader.textContent = messageDate;
            messagesContainer.appendChild(dateHeader);
            lastMessageDate = messageDate;
        }

        const messageElement = document.createElement('div');
        messageElement.className = 'message' + (msg.isUser ? ' user' : '');

        const messageContentElement = document.createElement('div');
        messageContentElement.className = 'message-content';
        messageContentElement.textContent = msg.message_text;

        const timestampElement = document.createElement('span');
        timestampElement.className = 'message-timestamp';
        timestampElement.textContent = new Date(msg.timestamp).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});

        messageContentElement.appendChild(timestampElement);
        messageElement.appendChild(messageContentElement);
        messagesContainer.appendChild(messageElement);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    localStorage.setItem('lastChatUser', JSON.stringify({userName, userTitle, userPicture, userProfileLink}));
}

function loadLastChatUser() {
    const lastChatUser = localStorage.getItem('lastChatUser');
    if (lastChatUser) {
        const {userName, userTitle, userPicture, userProfileLink} = JSON.parse(lastChatUser);
        selectUser(userName, userTitle, userPicture, userProfileLink);
    } else {
        const topUserElement = document.querySelector('.chat-sidebar-user');
        if (topUserElement) {
            topUserElement.click();
        }
    }
}
