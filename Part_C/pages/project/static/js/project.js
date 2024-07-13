// Function to get time string
function getTimeString(date) {
    const now = new Date();
    const elapsed = now - date;

    if (elapsed < 60 * 1000) { // Less than 1 minute
        return 'Just now';
    } else if (elapsed < 60 * 60 * 1000) { // Less than 1 hour
        const minutes = Math.floor(elapsed / (60 * 1000));
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (elapsed < 24 * 60 * 60 * 1000) { // Less than 1 day
        const hours = Math.floor(elapsed / (60 * 60 * 1000));
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else { // 1 day or more
        const days = Math.floor(elapsed / (24 * 60 * 60 * 1000));
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Function to update the elapsed time for all comments
    function updateCommentTimes() {
        const commentTimes = document.querySelectorAll('.comment-time');
        commentTimes.forEach(commentTime => {
            const commentDate = new Date(commentTime.getAttribute('data-time'));
            commentTime.textContent = getTimeString(commentDate);
        });
    }

    // Initial call to set the times
    updateCommentTimes();

    // Call updateCommentTimes periodically (every minute)
    setInterval(updateCommentTimes, 60 * 1000);
});

// Managing the like button functionality
document.addEventListener('DOMContentLoaded', function () {
    const likeButton = document.querySelector('.like-button');
    const likeCount = document.querySelector('.like-count');

    // Initialize the like count from server data
    let likes = parseInt(likeCount.textContent);

    // Flag to keep track of the like state
    let liked = false;

    likeButton.addEventListener('click', function () {
        if (liked) {
            likes--;
            liked = false;
            likeButton.classList.remove('pressed');
        } else {
            likes++;
            liked = true;
            likeButton.classList.add('pressed');
        }
        likeCount.textContent = likes;

        // Ideally, you would also send a request to the server to update likes
        // This is a client-side only approach for demonstration purposes
    });
});

// The functionality for submitting new comments
document.addEventListener('DOMContentLoaded', function () {
    const commentForm = document.querySelector('.comment-form');
    const commentList = document.querySelector('.comment-list');
    const textarea = commentForm.querySelector('textarea');

    commentForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent form submission

        const commentText = textarea.value.trim();

        if (commentText === '') {
            return; // If comment is empty, do nothing
        }

        // Send comment data to the server via fetch or XMLHttpRequest
        fetch(commentForm.getAttribute('action'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(new FormData(commentForm))
        })
        .then(response => {
            if (response.ok) {
                return response.json(); // Assuming server responds with JSON
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            // Assuming server responds with the new comment data
            const newComment = document.createElement('div');
            newComment.classList.add('comment');
            newComment.innerHTML = `
                <div class="profile-picture">
                    <a href="/profile/${data.user_id}">
                        <img src="${data.user_picture_url}" alt="User Profile">
                    </a>
                </div>
                <div class="comment-details">
                    <div class="user-name">${data.user_name}</div>
                    <div class="comment-content">${sanitizeHTML(data.content)}</div>
                    <div class="comment-time" data-time="${data.timestamp}">${getTimeString(new Date(data.timestamp))}</div>
                </div>
            `;
            commentList.prepend(newComment);

            // Clear textarea after submission
            textarea.value = '';

            // Update comment times after new comment is added
            updateCommentTimes();
        })
        .catch(error => {
            console.error('Error adding comment:', error);
            // Handle error condition if necessary
        });
    });

    // Listen for the Enter key to submit the form
    textarea.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            commentForm.dispatchEvent(new Event('submit'));
        }
    });

    // Sanitize HTML helper function (prevents XSS)
    function sanitizeHTML(string) {
        const temp = document.createElement('div');
        temp.textContent = string;
        return temp.innerHTML;
    }
});

