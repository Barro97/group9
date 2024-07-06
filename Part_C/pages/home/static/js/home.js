"use strict";
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

// Event listener for DOMContentLoaded to initialize the page when the document is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    initPage(); // Call initPage function to set up the page
});

// Function to initialize the page
function initPage() {
    // initiateSteve();
    // initUser();
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

// Function to initialize the user interface with the active user's details
// function initUser() {
//     userPostBox.querySelector("img").src = user.pic; // Set the user's profile picture
//     userPostBox.querySelector(
//         "textarea"
//     ).placeholder = `What's on your mind, ${user.firstName}?`; // Set the placeholder text in the textarea
// }

// Function to create a new post and add it to the posts container
function createPost(user, postsContainer) {
    let postContent = "";

    postContent = document.querySelector("textarea").value.trim(); // Get the text from the textarea and trim whitespace

    if (!postContent) {
        alert("Please enter some text to post.");
        return; // Exit the function if no content
    }
    const newPost = createPostElement(user, postContent);
    postsContainer.insertBefore(newPost, postsContainer.firstChild);

    const post = {
        content: postContent,
        likes: {amount: 0, users: []},
        comments: {amount: 0, list: []},
        shares: {amount: 0, users: []},
    };
    user.posts.push(post); // Add the new post to the user's posts

    attachBtns(newPost, user, post); // Attach buttons for likes, comments, and shares to the new post

    document.querySelector("textarea").value = ""; // Clear the textarea
}

// Function just to make the example post work
// function initiateSteve() {
//     const post = postsContainer.querySelector(".post-box");
//     const stevePost = {
//         content: "",
//         likes: {amount: 0, users: []},
//         comments: {amount: 0, list: []},
//         shares: {amount: 0, users: []},
//     };
//     attachBtns(post, user, stevePost);
// }

// Function to attach buttons for likes, comments, shares, and modals to a post
function attachBtns(newPost, user, post) {
    attachLikeButtonFunctionality(newPost, user, post);
    attachCommentButtonFunctionality(newPost, user, post);
    attachShareButtonFunctionality(newPost, user, post);
    attachLikesModalFunctionality(newPost, post);
    attachCommentsModalFunctionality(newPost, post);
    attachSharesModalFunctionality(newPost, post);
}

// Function to create a new post element based on user input and content
function createPostElement(user, postContent) {
    const newPost = document.createElement("div");
    let image = "";
    let proj = "";
    let share = "";
    if (uploadingImage) {
        // Check if an image is being uploaded
        image = document.querySelector(".up-img-container").innerHTML; // Get the HTML content of the uploaded image
        removeImageForUpload(); // Remove the image upload elements
    }
    if (uploadingProj) {
        // Check if a project is being uploaded
        proj = document.querySelector(".project-box").innerHTML; // Get the HTML content of the uploaded project
        removeProjectForUpload(); // Remove the project upload elements
    }
    if (sharingPost) {
        share = document.querySelector(".about-to-share").innerHTML; // Get the HTML content of the post to share
        removePostForShare(); // Remove the post sharing elements
    }
    newPost.className = "post-box"; // Assign the post-box class to the new post for better design
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
    return newPost; // Return the newly created post element
}

function attachLikeButtonFunctionality(newPost, user, post) {
    const likeButton = newPost.querySelector(".action-btn.like"); // Get the like button element
    likeButton.addEventListener("click", function () {
        if (!post.likes.users.some((usr) => usr.email === user.email)) {
            // Check if the user has not already liked the post
            post.likes.amount += 1; // Increment the like count
            newPost.querySelector(".like").textContent = `👍 ${post.likes.amount}`; // Update the like count display
            post.likes.users.push(user); // Add the user to the list of users who liked the post
        } else {
            // alert("You already liked this post"); // Alert if the user already liked the post
            post.likes.amount -= 1; // Decrement the like count
            newPost.querySelector(".like").textContent = `👍 ${post.likes.amount}`; // Update the like count display
            post.likes.users.pop(user); // remove the user from the list of users who liked the post
        }
    });
}

// Function to attach event listener for the comment button functionality
function attachCommentButtonFunctionality(newPost, user, post) {
    const commentButton = newPost.querySelector(".action-btn.comment"); // Get the comment button element
    commentButton.addEventListener("click", function () {
        if (tryingToComment) {
            // Check if a comment box is already present
            removeCommentBox(); // Remove the existing comment box
        } else {
            tryingToComment = true; // Set the flag to indicate a comment box is being added
            addCommentBox(newPost, user, post); // Add a new comment box
        }
    });
}

// Function to attach event listener for the share button functionality
function attachShareButtonFunctionality(newPost, user, post) {
    const shareButton = newPost.querySelector(".action-btn.share"); // Get the share button element
    shareButton.addEventListener("click", function (e) {
        if (sharingPost) {
            // Check if the user is already trying to share a post
            alert("you are already trying to share!"); // Alert if already sharing
        } else {
            const postToShare = e.target.closest(".post-box"); // Get the post box closest to the clicked share button
            preparePostToShare(postToShare); // Prepare the post for sharing
            userPostBox.scrollIntoView({behavior: "smooth"}); // Smooth scroll to the user post box
            sharingPost = true; // Set the flag to indicate a post is being shared
            post.shares.amount += 1; // Increment the share count
            newPost.querySelector(
                ".shares"
            ).textContent = `${post.shares.amount} Shares`; // Update the share count display
            post.shares.users.push(user); // Add the user to the list of users who shared the post
        }
    });
}

// Function to remove the post prepared for sharing
function removePostForShare() {
    const remove = userPostBox.querySelector(".about-to-share"); // Find the element marked for sharing
    remove.parentNode.removeChild(remove); // Remove the element from the DOM
}

// Function to prepare a post for sharing by adding it to the user post box
function preparePostToShare(postToShare) {
    const shareHeader = postToShare.querySelector(".post-header"); // Get the header of the post to share
    const shareContent = postToShare.querySelector(".post-content"); // Get the content of the post to share
    const postInput = userPostBox.querySelector(".post-input"); // Get the post input element
    const html = `<div class="about-to-share">
  <div class="post-header">${shareHeader.innerHTML}</div>
  <div class="post-content">${shareContent.innerHTML}</div>  
    </div>`;
    postInput.insertAdjacentHTML("afterend", html); // Insert the post to share after the post input
}

// Function to add a comment box below a post
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
    newPost.insertAdjacentHTML("afterend", commentBoxHTML); // Insert the comment box HTML after the new post

    const commentBox = document.querySelector(".comment-box"); // Get the newly added comment box
    commentBox
        .querySelector(".post-comment")
        .addEventListener("click", function () {
            const commentText = document
                .querySelector(".comment-input textarea")
                .value.trim(); // Get the text entered in the comment box and trim whitespace
            if (commentText) {
                // Check if there is any text to post
                post.comments.amount += 1; // Increment the comment count
                newPost.querySelector(
                    ".comments"
                ).textContent = `${post.comments.amount} Comments`; // Update the comment count display
                post.comments.list.push({commenter: user, text: commentText}); // Add the new comment to the post's comment list
                removeCommentBox(); // Remove the comment box after posting
            } else {
                alert("Please enter some text to post."); // Alert the user if no text was entered
            }
        });
}

// Function to remove the comment box from the DOM
function removeCommentBox() {
    const commentBox = document.querySelector(".comment-box"); // Get the comment box element
    commentBox.parentNode.removeChild(commentBox); // Remove the comment box from the DOM
    tryingToComment = false; // Update the flag to indicate no comment box is present
}

// Function to attach event listener for image upload
function attachImageUploadFunctionality() {
    UploadImageBtn.addEventListener("click", function () {
        if (uploadingImage) {
            // Check if an image is already being uploaded
            removeImageForUpload(); // Remove the image upload elements
            uploadingImage = false; // Flag updated
        } else {
            fileInput.click(); // Trigger the file input click event to open the file selection dialog
        }
    });
}

// Function to attach event listener for file selection
function attachFileSelectionFunctionality() {
    fileInput.addEventListener("change", function (e) {
        const files = e.target.files; // Get the selected files
        let imgUrl = "";
        if (files.length > 0) {
            // Check if any file is selected
            const file = files[0]; // Get the first selected file
            imgUrl = URL.createObjectURL(file); // Create a URL for the selected file
            prepareImageForUpload(imgUrl); // Prepare the image for upload using the URL
        }
    });
}

// Function to display the image that is about to be uploaded in user post box
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
        post.comments.list.forEach(({commenter, text}) => {
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
