"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // We don't want the event listener to be added until the page is loaded
  const form = document.querySelector(".signup-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form); // Using the FormData API for easier form reading

    // Validate form data
    const validationErrors = validateFormData(formData); //Assign function
    if (validationErrors.length > 0) {
      alert(`Please fix the following errors:\n${validationErrors.join("\n")}`);
      return;
    }

    //  Successful form submission
    else {
      alert("Form submitted successfully!");
      const user = {
        firstName: formData.get("first-name"),
        lastName: formData.get("last-name"),
        email: formData.get("email"),
        phoneNumber: formData.get("phone-number"),
        dob: {
          day: formData.get("dob-day"),
          month: formData.get("dob-month"),
          year: formData.get("dob-year"),
        },
        country: formData.get("country"),
        city: formData.get("city"),
        password: formData.get("password"),
        follows: [],
        posts: [],
        pic: "https://www.creativefabrica.com/wp-content/uploads/2023/05/23/Bearded-man-avatar-Generic-male-profile-Graphics-70342414-1-1-580x387.png",
      };
      // Retrieve existing users array from localStorage
      let users = JSON.parse(localStorage.getItem("users")) || []; //Either an existing array of users or an empty array

      // Add the new user to the users array
      users.push(user);
      console.log(user);
      // Save the updated users array to localStorage
      localStorage.setItem("users", JSON.stringify(users));
      window.location.href = "login.html";
    }
  });

  function validateFormData(formData) {
    const errors = [];
    const password = formData.get("password");
    const verifyPassword = formData.get("verify-password");
    const day = formData.get("dob-day");
    const month = formData.get("dob-month");
    const year = formData.get("dob-year");
    const phone = formData.get("phone-number");
    const email = formData.get("email");

    // Make sure there are no empty fields
    if (!noEmptyValues(formData)) {
      errors.push("All form fields must be filled out");
    }

    // Validate email
    if (!isValidEmail(email)) {
      errors.push("Invalid email address.");
    }

    // Validate password
    if (password !== verifyPassword) {
      // We will create a better password security in part C using flask!
      errors.push("Passwords do not match.");
    } else if (password.length < 6) {
      errors.push("Password must be at least 6 characters long.");
    }

    // Validate fields that are suppose to by number only
    const correctNumbers = validateNumbers(day, month, year, phone);

    if (!correctNumbers) {
      errors.push("Date of birth or phone number should contain only numbers");
    }

    if (!validPhoneNumberLength(phone)) {
      errors.push("Phone number must be between 7 or 15 digits");
    }

    if (!validPhoneNumberBeginning(phone)) {
      errors.push("Phone number must start with 0!");
    }

    if (!validDate(day, month, year)) {
      errors.push("Invalid Date");
    }

    return errors;
  }

  function isValidEmail(email) {
    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
});

function onlyNumbers(numElement) {
  // If type conversion didn't succeed, it means that there is a digit that is not a number
  for (const digit of numElement) {
    let num = Number(digit);
    if (!num && num !== 0) return false;
  }
  return true;
}

function noEmptyValues(formData) {
  for (const [, value] of formData.entries()) {
    // checks for falsey value in each field
    if (!value) {
      return false;
    }
  }
  return true;
}

function validPhoneNumberLength(phoneNumber) {
  const length = phoneNumber.length;
  console.log(length);
  if (length < 7 || length > 15) return false;
  else return true;
}
function validPhoneNumberBeginning(phoneNumber) {
  console.log(phoneNumber);
  if (phoneNumber[0] === "0") return true;
  else return false;
}

function validateNumbers(day, month, year, phone) {
  return (
    onlyNumbers(day) &&
    onlyNumbers(month) &&
    onlyNumbers(year) &&
    onlyNumbers(phone)
  );
}

function validDate(day, month, year) {
  const dayNum = Number(day);
  const monthNum = Number(month);
  const yearNum = Number(year);
  if (dayNum < 0 || dayNum > 31) return false;
  else if (monthNum < 1 || monthNum > 12) return false;
  else if (yearNum < 1940 || yearNum > 2024) return false;
  else return true;
}
