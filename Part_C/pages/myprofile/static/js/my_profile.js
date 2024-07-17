
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
} else if (sectionId === 'links') {
    formData.append('linkedin', document.getElementById('linkedin').value);
    formData.append('github', document.getElementById('github').value);
    formData.append('facebook', document.getElementById('facebook').value);
}

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
} else {
    alert('Error updating profile: ' + data.message);
}
})
    .catch(error => {
    console.error('Error:', error);
    alert('An error occurred while updating the profile');
});
});

