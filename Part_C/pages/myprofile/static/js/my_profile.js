
    document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to the Edit About Me button
    document.getElementById('edit-about-me-btn').addEventListener('click', function () {
        document.getElementById('edit-about-me-modal').style.display = 'block';
    });
});

    function editSection(sectionId) {
    const modal = document.getElementById('editModal');
    const modalFields = document.getElementById('modal-fields');
    modal.style.display = 'flex';

    if (sectionId === 'top-section') {
    // Set the fields for top-section
    modalFields.innerHTML = `
            <label for="firstName">First Name:</label>
            <input type="text" id="firstName" name="firstName" required>
            
            <label for="lastName">Last Name:</label>
            <input type="text" id="lastName" name="lastName" required>
            
            <label for="position">Position:</label>
            <input type="text" id="position" name="position" required>
            
            <label for="profilePicture">Profile Picture:</label>
            <input type="file" id="profilePicture" name="profilePicture">>
        `;


} else if (sectionId === 'links') {
    // Set the fields for links
    modalFields.innerHTML = `
            <label for="linkedin">LinkedIn:</label>
            <input type="url" id="linkedin" name="linkedin" required>
            
            <label for="github">GitHub:</label>
            <input type="url" id="github" name="github" required>
            
            <label for="facebook">Facebook:</label>
            <input type="url" id="facebook" name="facebook" required>
        `;


}
    else if (sectionId === 'about') {
    // Set the fields for about section
    modalFields.innerHTML = `
        <label for="aboutMe">About Me:</label>
        <textarea id="aboutMe" name="aboutMe" required></textarea>
    `;
    }
    else if (sectionId === 'projects') {
    // Fetch and display projects
    fetch('/get_projects')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                let projectsHtml = '<ul>';
                data.projects.forEach(project => {
                    projectsHtml += `
                        <div class="project-item">
                            <span class="project-title">${project.title}</span>
                            <button class="delete-project-button" data-project-id="${project._id}">X</button>
                        </div>
                    `;
                });
                projectsHtml += '</div>';
                modalFields.innerHTML = projectsHtml;

                // Add event listeners to delete buttons
                document.querySelectorAll('.delete-project-button').forEach(button => {
                    button.addEventListener('click', function () {
                        const projectId = this.dataset.projectId;
                        fetch('/delete_project', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ projectId: projectId })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === 'success') {
                                alert('Project deleted successfully');
                                // Remove the project from the list
                                this.parentElement.remove();
                            } else {
                                alert('Error deleting project: ' + data.message);
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('An error occurred while deleting the project');
                        });
                    });
                });
            } else {
                alert('Error fetching projects: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while fetching the projects');
        });
}
    else if (sectionId === 'background') {
    // Fetch organizations to populate the dropdown
    fetch('/get_organizations')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                let orgOptions = '';
                data.organizations.forEach(org => {
                    orgOptions += `<option value="${org.org_name}">${org.org_name}</option>`;
                });

                modalFields.innerHTML = `
                    <label for="type">Type:</label>
                    <select id="type" name="type" required>
                        <option value="experience">Experience</option>
                        <option value="education">Education</option>
                    </select>
                    
                    <label for="organization">Organization:</label>
                    <select id="organization" name="organization" required>
                        ${orgOptions}
                    </select>
                    
                    <label for="position">Position/Description:</label>
                    <input type="text" id="position" name="position" required>
                    
                    <label for="period">Period:</label>
                    <input type="text" id="period" name="period" required>
                `;

                // Add the sectionId as a hidden input field
                modalFields.innerHTML += `<input type="hidden" name="sectionId" value="${sectionId}">`;

                // Add the sectionId to the modal form to send it on submit
                document.getElementById('editForm').dataset.sectionId = sectionId;
            } else {
                alert('Error fetching organizations: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while fetching the organizations');
        });
}



    // Add the sectionId to the modal form to send it on submit
    document.getElementById('editForm').dataset.sectionId = sectionId;
}

    function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

    document.getElementById('editForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const sectionId = event.target.dataset.sectionId;
    const formData = new FormData();

    if (sectionId === 'top-section') {
    formData.append('firstName', document.getElementById('firstName').value);
    formData.append('lastName', document.getElementById('lastName').value);
    formData.append('position', document.getElementById('position').value);
    const profilePicture = document.getElementById('profilePicture').files[0];
    if (profilePicture) {
        formData.append('profilePicture', profilePicture);
    }
    } else if (sectionId === 'links') {
    formData.append('linkedin', document.getElementById('linkedin').value);
    formData.append('github', document.getElementById('github').value);
    formData.append('facebook', document.getElementById('facebook').value);
}
    else if (sectionId === 'about') {
    formData.append('aboutMe', document.getElementById('aboutMe').value);
}
    else if (sectionId === 'background') {
    formData.append('type', document.getElementById('type').value);
    formData.append('organization', document.getElementById('organization').value);
    formData.append('position', document.getElementById('position').value);
    formData.append('period', document.getElementById('period').value);
}


    formData.append('sectionId', sectionId);
    fetch('/update_profile', {
    method: 'POST',
    body: formData,
})
    .then(response => response.json())
    .then(data => {
    if (data.status === 'success') {
    alert('Profile updated successfully');
    closeModal();

    // Update the UI with the new data
    if (sectionId === 'top-section') {
    document.querySelector('#top-section .my-details h1').textContent = data.first_name + ' ' + data.last_name;
    document.querySelector('#top-section .my-details h3').textContent = data.role;
} else if (sectionId === 'links') {
    const linkedinElement = document.querySelector('#links a[href*="linkedin"]');
    const githubElement = document.querySelector('#links a[href*="github"]');
    const facebookElement = document.querySelector('#links a[href*="facebook"]');

    if (linkedinElement) linkedinElement.href = data.linkedin;
    if (githubElement) githubElement.href = data.github;
    if (facebookElement) facebookElement.href = data.facebook;
}
    else if (sectionId === 'about') {
    document.querySelector('#about div').textContent = data.about_me;
}
} else {
    alert('Error updating profile: ' + data.message);
}
})
    .catch(error => {
    console.error('Error:', error);
    alert('An error occurred while updating the profile');
});
});

