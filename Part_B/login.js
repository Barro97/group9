"use strict";

localStorage.clear(); //remove later!

const user1 = {
  // a fictive user
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
console.log(user1.pic);

if (!JSON.parse(localStorage.getItem("users"))) {
  localStorage.setItem("users", JSON.stringify([]));
  const usersArr = JSON.parse(localStorage.getItem("users"));
  usersArr.push(user1);
  localStorage.setItem("users", JSON.stringify(usersArr));
}
console.log(JSON.parse(localStorage.getItem("users")));

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".login-form");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form); // Using the FormData API for easier form reading

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(
      (user) =>
        user.email === formData.get("email") &&
        user.password === formData.get("password")
    );

    if (user) {
      localStorage.setItem("activeUser", JSON.stringify(user));
      // alert("Logged in successfully!");
      window.location.href = "home.html"; // Redirect to a dashboard or home page
    } else {
      alert("Invalid email or password.");
    }
  });
});
