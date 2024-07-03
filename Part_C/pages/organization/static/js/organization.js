document.addEventListener('DOMContentLoaded', function () {
    const followButton = document.querySelector('.follow-button');
    let isFollowing = false;
    let followerCount = 23000; // Initial follower count, adjust as needed

    updateFollowerCount(); // Update initial follower count display

    followButton.addEventListener('click', function () {
        if (isFollowing) {
            // Unfollow logic
            isFollowing = false;
            followButton.textContent = '+ Follow';
            followerCount -= 1; // Decrease follower count
            followButton.classList.remove('pressed');

        } else {
            // Follow logic
            isFollowing = true;
            followButton.textContent = 'Following';
            followerCount += 1; // Increase follower count
            followButton.classList.add('pressed');

        }

        updateFollowerCount(); // Update follower count display
    });

    function updateFollowerCount() {
        const followerCountFormatted = formatFollowerCount(followerCount);
        const followerCountElement = document.getElementById('follower-count');
        if (followerCountElement) {
            followerCountElement.textContent = `${followerCountFormatted} followers`;
        }
    }

    function formatFollowerCount(count) {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        } else {
            return count;
        }
    }
});
