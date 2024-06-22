"use strict";
if (!localStorage.getItem("dontClear")) localStorage.clear(); // Doesn't clear storage if someone signed up, will be removed in part C

localStorage.setItem("activeUser", "");
const user1 = {
  // A fictive user
  firstName: "Rina",
  lastName: "Klinchuk",
  email: "rinak@post.bgu.ac.il",
  phoneNumber: "0547662193",
  dob: {
    day: "11",
    month: "10",
    year: "1997",
  },
  country: "Israel",
  city: "Rehovot",
  password: "poipoi9",
  follows: [],
  posts: [],
  pic: "https://cdn-icons-png.flaticon.com/512/6833/6833605.png",
};

if (!JSON.parse(localStorage.getItem("users"))) {
  // Add fictive user user if no users exist yet
  localStorage.setItem("users", JSON.stringify([]));
  const usersArr = JSON.parse(localStorage.getItem("users"));
  usersArr.push(user1); // add fictive user to users
  localStorage.setItem("users", JSON.stringify(usersArr));
}

document.addEventListener("DOMContentLoaded", () => {
  // Attach event listeners after DOM is loaded
  const form = document.querySelector(".login-form");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form); // Using the FormData API for easier form reading

    const users = JSON.parse(localStorage.getItem("users")) || []; //Either return existing users or an empty array
    const user = users.find(
      // Go over users array and try to find the user that is trying to log in. return true or false
      (user) =>
        user.email === formData.get("email") &&
        user.password === formData.get("password")
    );

    if (user) {
      // If user was found
      localStorage.setItem("activeUser", JSON.stringify(user)); // Set as the active user
      // alert("Logged in successfully!");
      window.location.href = "home.html"; // Redirect to home page
    } else {
      alert("Invalid email or password.");
    }
  });
});

console.log(localStorage.getItem("activeUser"));
