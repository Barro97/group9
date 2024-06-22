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

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const fileInput = document.getElementById('file-input');
    const messagesContainer = document.getElementById('chat-messages');
    const messageText = messageInput.value.trim();
    const files = fileInput.files;
    if (messageText === '' && files.length === 0) return;

    // Create a timestamp for the message
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});
    const currentDate = now.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});

    // Add date header if this is the first message of the day
    if (currentDate !== lastMessageDate) {
        const dateHeader = document.createElement('div');
        dateHeader.className = 'date-header';
        dateHeader.textContent = currentDate;
        messagesContainer.appendChild(dateHeader);
        lastMessageDate = currentDate;
    }

    // Create the message element
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

    // Simulate a response after 1 second
    setTimeout(() => {
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
    }, 1000);
}

function selectUser(userName, userTitle, userPicture, userProfileLink) {
    const chatHeader = document.querySelector('.chat-header');
    const messagesContainer = document.getElementById('chat-messages');
    const userNameElement = document.getElementById('user-name');
    const userTitleElement = document.getElementById('user-title');
    const userPictureElement = document.getElementById('user-picture');
    const userProfileLinkElement = document.querySelector('.profile-link a');

    // Set the chat header to the selected user's name
    chatHeader.textContent = `Chat with ${userName}`;

    // Update user details in the user container
    userNameElement.textContent = userName;
    userTitleElement.textContent = userTitle;
    userPictureElement.src = userPicture;
    userProfileLinkElement.href = userProfileLink;

    // Clear the current chat messages
    messagesContainer.innerHTML = '';

    // Load the chat messages for the selected user
    const dummyMessages = [
        {text: `Hello ${userName}, how are you?`, isUser: true, date: new Date('2023-06-18T12:00:00')},
        {text: `I'm doing great, thanks! How about you?`, isUser: false, date: new Date('2023-06-18T12:01:00')},
        {text: `I’m fine too, thanks for asking!`, isUser: true, date: new Date('2023-06-19T09:15:00')}
    ];

    lastMessageDate = ''; // Reset the last message date

    dummyMessages.forEach((msg) => {
        const messageDate = msg.date.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});

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
        messageContentElement.textContent = msg.text;

        const timestampElement = document.createElement('span');
        timestampElement.className = 'message-timestamp';
        timestampElement.textContent = msg.date.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});

        messageContentElement.appendChild(timestampElement);
        messageElement.appendChild(messageContentElement);
        messagesContainer.appendChild(messageElement);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Save the selected user's info in local storage
    localStorage.setItem('lastChatUser', JSON.stringify({userName, userTitle, userPicture, userProfileLink}));
}

function loadLastChatUser() {
    const lastChatUser = localStorage.getItem('lastChatUser');
    if (lastChatUser) {
        const {userName, userTitle, userPicture, userProfileLink} = JSON.parse(lastChatUser);
        selectUser(userName, userTitle, userPicture, userProfileLink);
    } else {
        // Select the top user in the chat sidebar if no last chat user is found
        const topUserElement = document.querySelector('.chat-sidebar-user');
        if (topUserElement) {
            topUserElement.click();
        }
    }
}
