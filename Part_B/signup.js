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

    // Simulate a successful form submission
    alert("Form submitted successfully!");
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
      errors.push("Passwords do not match.");
    } else if (password.length < 6) {
      errors.push("Password must be at least 6 characters long.");
    }

    // Validate fields that are suppose to by number only
    const correctNumbers =
      onlyNumbers(day) &&
      onlyNumbers(month) &&
      onlyNumbers(year) &&
      onlyNumbers(phone);

    if (!correctNumbers) {
      errors.push("Date of birth or phone number should contain only numbers");
    }

    if (!validPhoneNumber(phone)) {
      errors.push("Phone number must be between 7 or 15 digits");
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

function validPhoneNumber(phoneNumber) {
  const length = phoneNumber.length;
  console.log(length);
  if (length < 7 || length > 15) return false;
  else return true;
}
