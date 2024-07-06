"use strict";

// const user1 = {
//     // A fictive user
//     firstName: "Rina",
//     lastName: "Klinchuk",
//     email: "rinak@post.bgu.ac.il",
//     phoneNumber: "0547662193",
//     dob: {
//         day: "11",
//         month: "10",
//         year: "1997",
//     },
//     country: "Israel",
//     city: "Rehovot",
//     password: "poipoi9",
//     follows: [],
//     posts: [],
//     pic: "https://cdn-icons-png.flaticon.com/512/6833/6833605.png",
// };



document.addEventListener("DOMContentLoaded", () => {
    // Attach event listeners after DOM is loaded
    const form = document.querySelector(".login-form");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form); // Using the FormData API for easier form reading

         const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value; // Take the form data and create an object from it
        });

        try { // In case an error happens
            const response = await fetch('/check_user', { // Use the fetch api to call the "check_user" route
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formObject), // The form content
            });

            const result = await response.json(); // Receives the response from flask after backend logic
            if (result.success) {
                // Redirect to home page on successful login
                window.location.href = result.redirect;
            } else {
                // Show error message
                alert(result.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});

