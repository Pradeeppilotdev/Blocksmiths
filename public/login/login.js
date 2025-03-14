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
            if(email === username && password === userpassword){

            // For demonstration purposes only
            alert('Login successful! Redirecting...');
            showMessage('Login successful! Redirecting to home page', 'success', loginButton, loginForm);
            // Redirect to dashboard or home page after successful login
            window.location.href = '../home.html';
            }
            else{
                alert('user name or password might be wrong');
                showMessage('username or password incorrect', 'error', loginButton, loginForm);
            }
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


    // Function to show message (success or error)
    function showMessage(message, type, loginButton, loginForm) {
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
