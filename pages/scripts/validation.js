
document.addEventListener('DOMContentLoaded', function() {
    // Validate registration form if it exists
    var registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(event) {
            if (!validateRegistrationForm()) {
                event.preventDefault();
            }
        });
    }

    // Validate budget form if it exists
    var budgetForm = document.getElementById('budgetForm');
    if (budgetForm) {
        budgetForm.addEventListener('submit', function(event) {
            if (!validateBudgetForm()) {
                event.preventDefault();
            }
        });
    }
});

/**
 * Validate registration form
 */
function validateRegistrationForm() {
    var form = document.getElementById('registrationForm');
    if (!form) {
        return true;
    }

    var isValid = true;

    // Get form inputs
    var nameInput = form.querySelector('input[type="text"]');
    var emailInput = form.querySelector('input[type="email"]');
    var passwordInput = form.querySelector('input[type="password"]');
    var selectInput = form.querySelector('select');
    var checkboxInput = document.getElementById('acceptTerms');

    // Validate name
    if (nameInput) {
        if (!validateName(nameInput.value)) {
            showError(nameInput, 'Please enter your full name');
            isValid = false;
        } else {
            clearError(nameInput);
        }
    }

    // Validate email
    if (emailInput) {
        if (!validateEmail(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        } else {
            clearError(emailInput);
        }
    }

    // Validate password
    if (passwordInput) {
        var passwordError = validatePassword(passwordInput.value);
        if (passwordError) {
            showError(passwordInput, passwordError);
            isValid = false;
        } else {
            clearError(passwordInput);
        }
    }

    // Validate select (event selection)
    if (selectInput) {
        if (!validateSelect(selectInput.value)) {
            showError(selectInput, 'Please select an event');
            isValid = false;
        } else {
            clearError(selectInput);
        }
    }

    // Validate checkbox (terms acceptance)
    if (checkboxInput) {
        if (!checkboxInput.checked) {
            showError(checkboxInput, 'You must agree to the Terms of Service and Privacy Policy');
            isValid = false;
        } else {
            clearError(checkboxInput);
        }
    }

    return isValid;
}

/**
 * Validate budget calculator form
 */
function validateBudgetForm() {
    var form = document.getElementById('budgetForm');
    if (!form) {
        return true;
    }

    var isValid = true;

    // Get number inputs
    var ticketCost = document.getElementById('ticketCost');
    var transportCost = document.getElementById('transportCost');
    var materialsCost = document.getElementById('materialsCost');
    var foodCost = document.getElementById('foodCost');

    // Validate all number inputs
    var numberInputs = [ticketCost, transportCost, materialsCost, foodCost];
    
    for (var i = 0; i < numberInputs.length; i++) {
        if (numberInputs[i]) {
            if (!validateNumber(numberInputs[i].value)) {
                showError(numberInputs[i], 'Please enter a valid number (0 or greater)');
                isValid = false;
            } else {
                clearError(numberInputs[i]);
            }
        }
    }

    return isValid;
}

/**
 * Validate name (must not be empty and at least 2 characters)
 */
function validateName(name) {
    if (!name || name.trim().length < 2) {
        return false;
    }
    return true;
}

/**
 * Validate email format
 */
function validateEmail(email) {
    if (!email) {
        return false;
    }
    // Simple email validation
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

/**
 * Validate password (must be at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character)
 * Returns error message if invalid, or null if valid
 */
function validatePassword(password) {
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

/**
 * Validate select (must have a value selected)
 */
function validateSelect(value) {
    if (!value || value === '') {
        return false;
    }
    return true;
}

/**
 * Validate number (must be a valid number and >= 0)
 */
function validateNumber(value) {
    if (value === '' || value === null || value === undefined) {
        return true; // Empty is allowed for optional fields
    }
    var num = parseFloat(value);
    if (isNaN(num) || num < 0) {
        return false;
    }
    return true;
}

/**
 * Show error message for an input field
 */
function showError(input, message) {
    // Remove any existing error
    clearError(input);

    // Add error class to input
    input.classList.add('error');

    // Create error message element
    var errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = 'red';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';

    // Insert error message after input
    input.parentNode.appendChild(errorDiv);
}

/**
 * Clear error message for an input field
 */
function clearError(input) {
    // Remove error class
    input.classList.remove('error');

    // Remove error message if it exists
    var errorDiv = input.parentNode.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

