// Admin Login Verification
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
        
        // Get input values
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Validate inputs
        if (!email || !password) {
            showMessage('Please enter both email and password', 'error');
            return;
        }
        
        // Show loading state
        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
        loginButton.disabled = true;
        
        // Simulate server verification delay (remove in production)
        setTimeout(() => {
            // Check if credentials match
            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                // Credentials are correct
                showMessage('Login successful! Redirecting to dashboard...', 'success');
                
                // Store admin session in localStorage
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminEmail', email);
                localStorage.setItem('adminLoginTime', new Date().toISOString());
                
                // Redirect to admin dashboard after a short delay
                setTimeout(() => {
                    window.location.href = '../admin/superuser.html';
                }, 1500);
            } else {
                // Credentials are incorrect
                showMessage('Invalid email or password', 'error');
                
                // Reset button state
                loginButton.textContent = 'LOGIN';
                loginButton.disabled = false;
                
                // Clear password field
                passwordInput.value = '';
                passwordInput.focus();
            }
        }, 1000);
    });
    
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
    
}); 