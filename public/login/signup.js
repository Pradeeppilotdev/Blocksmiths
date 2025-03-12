// Signup form validation and MySQL database integration
document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const signupForm = document.querySelector('form');
    const nameInput = document.querySelector('input[type="text"]');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const signupButton = document.querySelector('.btn');

    // Add ID to name input for easier reference
    nameInput.id = 'name';

    // Form submission handler
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Validate form before submission
        if (validateForm()) {
            // If validation passes, register user in database
            registerUser(nameInput.value, emailInput.value, passwordInput.value);
        }
    });

    // Form validation function
    function validateForm() {
        let isValid = true;
        
        // Name validation
        if (!nameInput.value.trim()) {
            showError(nameInput, 'Please enter your name');
            isValid = false;
        } else {
            removeError(nameInput);
        }
        
        // Email validation
        if (!emailInput.value.trim()) {
            showError(emailInput, 'Please enter your email');
            isValid = false;
        } else if (!isValidEmail(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        } else {
            removeError(emailInput);
        }
        
        // Password validation
        if (!passwordInput.value) {
            showError(passwordInput, 'Please enter a password');
            isValid = false;
        } else if (passwordInput.value.length < 8) {
            showError(passwordInput, 'Password must be at least 8 characters long');
            isValid = false;
        } else if (!isStrongPassword(passwordInput.value)) {
            showError(passwordInput, 'Password must include uppercase, lowercase, number, and special character');
            isValid = false;
        } else {
            removeError(passwordInput);
        }
        
        return isValid;
    }

    // Email format validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Password strength validation
    function isStrongPassword(password) {
        // Password should have at least one uppercase, one lowercase, one number, and one special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    // Show error message
    function showError(inputElement, message) {
        // Remove any existing error
        removeError(inputElement);
        
        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = 'red';
        errorElement.style.fontSize = '12px';
        errorElement.style.marginTop = '5px';
        
        // Insert error after the input
        inputElement.parentNode.appendChild(errorElement);
        
        // Highlight input
        inputElement.style.borderColor = 'red';
    }

    // Remove error message
    function removeError(inputElement) {
        // Find and remove error message if it exists
        const parent = inputElement.parentNode;
        const errorElement = parent.querySelector('.error-message');
        if (errorElement) {
            parent.removeChild(errorElement);
        }
        
        // Reset input style
        inputElement.style.borderColor = '';
    }

    // Function to register user in MySQL database
    function registerUser(name, email, password) {
        // Show loading state
        signupButton.textContent = 'Processing...';
        signupButton.disabled = true;
        
        // Send data to server for MySQL database insertion
        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Registration failed');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Show success message
                alert('Registration successful! You can now login.');
                
                // Redirect to login page
                window.location.href = 'login.html';
            } else {
                // Show error message
                alert(data.message || 'Registration failed. Please try again.');
            }
        })
        .catch(error => {
            console.error('Registration error:', error);
            
            // Check for specific errors
            if (error.message.includes('email already exists')) {
                showError(emailInput, 'This email is already registered');
            } else {
                alert(error.message || 'An error occurred during registration. Please try again later.');
            }
        })
        .finally(() => {
            // Reset button state
            signupButton.textContent = 'SIGN UP';
            signupButton.disabled = false;
        });
    }

    // Real-time validation for better user experience
    nameInput.addEventListener('blur', function() {
        if (!this.value.trim()) {
            showError(this, 'Please enter your name');
        } else {
            removeError(this);
        }
    });

    emailInput.addEventListener('blur', function() {
        if (!this.value.trim()) {
            showError(this, 'Please enter your email');
        } else if (!isValidEmail(this.value)) {
            showError(this, 'Please enter a valid email address');
        } else {
            removeError(this);
        }
    });

    passwordInput.addEventListener('blur', function() {
        if (!this.value) {
            showError(this, 'Please enter a password');
        } else if (this.value.length < 8) {
            showError(this, 'Password must be at least 8 characters long');
        } else if (!isStrongPassword(this.value)) {
            showError(this, 'Password must include uppercase, lowercase, number, and special character');
        } else {
            removeError(this);
        }
    });
}); 