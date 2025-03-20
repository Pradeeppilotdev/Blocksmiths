// Signup form validation and Firebase authentication integration
document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const signupForm = document.querySelector('form');
    const nameInput = document.querySelector('input[type="text"]');
    const emailInput = document.getElementById('email');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    const signupButton = document.querySelector('.btn');
    const statusContainer = document.getElementById('statusContainer');
    
    // Admin code field creation
    const adminCodeWrapper = document.createElement('div');
    adminCodeWrapper.className = 'form_group admin-code-wrapper';
    adminCodeWrapper.style.display = 'none'; // Hidden by default
    
    adminCodeWrapper.innerHTML = `
        <label class="sub_title" for="adminCode">Admin Registration Code</label>
        <input placeholder="Enter admin registration code" id="adminCode" class="form_style" type="text">
        <small class="hint">Enter the admin code provided by system administrator</small>
    `;
    
    // Admin checkbox
    const adminCheckWrapper = document.createElement('div');
    adminCheckWrapper.className = 'form_group admin-check-wrapper';
    adminCheckWrapper.style.marginTop = '15px';
    
    adminCheckWrapper.innerHTML = `
        <label class="checkbox-container">
            <input type="checkbox" id="adminCheck"> 
            <span style="color: white; margin-left: 5px;">Register as Admin</span>
        </label>
    `;
    
    // Add admin check before the submit button
    const buttonContainer = signupButton.parentNode;
    signupForm.insertBefore(adminCheckWrapper, buttonContainer);
    
    // Add admin code field after the check (will be shown/hidden)
    signupForm.insertBefore(adminCodeWrapper, buttonContainer);
    
    // Toggle admin code field visibility
    const adminCheck = document.getElementById('adminCheck');
    const adminCodeInput = document.getElementById('adminCode');
    
    adminCheck.addEventListener('change', function() {
        adminCodeWrapper.style.display = this.checked ? 'block' : 'none';
    });

    // Add IDs to make reference easier if not already set
    if (!nameInput.id) nameInput.id = 'name';
    if (!confirmPasswordInput.id) confirmPasswordInput.id = 'confirmPassword';

    // Verify Firebase is initialized
    if (!firebase || !firebase.apps.length) {
        showStatusMessage('Firebase is not initialized. Please check your internet connection and try again.', 'error');
        console.error('Firebase is not initialized');
        signupButton.disabled = true;
        return;
    }

    // Form submission handler
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Clear any previous status messages
        clearStatusMessages();
        
        // Validate form before submission
        if (validateForm()) {
            const isAdminRegistration = adminCheck.checked;
            const adminCode = adminCodeInput.value.trim();
            
            // If admin registration, verify admin code
            if (isAdminRegistration) {
                // Admin code validation - change this to your secure admin code
                const ADMIN_REGISTRATION_CODE = "blocksmiths2024";
                
                if (adminCode !== ADMIN_REGISTRATION_CODE) {
                    showError(adminCodeInput, 'Invalid admin registration code');
                    return;
                }
            }
            
            // If validation passes, register user in Firebase
            registerUser(nameInput.value, emailInput.value, passwordInput.value, isAdminRegistration);
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
        
        // Confirm password validation
        if (passwordInput.value !== confirmPasswordInput.value) {
            showError(confirmPasswordInput, 'Passwords do not match');
            isValid = false;
        } else if (passwordInput.value) {
            removeError(confirmPasswordInput);
        }
        
        // Admin code validation if admin checkbox is checked
        if (adminCheck.checked && !adminCodeInput.value.trim()) {
            showError(adminCodeInput, 'Please enter the admin registration code');
            isValid = false;
        } else if (adminCheck.checked) {
            removeError(adminCodeInput);
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

    // Function to show status message in the container
    function showStatusMessage(message, type) {
        // Clear any existing messages
        clearStatusMessages();
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `status-message ${type}`;
        messageElement.textContent = message;
        
        // Style based on type
        if (type === 'error') {
            messageElement.style.backgroundColor = '#ffebee';
            messageElement.style.color = '#c62828';
            messageElement.style.borderLeft = '4px solid #c62828';
        } else if (type === 'success') {
            messageElement.style.backgroundColor = '#e8f5e9';
            messageElement.style.color = '#2e7d32';
            messageElement.style.borderLeft = '4px solid #2e7d32';
        } else if (type === 'info') {
            messageElement.style.backgroundColor = '#e3f2fd';
            messageElement.style.color = '#1565c0';
            messageElement.style.borderLeft = '4px solid #1565c0';
        }
        
        // Common styles
        messageElement.style.padding = '12px 16px';
        messageElement.style.margin = '10px 0';
        messageElement.style.borderRadius = '4px';
        messageElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        messageElement.style.position = 'fixed';
        messageElement.style.bottom = '20px';
        messageElement.style.right = '20px';
        messageElement.style.zIndex = '1000';
        messageElement.style.maxWidth = '400px';
        
        // Add to container
        statusContainer.appendChild(messageElement);
        
        // Auto-remove after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 5000);
        }
    }

    // Clear all status messages
    function clearStatusMessages() {
        while (statusContainer.firstChild) {
            statusContainer.removeChild(statusContainer.firstChild);
        }
    }

    // Function to register user in Firebase Authentication & Database
    function registerUser(name, email, password, isAdmin = false) {
        // Show loading state
        signupButton.textContent = 'Processing...';
        signupButton.disabled = true;
        
        // Register user with Firebase Authentication
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Get the newly created user
                const user = userCredential.user;

                // Update user profile with name
                return user.updateProfile({
                    displayName: name
                }).then(() => {
                    // Store additional user data in Firebase Realtime Database
                    return firebase.database().ref('users/' + user.uid).set({
                        name: name,
                        email: email,
                        createdAt: firebase.database.ServerValue.TIMESTAMP,
                        role: isAdmin ? 'admin' : 'user'
                    });
                });
            })
            .then(() => {
                // Show success message
                const roleMessage = isAdmin ? 'Admin' : 'User';
                showStatusMessage(`${roleMessage} registration successful! Redirecting to login...`, 'success');
                
                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            })
            .catch((error) => {
                console.error('Registration error:', error);
                
                // Handle specific Firebase errors
                let errorMessage = 'Registration failed. Please try again.';
                
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'This email is already registered.';
                        showError(emailInput, errorMessage);
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Please enter a valid email address.';
                        showError(emailInput, errorMessage);
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'Password is too weak. Please use a stronger password.';
                        showError(passwordInput, errorMessage);
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'Network error. Please check your internet connection and try again.';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Too many requests. Please try again later.';
                        break;
                    case 'auth/operation-not-allowed':
                        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
                        break;
                    default:
                        errorMessage = error.message || 'An unexpected error occurred. Please try again.';
                }
                
                // Show error in status container
                showStatusMessage(errorMessage, 'error');
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
            
            // Check confirm password field when password changes
            if (confirmPasswordInput.value && confirmPasswordInput.value !== this.value) {
                showError(confirmPasswordInput, 'Passwords do not match');
            } else if (confirmPasswordInput.value) {
                removeError(confirmPasswordInput);
            }
        }
    });
    
    confirmPasswordInput.addEventListener('blur', function() {
        if (this.value !== passwordInput.value) {
            showError(this, 'Passwords do not match');
        } else {
            removeError(this);
        }
    });
    
    // Add CSS for status container and admin features
    const style = document.createElement('style');
    style.textContent = `
        .status-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
        }
        
        .hint {
            color: #aaa;
            font-size: 11px;
            margin-top: 4px;
            display: block;
        }
        
        .checkbox-container {
            display: flex;
            align-items: center;
            cursor: pointer;
        }
        
        .admin-check-wrapper {
            text-align: left;
            width: 90%;
        }
    `;
    document.head.appendChild(style);
}); 