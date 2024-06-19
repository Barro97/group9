"use strict";
const user = JSON.parse(localStorage.getItem("activeUser"));
const postButton = document.getElementById("post-button");
const postsContainer = document.querySelector(".all-posts");
let tryingToComment = false;

// postsContainer.innerHTML = "";

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

    // Attach comment button functionality
    const commentButton = newPost.querySelector(".action-btn.comment");
    commentButton.addEventListener("click", function () {
      if (tryingToComment === true) {
        // alert("You are already trying to comment!")
        removeCommentBox();
      } else {
        tryingToComment = true;
        const html = `<div class="comment-box">
            <div class="post-input comment-input">
              <img
                src="https://www.creativefabrica.com/wp-content/uploads/2023/05/23/Bearded-man-avatar-Generic-male-profile-Graphics-70342414-1-1-580x387.png"
                alt="User Avatar"
                class="avatar"
              />
              <textarea placeholder="Insert comment here"></textarea>
            </div>
            <button class="option-btn post-comment" >post</button>
          </div>`;

        newPost.insertAdjacentHTML("afterend", html);

        const commentBox = document.querySelector(".comment-box");
        const postComment = commentBox.querySelector(".post-comment");
        postComment.addEventListener("click", function () {
          const comment = document.querySelector(
            ".comment-input textarea"
          ).value;
          const commentCountSpan = newPost.querySelector(".comments");

          if (!comment) {
            alert("Please enter some text to post.");
          } else {
            post.comments.amount += 1;
            commentCountSpan.textContent = `${post.comments.amount} Comments`;
            post.comments.list.push({ commenter: user, text: comment });
            removeCommentBox();
          }
        });
      }
    });

    // Clear the textarea after posting
    document.querySelector("textarea").value = "";
  });
});

const removeCommentBox = function () {
  const remove = document.querySelector(".comment-box");
  remove.parentNode.removeChild(remove);
  tryingToComment = false;
};
