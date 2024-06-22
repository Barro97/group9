"use strict";
const user = JSON.parse(localStorage.getItem("activeUser"));
const postButton = document.getElementById("post-button");
const postsContainer = document.querySelector(".all-posts");
const UploadImageBtn = document.querySelector(".image-upload");
const UploadProjBtn = document.querySelector(".proj");
const userPostBox = document.querySelector(".post-box");
const Modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const content = Modal.querySelector(".modal-content");
const closeBtn = document.querySelector(".close-modal");
const fileInput = document.getElementById("fileInput");
let tryingToComment = false;
let uploadingImage = false;
let uploadingProj = false;
let sharingPost = false;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
});

function initPage() {
  initiateSteve();
  initUser();
  attachImageUploadFunctionality();
  attachProjectUploadFunctionality();
  attachFileSelectionFunctionality();
  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
  postButton.addEventListener("click", function (e) {
    e.preventDefault();
    createPost(user, postsContainer);
  });
}

function initUser() {
  userPostBox.querySelector("img").src = user.pic;
  userPostBox.querySelector(
    "textarea"
  ).placeholder = `What's on your mind, ${user.firstName}?`;
}
function createPost(user, postsContainer) {
  let postContent = "";

  postContent = document.querySelector("textarea").value.trim();

  if (!postContent) {
    alert("Please enter some text to post.");
    return;
  }
  const newPost = createPostElement(user, postContent);
  postsContainer.insertBefore(newPost, postsContainer.firstChild);

  const post = {
    content: postContent,
    likes: { amount: 0, users: [] },
    comments: { amount: 0, list: [] },
    shares: { amount: 0, users: [] },
  };
  user.posts.push(post);

  attachBtns(newPost, user, post);

  document.querySelector("textarea").value = "";
}
function initiateSteve() {
  // Just to make the example post work
  const post = postsContainer.querySelector(".post-box");
  const stevePost = {
    content: "",
    likes: { amount: 0, users: [] },
    comments: { amount: 0, list: [] },
    shares: { amount: 0, users: [] },
  };
  attachBtns(post, user, stevePost);
}

function attachBtns(newPost, user, post) {
  attachLikeButtonFunctionality(newPost, user, post);
  attachCommentButtonFunctionality(newPost, user, post);
  attachShareButtonFunctionality(newPost, user, post);
  attachLikesModalFunctionality(newPost, post);
  attachCommentsModalFunctionality(newPost, post);
  attachSharesModalFunctionality(newPost, post);
}

function createPostElement(user, postContent) {
  const newPost = document.createElement("div");
  let image = "";
  let proj = "";
  let share = "";
  if (uploadingImage) {
    image = document.querySelector(".up-img-container").innerHTML;
    removeImageForUpload();
  }
  if (uploadingProj) {
    proj = document.querySelector(".project-box").innerHTML;
    removeProjectForUpload();
  }
  if (sharingPost) {
    share = document.querySelector(".about-to-share").innerHTML;
    removePostForShare();
  }
  newPost.className = "post-box";
  newPost.innerHTML = `
        <div class="post-header">
            <img src="${user.pic}" alt="Profile Picture" class="profile-pic" />
            <div class="post-info">
            <a href="profile.html"><div class="user-name">${user.firstName} ${
    user.lastName
  }</div></a>
                <div class="post-time">Just now</div>
            </div>
        </div>
        <div class="post-content">
            <p>${postContent}</p>
            ${
              uploadingImage
                ? `<div class="up-img-container">${image}</div>`
                : ""
            }
             ${
               uploadingProj
                 ? `<a href="project.html"><div class="project-box">${proj}</div></a>`
                 : ""
             }
             ${sharingPost ? `<div class="about-to-share">${share}</div>` : ""}
        </div>
        <div class="post-footer">
            <div class="reaction-bar">
                <span class="like">👍 0</span>
                <span class="comments">0 Comments</span>
                <span class="shares">0 Shares</span>
            </div>
            <div class="action-buttons">
                <button class="action-btn like">
                    <div class="action-type">Like</div>
                    <i class="fi fi-rr-social-network"></i>
                </button>
                <button class="action-btn comment">
                    <div class="action-type">Comment</div>
                    <i class="fi fi-rr-comment-alt"></i>
                </button>
                <button class="action-btn share">
                    <div class="action-type">Share</div>
                    <i class="fi fi-rr-share-square"></i>
                </button>
            </div>
        </div>`;
  uploadingImage = false;
  uploadingProj = false;
  sharingPost = false;
  return newPost;
}

function attachLikeButtonFunctionality(newPost, user, post) {
  const likeButton = newPost.querySelector(".action-btn.like");
  likeButton.addEventListener("click", function () {
    if (!post.likes.users.some((usr) => usr.email === user.email)) {
      post.likes.amount += 1;
      newPost.querySelector(".like").textContent = `👍 ${post.likes.amount}`;
      post.likes.users.push(user);
    } else {
      alert("You already liked this post");
    }
  });
}

function attachCommentButtonFunctionality(newPost, user, post) {
  const commentButton = newPost.querySelector(".action-btn.comment");
  commentButton.addEventListener("click", function () {
    if (tryingToComment) {
      removeCommentBox();
    } else {
      tryingToComment = true;
      addCommentBox(newPost, user, post);
    }
  });
}

function attachShareButtonFunctionality(newPost, user, post) {
  const shareButton = newPost.querySelector(".action-btn.share");
  shareButton.addEventListener("click", function (e) {
    if (sharingPost) {
      alert("you are already trying to share!");
    } else {
      const postToShare = e.target.closest(".post-box");
      preparePostToShare(postToShare);
      userPostBox.scrollIntoView({ behavior: "smooth" });
      sharingPost = true;
      post.shares.amount += 1;
      newPost.querySelector(
        ".shares"
      ).textContent = `${post.shares.amount} Shares`;
      post.shares.users.push(user);
    }
  });
}
function removePostForShare() {
  const remove = userPostBox.querySelector(".about-to-share");
  remove.parentNode.removeChild(remove);
}

function preparePostToShare(postToShare) {
  const shareHeader = postToShare.querySelector(".post-header");
  const shareContent = postToShare.querySelector(".post-content");
  const postInput = userPostBox.querySelector(".post-input");
  const html = `<div class="about-to-share">
  <div class="post-header">${shareHeader.innerHTML}</div>
  <div class="post-content">${shareContent.innerHTML}</div>  
    </div>`;
  postInput.insertAdjacentHTML("afterend", html);
}

function addCommentBox(newPost, user, post) {
  const commentBoxHTML = `
        <div class="comment-box">
            <div class="post-input comment-input">
                <img src="${user.pic}"
                     alt="User Avatar" class="avatar" />
                <textarea placeholder="Insert comment here"></textarea>
            </div>
            <button class="option-btn post-comment">Post</button>
        </div>`;
  newPost.insertAdjacentHTML("afterend", commentBoxHTML);

  const commentBox = document.querySelector(".comment-box");
  commentBox
    .querySelector(".post-comment")
    .addEventListener("click", function () {
      const commentText = document
        .querySelector(".comment-input textarea")
        .value.trim();
      if (commentText) {
        post.comments.amount += 1;
        newPost.querySelector(
          ".comments"
        ).textContent = `${post.comments.amount} Comments`;
        post.comments.list.push({ commenter: user, text: commentText });
        removeCommentBox();
      } else {
        alert("Please enter some text to post.");
      }
    });
}

function removeCommentBox() {
  const commentBox = document.querySelector(".comment-box");
  commentBox.parentNode.removeChild(commentBox);
  tryingToComment = false;
}

function attachImageUploadFunctionality() {
  UploadImageBtn.addEventListener("click", function () {
    if (uploadingImage) {
      removeImageForUpload();
      // uploadingImage = false;
    } else {
      fileInput.click();
    }
  });
}

function attachFileSelectionFunctionality() {
  fileInput.addEventListener("change", function (e) {
    const files = e.target.files;
    let imgUrl = "";
    if (files.length > 0) {
      const file = files[0];
      imgUrl = URL.createObjectURL(file);
      prepareImageForUpload(imgUrl);
    }
  });
}

function prepareImageForUpload(url) {
  const postInput = userPostBox.querySelector(".post-input"); // Get the post input element
  const html = ` 
  <div class="up-img-container"><img
            src="${url}" 
            alt="Picture To Upload"
            class="Upload-img"
          /></div>`;
  postInput.insertAdjacentHTML("afterend", html); // Insert the image upload HTML including the uploaded picture after the post input
  uploadingImage = true; // Update the flag to indicate an image is being uploaded
}

// Function to remove image upload elements from the post box
function removeImageForUpload() {
  const remove = userPostBox.querySelector(".up-img-container"); // Find the image upload container
  remove.parentNode.removeChild(remove); // Remove the image upload container from the DOM
  fileInput.value = ""; // Clear the input file element for future uploads
}

// Function to attach event listener for project upload
function attachProjectUploadFunctionality() {
  UploadProjBtn.addEventListener("click", function () {
    if (uploadingProj) {
      // Check if a project is already being uploaded
      removeProjectForUpload(); // Remove the project upload elements
      uploadingProj = false; // Update the flag to indicate no project is being uploaded
    } else {
      prepareProjectForUpload(); // Update the UI for a new project upload
    }
  });
}

// Function to remove project upload elements from the post box
function removeProjectForUpload() {
  const remove = userPostBox.querySelector(".project-box"); // Find the project box element
  remove.parentNode.removeChild(remove); // Remove the project box from the DOM
}

// Function to add project upload elements to the post box
function prepareProjectForUpload() {
  const postInput = userPostBox.querySelector(".post-input"); // Get the post input element
  const html = `
        <div class="project-box">
                    <div class="project-content">
                      <div class="project-overlay"></div>
                      <div class="project-title">My new project</div>
                    </div>
                  </div>
                </div>`;
  postInput.insertAdjacentHTML("afterend", html); // Insert the project upload HTML after the post input
  uploadingProj = true; // Update the flag to indicate a project is being uploaded
}

// Function to attach event listener for likes modal
function attachLikesModalFunctionality(newPost, post) {
  const likes = newPost.querySelector(".like"); // Get the like element in the post
  likes.addEventListener("click", function () {
    content.innerHTML = ""; // Clear previous content in the modal
    post.likes.users.forEach((usr) => {
      userThatLiked(usr); // Display each user who liked the post
    });
    showModal(); // Show the modal with the list of users who liked the post
  });
}

// Function to attach event listener for shares modal
function attachSharesModalFunctionality(newPost, post) {
  const shares = newPost.querySelector(".shares"); // Get the shares element in the post
  shares.addEventListener("click", function () {
    content.innerHTML = ""; // Clear previous content in the modal
    post.shares.users.forEach((usr) => {
      userThatLiked(usr); // Same function as the ones for the likes, display each user who shared the post
    });
    showModal(); // Show the modal with the list of users who shared the post
  });
}

// Function to display the users who liked the post in the modal
function userThatLiked(user) {
  const html = `<div class="post-header">
      <img
        src="${user.pic}"
        alt="Profile Picture"
        class="profile-pic"
      />
      <div class="post-info">
        <div class="user-name">${user.firstName} ${user.lastName}</div>
        <div class="post-time">Just now</div>
      </div>
    </div>`;
  content.insertAdjacentHTML("afterbegin", html); // Insert the HTML for the user who liked
}

// Function to attach event listeners for displaying comments in a modal
function attachCommentsModalFunctionality(newPost, post) {
  const comments = newPost.querySelector(".comments"); // Get the comments section of the post
  comments.addEventListener("click", function () {
    content.innerHTML = ""; // Clear previous content in the modal
    post.comments.list.forEach(({ commenter, text }) => {
      usersThatCommented(commenter, text); // Add each comment to the modal
    });
    showModal(); // Show the modal with comments
  });
}

// Function to display the comment in the modal
function usersThatCommented(user, comment) {
  const html = `<div class="commenters">
  <div class="post-header commenter">
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
   <div class="comment-content"><p>${comment}</p></div>
   </div>`;
  content.insertAdjacentHTML("afterbegin", html); // Insert the HTML for the comment
}

// Function to show the modal and overlay
function showModal() {
  Modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

// Function to hide the modal and overlay
function closeModal() {
  Modal.classList.add("hidden");
  overlay.classList.add("hidden");
}
