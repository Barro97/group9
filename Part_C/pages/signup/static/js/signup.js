"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".signup-form");
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(form);

        const validationErrors = validateFormData(formData);
        if (validationErrors.length > 0) {
            alert(`Please fix the following errors:\n${validationErrors.join("\n")}`);
            return;
        }

        // Prepare data to be sent to the server
        const userData = {
            first_name: formData.get("first_name"),
            last_name: formData.get("last_name"),
            email: formData.get("email"),
            phone_number: formData.get("phone_number"),
            dob_day: formData.get("dob_day"),
            dob_month: formData.get("dob_month"),
            dob_year: formData.get("dob_year"),
            country: formData.get("country"),
            city: formData.get("city"),
            password: formData.get("password"),
            verify_password: formData.get("verify_password"),
        };

        // Send form data to the server using fetch API
        fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(userData)
        }).then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                window.location.href = "/login";
            } else {
                alert(data.message);
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    });

    function validateFormData(formData) {
        const errors = [];
        const password = formData.get("password");
        const verifyPassword = formData.get("verify_password");
        const day = formData.get("dob_day");
        const month = formData.get("dob_month");
        const year = formData.get("dob_year");
        const phone = formData.get("phone_number");
        const email = formData.get("email");
        const firstName = formData.get("first_name");
        const lastName = formData.get("last_name");

        if (!noEmptyValues(formData)) {
            errors.push("All form fields must be filled out");
        }

        if (!isValidEmail(email)) {
            errors.push("Invalid email address.");
        }

        if (password !== verifyPassword) {
            errors.push("Passwords do not match.");
        } else if (password.length < 6) {
            errors.push("Password must be at least 6 characters long.");
        }

        if (!validateNumbers(day, month, year, phone)) {
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
        } else if (!isOldEnough(year, month, day)) {
            errors.push("User must be at least 18 years old.");
        }

        if (!isValidName(firstName)) {
            errors.push("First name must contain only letters and be at least 2 characters long.");
        }

        if (!isValidName(lastName)) {
            errors.push("Last name must contain only letters and be at least 2 characters long.");
        }

        return errors;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function onlyNumbers(numElement) {
        for (const digit of numElement) {
            let num = Number(digit);
            if (!num && num !== 0) return false;
        }
        return true;
    }

    function noEmptyValues(formData) {
        for (const [, value] of formData.entries()) {
            if (!value) {
                return false;
            }
        }
        return true;
    }

    function validPhoneNumberLength(phoneNumber) {
        const length = phoneNumber.length;
        return length >= 7 && length <= 15;
    }

    function validPhoneNumberBeginning(phoneNumber) {
        return phoneNumber[0] === "0";
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
        if (dayNum < 1 || dayNum > 31) return false;
        else if (monthNum < 1 || monthNum > 12) return false;
        else if (yearNum < 1940 || yearNum > new Date().getFullYear()) return false;
        else return true;
    }

    function isOldEnough(year, month, day) {
        const today = new Date();
        const birthDate = new Date(year, month - 1, day);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18;
    }

    function isValidName(name) {
        const nameRegex = /^[A-Za-z]{2,}$/;
        return nameRegex.test(name);
    }
});
