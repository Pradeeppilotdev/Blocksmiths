// Login form validation and submission handling
document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const loginForm = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.querySelector('.btn');
    const username='bala4256t@gmail.com';
    const userpassword='bala4256'

    // Form submission handler
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Basic validation
        if (validateForm()) {
            // Here you would typically send the data to your server
            attemptLogin(emailInput.value, passwordInput.value);
        }
    });

    // Form validation function
    function validateForm() {
        let isValid = true;
        
        // Email validation
        if (!emailInput.value || !isValidEmail(emailInput.value)) {
            alert('Please enter a valid email address');
            emailInput.focus();
            isValid = false;
        }
        
        // Password validation
        else if (!passwordInput.value || passwordInput.value.length < 6) {
            alert('Password must be at least 6 characters long');
            passwordInput.focus();
            isValid = false;
        }
        
        return isValid;
    }

    // Email format validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Login function - this would connect to your backend
    function attemptLogin(email, password) {
        // This is where you would make an API call to your server
        console.log('Attempting login with:', email);
        
        // Simulating a login process
        setTimeout(() => {
            // For demonstration purposes only
            alert('Login successful! Redirecting...');
            // Redirect to dashboard or home page after successful login
            window.location.href = '../home.html';
        }, 1000);
        
        // In a real application, you would use fetch or axios:
        /*
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = 'dashboard.html';
            } else {
                alert('Login failed: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during login');
        });
        */
    }
});

// Admin Login Function
document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const loginForm = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.querySelector('.btn');

    // Admin credentials (in a real application, these would be verified against a database)
    const ADMIN_EMAIL = "admin@blocksmiths.com";
    const ADMIN_PASSWORD = "Admin@123";

    // Form submission handler
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Call the admin login function
        adminLogin(emailInput.value, passwordInput.value);
    });

    // Admin login function
    function adminLogin(email, password) {
        // Show loading state
        loginButton.textContent = 'Authenticating...';
        loginButton.disabled = true;
        
        // Simulate server delay (remove in production)
        setTimeout(() => {
            // Check if credentials match
            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                // Login successful
                
                // Store admin session in localStorage
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminEmail', email);
                localStorage.setItem('adminLoginTime', new Date().toISOString());
                
                // Show success message
                showMessage('Login successful! Redirecting to admin dashboard...', 'success');
                
                // Redirect to superuser dashboard
                setTimeout(() => {
                    window.location.href = '../admin/superuser.html';
                }, 1500);
            } else {
                // Login failed
                showMessage('Invalid admin credentials. Redirecting to home page...', 'error');
                
                // Reset button state
                loginButton.textContent = 'LOGIN';
                loginButton.disabled = false;
                
                // Clear password field
                passwordInput.value = '';
                
                // Redirect to Home.html after showing error message
                setTimeout(() => {
                    window.location.href = '../home/Home.html';
                }, 2000);
            }
        }, 1000);
    }

    // Function to show message (success or error)
    function showMessage(message, type) {
        // Remove any existing messages
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        // Style based on message type
        if (type === 'error') {
            messageElement.style.color = '#ff6b6b';
        } else {
            messageElement.style.color = '#10b981';
        }
        
        messageElement.style.marginTop = '15px';
        messageElement.style.textAlign = 'center';
        messageElement.style.width = '90%';
        
        // Insert message before the button container
        const buttonContainer = loginButton.parentNode;
        loginForm.insertBefore(messageElement, buttonContainer);
    }

    // Check if admin is already logged in
    // function checkExistingLogin() {
    //     if (localStorage.getItem('adminLoggedIn') === 'true') {
    //         // Redirect to admin dashboard
    //         window.location.href = '../admin/superuser.html';
    //     }
    // }
    
    // Check for existing login on page load
   // checkExistingLogin();
}); 