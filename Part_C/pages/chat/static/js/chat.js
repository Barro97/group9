document.getElementById('file-input').addEventListener('change', function () {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    if (file) {
        sendFile(file);
    }
});

document.getElementById('send-button').addEventListener('click', function () {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    if (message) {
        sendMessage(message);
    }
});

function sendFile(file) {
    const formData = new FormData();
    formData.append('sender_email', userEmail);
    formData.append('receiver_email', profileEmail);
    formData.append('file', file);

    fetch('/send_message', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'Message sent successfully!') {
            const reader = new FileReader();
            reader.onload = function (e) {
                appendMessage(`<img src="${e.target.result}" alt="${file.name}" class="chat-image" />`, userEmail, new Date().toISOString());
            };
            reader.readAsDataURL(file);

            // Clear the file input
            document.getElementById('file-input').value = '';
        } else {
            console.error('Error:', data.status);
        }
    })
    .catch(error => console.error('Error:', error));
}

function sendMessage(message) {
    const formData = new FormData();
    formData.append('sender_email', userEmail);
    formData.append('receiver_email', profileEmail);
    formData.append('message', message);

    fetch('/send_message', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'Message sent successfully!') {
            appendMessage(message, userEmail, new Date().toISOString());
            document.getElementById('message-input').value = '';
        } else {
            console.error('Error:', data.status);
        }
    })
    .catch(error => console.error('Error:', error));
}

function appendMessage(message, senderEmail, timestamp) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message ' + (senderEmail === userEmail ? 'user' : '');

    // Convert timestamp to local time (Israel time zone - GMT+3)
    const messageTime = new Date(timestamp);
    messageTime.setHours(messageTime.getHours() - 3); // Adjust for GMT+3

    // Calculate relative time
    const now = new Date();
    const diffTime = Math.abs(now - messageTime);
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    let timeAgo;
    if (diffMinutes < 60) {
        timeAgo = `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffMinutes < 1440) {
        const diffHours = Math.floor(diffMinutes / 60);
        timeAgo = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
        timeAgo = messageTime.toLocaleString(); // Fallback to full date-time
    }

    messageElement.innerHTML = `
        <div class="message-content">
            <p>${message.trim()}</p>
            <span class="message-timestamp">${timeAgo}</span>
        </div>
    `;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function fetchMessages() {
    fetch(`/fetch_messages?user_email=${userEmail}&profile_email=${profileEmail}`)
        .then(response => response.json())
        .then(data => {
            const chatMessages = document.getElementById('chat-messages');
            chatMessages.innerHTML = ''; // Clear existing messages

            data.messages.forEach(message => {
                appendMessage(message.message, message.sender_email, message.timestamp);
            });
        })
        .catch(error => console.error('Error:', error));
}

// Fetch messages every 5 seconds
setInterval(fetchMessages, 5000);

// Initial fetch
fetchMessages();

// Fetch latest chats
function fetchLatestChats() {
    fetch(`/latest_chats/${userEmail}`)
        .then(response => response.json())
        .then(data => {
            const chatSidebarUsers = document.getElementById('chat-sidebar-users');
            chatSidebarUsers.innerHTML = '';
            data.latest_chats.forEach(chat => {
                const userDiv = document.createElement('div');
                userDiv.className = 'chat-sidebar-user';
                userDiv.onclick = () => selectUser(chat.first_name + ' ' + chat.last_name, chat.role, chat.profile_picture, chat.email);

                const userImg = document.createElement('img');
                userImg.src = chat.profile_picture || 'default-profile.png'; // Fallback to a default image if no profile picture
                userImg.alt = chat.first_name + ' ' + chat.last_name;

                const userInfoDiv = document.createElement('div');
                userInfoDiv.className = 'chat-sidebar-user-info';

                const userNameDiv = document.createElement('div');
                userNameDiv.className = 'chat-sidebar-user-name';
                userNameDiv.innerText = chat.first_name + ' ' + chat.last_name;

                userInfoDiv.appendChild(userNameDiv);
                userDiv.appendChild(userImg);
                userDiv.appendChild(userInfoDiv);
                chatSidebarUsers.appendChild(userDiv);
            });
        })
        .catch(error => console.error('Error:', error));
}

// Fetch latest chats on load
fetchLatestChats();

function selectUser(name, role, profilePicture, email) {
    // Your logic to open chat with selected user
    console.log(`Selected user: ${name}, Role: ${role}, Email: ${email}`);
    // Example redirect:
    window.location.href = `/chatt/${userEmail}/${email}`;
}
