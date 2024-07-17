"use strict";
const user = JSON.parse(localStorage.getItem("activeUser"));
const followButton = document.getElementById("follow-button");
const followCount = document.querySelector(".follow-count");
let isFollowing = false;
document.addEventListener("DOMContentLoaded", function () {
    followButton.addEventListener("click", function () {
        const followeeId = document.getElementById("followee-id").value; // נניח שיש input עם id זה בפרופיל
        if (isFollowing) {
            // UnFollow logic
            fetch('/unfollow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ follower_id: user._id, followee_id: followeeId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    isFollowing = false;
                    followButton.textContent = "+ Follow";
                    followButton.classList.remove("pressed");
                    followCount.textContent = `Followers: ${parseInt(followCount.textContent.split(': ')[1]) - 1}`;
                }
            });
        } else {
            // Follow logic
            fetch('/follow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ follower_id: user._id, followee_id: followeeId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    isFollowing = true;
                    followButton.textContent = "Following";
                    followButton.classList.add("pressed");
                    followCount.textContent = `Followers: ${parseInt(followCount.textContent.split(': ')[1]) + 1}`;
                }
            });
        }
    });
});
