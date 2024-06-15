document.addEventListener('DOMContentLoaded', (event) => {
    const messageInput = document.getElementById('message-input');
    const fileInput = document.getElementById('file-input');
    const chatMessages = document.querySelector('.chat-messages');

    // Auto-resize the textarea
    messageInput.addEventListener('input', (e) => {
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

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const fileInput = document.getElementById('file-input');
    const messagesContainer = document.getElementById('chat-messages');
    const messageText = messageInput.value.trim();
    const files = fileInput.files;

    if (messageText === '' && files.length === 0) return;

    const messageElement = document.createElement('div');
    messageElement.className = 'message user';

    if (messageText !== '') {
        const messageContentElement = document.createElement('div');
        messageContentElement.className = 'message-content';
        messageContentElement.textContent = messageText;
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
        };

        fileReader.readAsDataURL(file);
        messageElement.appendChild(fileElement);
    }

    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    messageInput.value = '';
    messageInput.style.height = 'auto';
    fileInput.value = '';

    setTimeout(() => {
        const responseElement = document.createElement('div');
        responseElement.className = 'message';

        const responseContentElement = document.createElement('div');
        responseContentElement.className = 'message-content';
        responseContentElement.textContent = `Response to "${messageText}"`;

        responseElement.appendChild(responseContentElement);
        messagesContainer.appendChild(responseElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000);
}

function selectUser(userName, userTitle, userPicture) {
    const chatHeader = document.querySelector('.chat-header');
    const messagesContainer = document.getElementById('chat-messages');
    const userNameElement = document.getElementById('user-name');
    const userTitleElement = document.getElementById('user-title');
    const userPictureElement = document.getElementById('user-picture');

    // Set the chat header to the selected user's name
    chatHeader.textContent = `Chat with ${userName}`;

    // Update user details in the user container
    userNameElement.textContent = userName;
    userTitleElement.textContent = userTitle;
    userPictureElement.src = userPicture;

    // Clear the current chat messages
    messagesContainer.innerHTML = '';

    // Load the chat messages for the selected user (dummy implementation)
    // In a real application, you would fetch this data from a server or a local data store
    const dummyMessages = [
        `Hello ${userName}, how are you?`,
        `I'm doing great, thanks! How about you?`
    ];

    dummyMessages.forEach((msg, index) => {
        const messageElement = document.createElement('div');
        messageElement.className = 'message' + (index % 2 === 0 ? ' user' : '');

        const messageContentElement = document.createElement('div');
        messageContentElement.className = 'message-content';
        messageContentElement.textContent = msg;

        messageElement.appendChild(messageContentElement);
        messagesContainer.appendChild(messageElement);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Save the selected user's info in local storage
    localStorage.setItem('lastChatUser', JSON.stringify({ userName, userTitle, userPicture }));
}

function loadLastChatUser() {
    const lastChatUser = localStorage.getItem('lastChatUser');
    if (lastChatUser) {
        const { userName, userTitle, userPicture } = JSON.parse(lastChatUser);
        selectUser(userName, userTitle, userPicture);
    }
}
