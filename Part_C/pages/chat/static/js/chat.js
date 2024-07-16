document.getElementById('send-button').addEventListener('click', function () {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();

    if (message) {
        fetch('/send_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'message': message,
                'sender_email': userEmail,
                'receiver_email': profileEmail
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'Message sent successfully!') {
                    // Append the message to the chat
                    appendMessage(message, userEmail, new Date().toISOString());

                    // Clear the input
                    messageInput.value = '';
                } else {
                    console.error('Error:', data.status);
                }
            })
            .catch(error => console.error('Error:', error));
    }
});

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
