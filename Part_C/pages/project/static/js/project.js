document.addEventListener('DOMContentLoaded', function () {
    const likeButton = document.querySelector('.like-button');
    const likeCount = document.querySelector('.like-count');
    const projectId = likeButton.getAttribute('data-project-id'); // Get the project ID from the attribute

    likeButton.addEventListener('click', function () {
        // Toggle the 'pressed' class for visual feedback
        likeButton.classList.toggle('pressed');

        // Send an AJAX request to Flask route to update likes
        fetch(`/project/${projectId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            // Update the like count based on server response
            likeCount.textContent = data.likes;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
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
