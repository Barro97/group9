"use strict";
const user = localStorage.getItem("activeUser");
const nav = document.querySelector(".nav");
console.log(user);
if (!user) {
    nav.parentElement.removeChild(nav);
}
