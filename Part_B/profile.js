"use strict";
const user = JSON.parse(localStorage.getItem("activeUser"));
const followButton = document.getElementById("follow-button");
const followCount = document.querySelector(".follow-count");
let isFollowing = false;
document.addEventListener("DOMContentLoaded", function () {
    followButton.addEventListener("click", function () {
        console.log(isFollowing);
        if (isFollowing) {
            // UnFollow logic
            isFollowing = false;
            followButton.textContent = "+ Follow";
            followButton.classList.remove("pressed");
            followCount.textContent = `Followers: 0`;
        } else {
            // Follow logic
            isFollowing = true;
            followButton.textContent = "Following";
            followButton.classList.add("pressed");
            followCount.textContent = `Followers: 1`;
        }
    });
});
