"use strict";
const user = JSON.parse(localStorage.getItem("activeUser"));
console.log(user);
const postButton = document.getElementById("post-button");
const postsContainer = document.querySelector(".all-posts");

postsContainer.innerHTML = "";

document.addEventListener("DOMContentLoaded", function () {
  postButton.addEventListener("click", function (e) {
    e.preventDefault();

    // Get the value of the textarea
    const postContent = document.querySelector("textarea").value;

    if (postContent.trim() === "") {
      alert("Please enter some text to post.");
      return;
    }

    // Create a new post element
    const newPost = document.createElement("div");
    newPost.className = "post-box";
    console.log(user.pic);

    // Set up the inner HTML of the new post
    newPost.innerHTML = `
        <div class="post-header">
          <img
            src="${user.pic}"
            alt="Profile Picture"
            class="profile-pic"
          />
          <div class="post-info">
            <div class="user-name">${user.firstName} ${user.lastName}</div>
            <div class="post-time">Just now</div>
          </div>
        </div>
        <div class="post-content">
          <p>${postContent}</p>
        </div>
        <div class="post-footer">
          <div class="reaction-bar">
            <span class="like">👍 0</span>
            <span class="comments">0 Comments</span>
            <span class="shares">0 Shares</span>
          </div>
          <div class="action-buttons">
            <button class="action-btn like">
              <div class="action-Type">Like</div>
              <i class="fi-post fi-rr-social-network"></i>
            </button>
            <button class="action-btn comment">
              <div class="action-Type">Comment</div>
              <i class="fi-post fi-rr-comment-alt"></i>
            </button>
            <button class="action-btn share">
              <div class="action-Type">Share</div>
              <i class="fi-post fi-rr-share-square"></i>
            </button>
          </div>
        </div>
      `;

    // Append the new post to the posts container
    postsContainer.insertBefore(newPost, postsContainer.firstChild);

    //Create new post object
    const post = {
      content: postContent,
      likes: { amount: 0, users: [] },
      comments: {
        amount: 0,
        list: [],
      },
      shares: 0,
    };
    user.posts.push(post);

    // Attach like button functionality
    const likeButton = newPost.querySelector(".action-btn.like");
    likeButton.addEventListener("click", function () {
      let didLike = false;
      post.likes.users.forEach((usr) => {
        console.log(usr);
        if (usr.email === user.email) didLike = true;
      });

      if (didLike === false) {
        const likeCountSpan = newPost.querySelector(".like");
        post.likes.amount += 1;
        likeCountSpan.textContent = `👍 ${post.likes.amount}`;
        post.likes.users.push(user);
      } else {
        alert("You already liked this post");
      }
    });
    // Clear the textarea after posting
    document.querySelector("textarea").value = "";
  });
});
