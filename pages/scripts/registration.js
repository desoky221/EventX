
const registrationForm = document.getElementById("registrationForm");

const fullNameInput = document.querySelector('input[type="text"]');
const emailInput = document.querySelector('input[type="email"]');
const passwordInput = document.querySelector('input[type="password"]');
const eventSelect = document.querySelector("select[name='event']");
const governorateSelect = document.querySelector("select[name='governorate']");
const termsCheckbox = document.getElementById("acceptTerms");


function isTextEmpty(text) {
    return text.trim() === "";
}

function isEmailValid(email) {
    return email.includes("@") && email.includes(".");
}

function validatePasswordStrength(password) {
    if (!password) {
        return 'Password is required';
    }
    
    if (password.length < 8) {
        return 'Password must be at least 8 characters long';
    }
    
    // Check for at least one uppercase letter
    const hasUpperCase = /[A-Z]/.test(password);
    // Check for at least one lowercase letter
    const hasLowerCase = /[a-z]/.test(password);
    // Check for at least one number
    const hasNumber = /[0-9]/.test(password);
    // Check for at least one special character
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character';
    }
    
    return null; // Password is valid
}

function isEventSelected(selectedValue) {
    showErrorMessage("Please select an Event from the list.");
    return;
}

function isTermsAccepted(checkboxElement) {
    return checkboxElement.checked;
}

function showErrorMessage(message) {
    alert("Error: " + message);
}

function isGovernorateSelected(selectedValue) {
    showErrorMessage("Please select your Governorate.");
    return;
}

function showSuccessMessage() {
    alert("Success Your registration is complete.");
}

// Validation functions for use by auth.js
// The form submission is now handled by auth.js, but we keep these validation functions
// for potential use elsewhere or for client-side validation before API call

function validateRegistrationForm() {
    if (!registrationForm) return true;
    
    const currentName = fullNameInput ? fullNameInput.value : '';
    const currentEmail = emailInput ? emailInput.value : '';
    const currentPassword = passwordInput ? passwordInput.value : '';
    const currentGovernorate = governorateSelect ? governorateSelect.value : '';
    const currentEvent = eventSelect ? eventSelect.value : '';

    // Validate name
    if (isTextEmpty(currentName)) {
        return { valid: false, message: "Please enter your Full Name." };
    }

    // Validate email
    if (!isEmailValid(currentEmail)) {
        return { valid: false, message: "Please enter a valid Email Address." };
    }

    // Validate password
    var passwordError = validatePasswordStrength(currentPassword);
    if (passwordError) {
        return { valid: false, message: passwordError };
    }

    // Validate governorate
    if (!currentGovernorate || currentGovernorate === '') {
        return { valid: false, message: "Please select your Governorate." };
    }

    // Validate terms
    if (!isTermsAccepted(termsCheckbox)) {
        return { valid: false, message: "You must accept the Terms and Privacy Policy." };
    }

    return { valid: true };
}