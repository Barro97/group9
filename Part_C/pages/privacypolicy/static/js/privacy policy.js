"use strict";
const user = localStorage.getItem("activeUser");
const nav = document.querySelector(".nav");
if (!user) {
    nav.parentElement.removeChild(nav);
}
