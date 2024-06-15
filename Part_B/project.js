 document.addEventListener('DOMContentLoaded', function() {
        const likeButton = document.querySelector('.like-button');
        const likeCount = document.querySelector('.like-count');

        // Initialize the like count to 100
        let likes = 100;
        likeCount.textContent = likes;

        // Flag to keep track of the like state
        let liked = false;

        likeButton.addEventListener('click', function() {
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