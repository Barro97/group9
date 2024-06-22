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

let tryingToComment = false;
let uploadingImage = false;
let uploadingProj = false;
let sharingPost = false;

document.addEventListener("DOMContentLoaded", function () {
  initiateSteve();
  attachImageUploadFunctionality();
  attachProjectUploadFunctionality();
  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
  postButton.addEventListener("click", function (e) {
    e.preventDefault();
    createPost(user, postsContainer);
  });
});

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
                    <i class="fi-post fi-rr-social-network"></i>
                </button>
                <button class="action-btn comment">
                    <div class="action-type">Comment</div>
                    <i class="fi-post fi-rr-comment-alt"></i>
                </button>
                <button class="action-btn share">
                    <div class="action-type">Share</div>
                    <i class="fi-post fi-rr-share-square"></i>
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
                <img src="https://www.creativefabrica.com/wp-content/uploads/2023/05/23/Bearded-man-avatar-Generic-male-profile-Graphics-70342414-1-1-580x387.png"
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
      //   alert("You are already trying to upload an image!");
      removeImageForUpload();
      uploadingImage = false;
    } else {
      prepareImageForUpload();
    }
  });
}

function prepareImageForUpload() {
  const postInput = userPostBox.querySelector(".post-input");
  const html = `
  <div class="up-img-container"><img
            src="https://www.training.com.au/wp-content/uploads/science-stem-feature.png"
            alt="Picture To Upload"
            class="Upload-img"
          /></div>`;
  postInput.insertAdjacentHTML("afterend", html);
  uploadingImage = true;
}

function removeImageForUpload() {
  const remove = userPostBox.querySelector(".up-img-container");
  remove.parentNode.removeChild(remove);
}

function attachProjectUploadFunctionality() {
  UploadProjBtn.addEventListener("click", function () {
    if (uploadingProj) {
      removeProjectForUpload();
      uploadingProj = false;
    } else {
      prepareProjectForUpload();
    }
  });
}

function removeProjectForUpload() {
  const remove = userPostBox.querySelector(".project-box");
  remove.parentNode.removeChild(remove);
}

function prepareProjectForUpload() {
  const postInput = userPostBox.querySelector(".post-input");
  const html = `
        <div class="project-box">
                    <div class="project-content">
                      <div class="project-overlay"></div>
                      <div class="project-title">My new project</div>
                    </div>
                  </div>
                </div>`;
  postInput.insertAdjacentHTML("afterend", html);
  uploadingProj = true;
}

function attachLikesModalFunctionality(newPost, post) {
  const likes = newPost.querySelector(".like");
  likes.addEventListener("click", function () {
    content.innerHTML = "";
    post.likes.users.forEach((usr) => {
      userThatLiked(usr);
    });
    showModal();
  });
}

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
  content.insertAdjacentHTML("afterbegin", html);
}

function attachCommentsModalFunctionality(newPost, post) {
  const comments = newPost.querySelector(".comments");
  comments.addEventListener("click", function () {
    content.innerHTML = "";
    post.comments.list.forEach(({ commenter, text }) => {
      usersThatCommented(commenter, text);
    });
    showModal();
  });
}

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
  content.insertAdjacentHTML("afterbegin", html);
}
function showModal() {
  Modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

function closeModal() {
  Modal.classList.add("hidden");
  overlay.classList.add("hidden");
}

function attachSharesModalFunctionality(newPost, post) {
  const shares = newPost.querySelector(".shares");
  shares.addEventListener("click", function () {
    content.innerHTML = "";
    post.shares.users.forEach((usr) => {
      userThatLiked(usr); // Same function as the ones for likes
    });
    showModal();
  });
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
