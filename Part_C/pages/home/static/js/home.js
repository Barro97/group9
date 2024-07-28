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
const sentinel = document.getElementById('sentinel');
let tryingToComment = false;
let uploadingImage = false;
let uploadingProj = false;
let sharingPost = false;
let currentPage = 1;  // Track the current page number for posts
let user=''
let postBeingShared=''
let ImgBeingShared=''
let projectBeingShared=''


// Event listener for DOMContentLoaded to initialize the page when the document is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    fetch('/user').then((response) => response.json()).then((data) => {
    user=data.user; // recieve user data
    initPage(user); // Call initPage function to set up the page
    ;}).catch(error => console.log(error));
// Create a new IntersectionObserver instance
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Load the next page of posts when the sentinel comes into view
            loadPosts(currentPage,observer);
        }
    });
}, {
    rootMargin: '200px',  // Start loading before the sentinel is in the viewport
});

// Observe the sentinel element
observer.observe(sentinel);

// Initial load of posts
loadPosts(currentPage,observer);
});

function loadPosts(page,observer) {
      observer.unobserve(sentinel);
    fetch(`/show_posts?page=${page}`).then((response) => response.json()).then((data) => {
       const fragment = document.createDocumentFragment();
        data.posts.forEach(post => {

    createPostElement(post.user,post.content ,post).then(newPost => {
        attachBtns(newPost, post.user, post._id, post)
        fragment.appendChild(newPost);

    postsContainer.appendChild(fragment)

    })
        })
 // Increment the current page for the next load
            currentPage++;
observer.observe(sentinel);

    }).catch(error => console.log(error));

}

// Function to initialize the page
function initPage(user) {
    // initiateSteve();
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


// Function to create a new post and add it to the posts container
function createPost(user, postsContainer) {
    let postContent = "";

    postContent = document.querySelector("textarea").value.trim(); // Get the text from the textarea and trim whitespace

    if (!postContent) {
        alert("Please enter some text to post.");
        return; // Exit the function if no content
    }

     createPostElement(user, postContent).then(newPost => {
         postsContainer.insertBefore(newPost, postsContainer.firstChild);
     const post = {
        owner: user.email,
        content: postContent,
        DT: dateTime()
    };

      sendData(post).then(id=>{
        attachBtns(newPost, user, id); // Attach buttons for likes, comments, and shares to the new post
      }).catch(err=>{console.log(err)});
     })





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
function attachBtns(newPost, user, post,postObj='') {
    attachLikeButtonFunctionality(newPost, user, post);
    attachCommentButtonFunctionality(newPost, user, post);
    attachShareButtonFunctionality(newPost, user, post,postObj);
    attachLikesModalFunctionality(newPost, post);
    attachCommentsModalFunctionality(newPost, post);
    attachSharesModalFunctionality(newPost, post);
}

// Function to create a new post element based on user input and content
 async function createPostElement(user, postContent, post= {}) {
    const newPost = document.createElement("div");
    let image = "";
    let proj = "";
    let share = "";
    if (uploadingImage) {
        // Check if an image is being uploaded
        image = await setImage(ImgBeingShared)
        removeImageForUpload(); // Remove the image upload elements
    }
    if (uploadingProj) {
        // Check if a project is being uploaded
        // proj = document.querySelector(".project-box").innerHTML; // Get the HTML content of the uploaded project

        const projectData = await retrieveProj(projectBeingShared);
        proj = projectData.project;
        removeProjectForUpload(); // Remove the project upload elements
    }
    if (sharingPost) {
    sharebox()
        share=postBeingShared
} // Closing the if statement
    if ('share' in post){
        sharingPost=true
        share=post.share
    }
    if ('image' in post){
        uploadingImage=true
        image=await setImage(post.image)

    }

    if ('project' in post){
        const projectData = await retrieveProj(post.project);
        proj = projectData.project;
        uploadingProj=true

    }
    newPost.className = "post-box"; // Assign the post-box class to the new post for better design
    newPost.innerHTML = `
        <div class="post-header">
            <img src="${user.profile_picture}" alt="Profile Picture" class="profile-pic" />
            <div class="post-info">
            <a href="/profile/${user.email}"><div class="user-name">${user.first_name} ${
        user.last_name
    }</div></a>
                <div class="post-time">${!isObjectEmpty(post) ? post.DT : 'Just now'}</div>
            </div>
        </div>
        <div class="post-content">
            <p>${postContent}</p>
            ${
        uploadingImage
            ? `${createImage(image)}`
            : ""
    }
             ${
        uploadingProj
            ? `<a href="/project/${proj.project_id}">${displayProject(proj)}</a>`
            : ""
    }
             ${sharingPost ? `<div class="about-to-share">${share}</div>` : ""}
        </div>
        <div class="post-footer">
            <div class="reaction-bar">
                <span class="like">👍 ${!isObjectEmpty(post) ? post.likes : '0'}</span>
                <span class="comments">${!isObjectEmpty(post) ? post.comments : '0'} Comments</span>
                <span class="shares">${!isObjectEmpty(post) ? post.shares : '0'} Shares</span>
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

function attachLikeButtonFunctionality(newPost, user, id) {
    const likeButton = newPost.querySelector(".action-btn.like"); // Get the like button element
    likeButton.addEventListener("click", function () {
        const dataToSend = {id:id, DT:dateTime()}
       fetch('/create_like', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
    })
    .then(response => response.json()) // read the JSON from flask
    .then(data => {
        console.log(data.status);
            newPost.querySelector(".like").textContent = `👍 ${data.amount}`; // Update the like count display

    })
    .catch((error) => {
        console.error('Error:', error);
    });
})
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
            addCommentBox(newPost, post); // Add a new comment box
        }
    });
}

// Function to attach event listener for the share button functionality
function attachShareButtonFunctionality(newPost, user, post,postObj) {
    const shareButton = newPost.querySelector(".action-btn.share"); // Get the share button element
    shareButton.addEventListener("click", function (e) {
       let wasShared=false
        if (sharingPost) {
            // Check if the user is already trying to share a post
            alert("you are already trying to share!"); // Alert if already sharing
        } else {

            let postToShare = ''; // Get the post box closest to the clicked share button
            console.log(postObj)

            if(postObj){
                if(postObj.share){
                     postToShare = postObj.share
                    wasShared=true
                }
                else{
                    postToShare = e.target.closest(".post-box")
                }
            }
            preparePostToShare(postToShare,wasShared); // Prepare the post for sharing
            userPostBox.scrollIntoView({behavior: "smooth"}); // Smooth scroll to the user post box
            sharingPost = true; // Set the flag to indicate a post is being shared
            postBeingShared=post
            // newPost.querySelector(
            //     ".shares"
            // ).textContent = `${post.shares.amount} Shares`; // Update the share count display
        }
    });
}

// Function to remove the post prepared for sharing
function removePostForShare() {
    const remove = userPostBox.querySelector(".about-to-share"); // Find the element marked for sharing
    remove.parentNode.removeChild(remove); // Remove the element from the DOM
}

// Function to prepare a post for sharing by adding it to the user post box
function preparePostToShare(postToShare,wasShared=false) {
    let html = ''
    const postInput = userPostBox.querySelector(".post-input"); // Get the post input element
    if (wasShared) {
        html = `<div class="about-to-share">
            ${postToShare}  
            </div>`;
    } else {
    const shareHeader = postToShare.querySelector(".post-header"); // Get the header of the post to share
    const shareContent = postToShare.querySelector(".post-content"); // Get the content of the post to share
    html = `<div class="about-to-share">
            <div class="post-header">${shareHeader.innerHTML}</div>
            <div class="post-content">${shareContent.innerHTML}</div>  
            </div>`;
}
    postInput.insertAdjacentHTML("afterend", html); // Insert the post to share after the post input
const projectContent=document.querySelector(".project-content");
    if(projectContent){
        projectContent.style.width='170px'
    }
}

// Function to add a comment box below a post
function addCommentBox(newPost, post_id) {
    const commentBoxHTML = `
        <div class="comment-box">
            <div class="post-input comment-input">
                <img src="${user.profile_picture}"
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
                fetch('/create_comment', { // The "return" makes sure that this is not a void function and that an id value is returned
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: post_id, comment: commentText, DT: dateTime() })
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    newPost.querySelector(".comments").textContent = `${data.amount} Comments`; // Update the comment count display
                    removeCommentBox(); // Remove the comment box after posting
                })
                .catch(error => console.log(error));
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
            const formData = new FormData();
            formData.append('file', file);
            fetch('/upload_image', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json()).then(data => {
                ImgBeingShared=data.photo_id
                 console.log(ImgBeingShared)
                imgUrl = URL.createObjectURL(file); // Create a URL for the selected file
                 prepareImageForUpload(imgUrl); // Prepare the image for upload using the URL
             })

        }
    });
}

// Function to display the image that is about to be uploaded in user post box
function prepareImageForUpload(url) {
    const postInput = userPostBox.querySelector(".post-input"); // Get the post input element
    const html = createImage(url)
    postInput.insertAdjacentHTML("afterend", html); // Insert the image upload HTML including the uploaded picture after the post input
    uploadingImage = true; // Update the flag to indicate an image is being uploaded
}

function createImage(url){
    const html = ` 
  <div class="up-img-container"><img
            src="${url}" 
            alt="Picture To Upload"
            class="Upload-img"
          /></div>`;
    return html;
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
    content.innerHTML=''
    const html=`<div class="form-container">
        <h2>Submit Your Project</h2>
        <form id="projectForm" onsubmit="submitForm(event)" enctype="multipart/form-data">
            <div class="form-group">
                <label for="title">Project Title:</label>
                <input type="text" id="title" name="title" required>
            </div>
            <div class="form-group">
                <label for="description">Project Description:</label>
                <textarea id="description" name="description" required></textarea>
            </div>
            <div class="form-group">
                <label for="file">Upload File:</label>
                <input type="file" id="file" name="file">
            </div>
            <div class="form-group">
                <label for="photo">Upload Photo For Background :</label>
                <input type="file" id="photo" name="photo" accept="image/*">
            </div>
            <div class="form-group">
                <button type="submit">Submit</button>
            </div>
        </form>
    </div>`
    content.insertAdjacentHTML("afterbegin", html);
    showModal()
}
 function submitForm(event) {
            event.preventDefault(); // Prevent the default form submission
            const form = document.getElementById('projectForm');
            const formData = new FormData(form);

            fetch('/submit_project', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                      const postInput = userPostBox.querySelector(".post-input"); // Get the post input element
                      const html = displayProject(data)
                      postInput.insertAdjacentHTML("afterend", html); // Insert the project upload HTML after the post input
                      uploadingProj = true; // Update the flag to indicate a project is being uploaded
                      projectBeingShared=data.project_id
                    closeModal()
                } else {
                    alert('There was an error submitting the project.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
function displayProject(data){
    const html = `
                        <div class="project-box">
                        <div class="project-content" id="${data.project_id}">
                        <div class="project-overlay"></div>
                        <div class="project-title">${data.title}</div>
                        </div>
                        </div>
                        </div>`;
    const photoId = data.photo_id;
    setPhoto(photoId,data.project_id)
    return html
}
function setPhoto(photoId,project_id) {
     fetch(`/get_image/${photoId}` )
            .then(response => response.blob())
            .then(blob => {
                const projectContent = document.getElementById(`${project_id}`);

                const imgURL = URL.createObjectURL(blob);
                 // console.log('Image URL created:', imgURL);
                 projectContent.style.backgroundImage = `url(${imgURL})`;
            })
            .catch(error => console.error('Error fetching image:', error));
        }
// Function to attach event listener for likes modal
function attachLikesModalFunctionality(newPost, post_id) {
    const likes = newPost.querySelector(".like"); // Get the like element in the post
    likes.addEventListener("click", function () {
        content.innerHTML = ""; // Clear previous content in the modal

        // Fetch the list of users who liked the post
        fetch(`/${post_id}/likes`)
            .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
            .then(data => {
            console.log(data)
                // Iterate over each user in the response data
            data.users.forEach((user) => {
                // Call a function to handle displaying the user who liked the post
                userThatLiked(user);
            });
            showModal();
        })
            .catch(error => {
            console.log(error);
        });
    });

    }
async function setImage(photoId) {
    try {
        const response = await fetch(`/get_image/${photoId}`);
        const blob = await response.blob();
        const imgURL = URL.createObjectURL(blob);
        return imgURL;
    } catch (error) {
        console.error('Error fetching image:', error);
        throw error;
    }
}

// Function to attach event listener for shares modal
function attachSharesModalFunctionality(newPost, post_id) {
    const shares = newPost.querySelector(".shares"); // Get the shares element in the post
    shares.addEventListener("click", function () {
        content.innerHTML = ""; // Clear previous content in the modal
           // Fetch the list of users who liked the post
        fetch(`/${post_id}/shares`)
            .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
            .then(data => {
            console.log(data)
                // Iterate over each user in the response data
            data.users.forEach((user) => {
                // Call a function to handle displaying the user who liked the post
                userThatLiked(user.user);
            });
            showModal();
        })
            .catch(error => {
            console.log(error);
        });
    });
}

// Function to display the users who liked the post in the modal
function userThatLiked(user) {
    const html = `<div class="post-header">
      <img
        src="${user.profile_picture}"
        alt="Profile Picture"
        class="profile-pic"
      />
      <div class="post-info">
        <div class="user-name">${user.first_name} ${user.last_name}</div>
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
        fetch(`/${post}/comments`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.users) {
                    data.users.forEach((user) => {
                        usersThatCommented(user.user, user.comment);
                    });
                }
                showModal(); // Show the modal with comments
            })
            .catch(error => console.log(error));
    });
}


// Function to display the comment in the modal
function usersThatCommented(user, comment) {
    const html = `<div class="commenters">
  <div class="post-header commenter">
     <img
       src="${user.profile_picture}"
       alt="Profile Picture"
       class="profile-pic"
     />
     <div class="post-info">
       <div class="user-name">${user.first_name} ${user.last_name}</div>
       <div class="post-time">${comment.DT}</div>
     </div>
   </div>
   <div class="comment-content"><p>${comment.comment}</p></div>
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

 function sendData(post) {
    if (ImgBeingShared){
        post.image=ImgBeingShared
        ImgBeingShared=''
    }
    if(postBeingShared){
        console.log(postBeingShared)
        post.share=postBeingShared;
        postBeingShared=''
    }
    if(projectBeingShared){
        post.project=projectBeingShared;
        projectBeingShared=''
    }

    return fetch('/create_post', { // The "return" makes sure that this is not a void function and that an id value is returned
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(post)
    })
    .then(response => response.json()) // read the JSON from flask
    .then(data => {
        console.log('Success:', data.status);
        return data.id; // Return the new post's id for further button implementation
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function dateTime(){
    // Create a new Date object
const now = new Date();

// Get the current date and time components
const year = now.getFullYear();
const month = now.getMonth() + 1; // Months are zero-based (0-11), so add 1
const day = now.getDate();
const hours = now.getHours();
const minutes = now.getMinutes();
const seconds = now.getSeconds();
const milliseconds = now.getMilliseconds();

// Format the date and time as desired
const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

// Combine date and time
const formattedDateTime = `${formattedDate} ${formattedTime}`;

return formattedDateTime; // Outputs: YYYY-MM-DD HH:MM
}

function isObjectEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

async function sharebox() {
        let share_id=postBeingShared
        postBeingShared = document.querySelector(".about-to-share").innerHTML;; // Assuming you need the share ID from the response

    try {
        const response = await fetch('/create_share', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ shared: postBeingShared , shared_post_id: share_id })
        });

        const data = await response.json();
        console.log(data);
        console.log(postBeingShared)

        removePostForShare(); // Remove the post sharing elements
    } catch (error) {
        console.error('Error sharing the post:', error);
    }
}

async function retrieveProj(project_id){
    try {
        const response = await fetch(`/get_project/${project_id}`);

        const data = await response.json();
        return data
    } catch (error) {
        console.error('Error fetching the project:', error);
    }
}
