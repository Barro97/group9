"use strict";
const followButton = document.getElementById("follow-button");
const followCount = document.querySelector(".follow-count");
let isFollowing = ''

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOMContentLoaded");
    checkFollow()
    followButton.addEventListener("click", function () {
        if (isFollowing) {
            unfollow()
        } else {
            follow()
        }
    });
});

function updateUI(){
    isFollowing? followingUI():notFollowingUI()
}
function followingUI(){
    followButton.textContent = "Following";
    followButton.classList.add("pressed");

}

function notFollowingUI(){
    followButton.textContent = "+ Follow";
    followButton.classList.remove("pressed");
}

async function checkFollow() {
    try {
        let response = await fetch('/check_for_following');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        let data = await response.json();
        isFollowing = data.isFollowing;
        updateUI()
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

function unfollow(){
    // UnFollow logic
            fetch('/unfollow')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    isFollowing = false;
                    updateUI()
                    followCount.textContent = `Followers: ${!data.count ? '0' : data.count}`;
                }
            });
}

function follow(){
    // Follow logic
            fetch('/follow')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    isFollowing = true;
                    updateUI()
                    followCount.textContent = `Followers: ${data.count}`;
                }
            });
}