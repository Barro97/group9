// Managing the like button functionality
document.addEventListener('DOMContentLoaded', function () {
    const likeButton = document.querySelector('.like-button');
    const likeCount = document.querySelector('.like-count');

    // Initialize the like count to 100
    let likes = 100;
    likeCount.textContent = likes;

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

        const now = new Date();
        const timeString = getTimeString(now); // Get time string (e.g., "Just now")

        // Create comment elements
        const newComment = document.createElement('div');
        newComment.classList.add('comment');

        newComment.innerHTML = `
            <div class="profile-picture">
                <a href="profile.html">
                    <img src="https://cdn-icons-png.flaticon.com/512/6833/6833605.png" alt="My Picture">
                </a>
            </div>
            <div class="comment-details">
                <div class="user-name">Rina Klinchuk</div>
                <div class="comment-content">${sanitizeHTML(commentText)}</div>
                <div class="comment-time" data-time="${now.toISOString()}">${timeString}</div>
            </div>
        `;

        // Add new comment to the top of the comment list
        commentList.prepend(newComment);

        // Clear textarea after submission
        textarea.value = '';
    });

    // Listen for the Enter key to submit the form
    textarea.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            commentForm.dispatchEvent(new Event('submit'));
        }
    });

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

    // Sanitize HTML helper function (prevents XSS)
    function sanitizeHTML(string) {
        const temp = document.createElement('div');
        temp.textContent = string;
        return temp.innerHTML;
    }

    // Function to update the elapsed time for all comments
    function updateCommentTimes() {
        const commentTimes = document.querySelectorAll('.comment-time');
        commentTimes.forEach(commentTime => {
            const commentDate = new Date(commentTime.getAttribute('data-time'));
            commentTime.textContent = getTimeString(commentDate);
        });
    }

    // Call updateCommentTimes periodically (every minute)
    setInterval(updateCommentTimes, 60 * 1000);

    // Initial call to set the times
    updateCommentTimes();
});
