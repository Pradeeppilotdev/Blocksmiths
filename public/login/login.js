// Login form validation and Firebase authentication
document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const loginForm = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.querySelector('.btn');

    // Initialize Firebase if not already initialized
    try {
        if (!firebase.apps.length) {
            // Firebase configuration from app.js
            const firebaseConfig = {
                apiKey: "AIzaSyC1xpIBYJ9z8Xgwrt1RkZQffyPhtnAhY3c",
                authDomain: "blocksmiths-a8021.firebaseapp.com",
                databaseURL: "https://blocksmiths-a8021-default-rtdb.asia-southeast1.firebasedatabase.app",
                projectId: "blocksmiths-a8021",
                storageBucket: "blocksmiths-a8021.firebasestorage.app",
                messagingSenderId: "243684466522",
                appId: "1:243684466522:web:8f1231b1e3831de1c99d63",
                measurementId: "G-FVBSQRWGB1"
            };
            
            firebase.initializeApp(firebaseConfig);
            console.log("Firebase initialized for authentication");
        }
    } catch (error) {
        console.error("Firebase initialization error:", error);
        showMessage('Failed to initialize Firebase: ' + error.message, 'error', loginButton, loginForm);
    }

    // Check if user is already logged in
    checkExistingLogin();

    // Form submission handler
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Basic validation
        if (validateForm()) {
            // Authenticate with Firebase
            attemptLogin(emailInput.value, passwordInput.value);
        }
    });

    // Form validation function
    function validateForm() {
        let isValid = true;
        
        // Email validation
        if (!emailInput.value || !isValidEmail(emailInput.value)) {
            showMessage('Please enter a valid email address', 'error', loginButton, loginForm);
            emailInput.focus();
            isValid = false;
        }
        
        // Password validation
        else if (!passwordInput.value || passwordInput.value.length < 6) {
            showMessage('Password must be at least 6 characters long', 'error', loginButton, loginForm);
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

    // Login function using Firebase Authentication
    function attemptLogin(email, password) {
        // Show loading state
        loginButton.textContent = 'Authenticating...';
        loginButton.disabled = true;
        
        // Authenticate with Firebase
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Get the authenticated user
                const user = userCredential.user;
                
                // Fetch additional user data from Firebase Realtime Database
                return firebase.database().ref('users/' + user.uid).once('value')
                    .then((snapshot) => {
                        // Store user info in localStorage
                        const userData = snapshot.val() || {};
                        localStorage.setItem('userLoggedIn', 'true');
                        localStorage.setItem('userUid', user.uid);
                        localStorage.setItem('userName', user.displayName || userData.name || '');
                        localStorage.setItem('userEmail', user.email);
                        localStorage.setItem('userRole', userData.role || 'user');
                        
                        // Check if admin login
                        if (userData.role === 'admin') {
                            showMessage('Admin login successful! Redirecting...', 'success', loginButton, loginForm);
                            setTimeout(() => {
                                window.location.href = '../admin/superuser.html';
                            }, 1000);
                        } else {
                            // Regular user login
                            showMessage('Login successful! Redirecting...', 'success', loginButton, loginForm);
                            setTimeout(() => {
                                window.location.href = '../home.html';
                            }, 1000);
                        }
                    });
            })
            .catch((error) => {
                console.error('Login error:', error);
                
                // Handle specific Firebase errors
                switch (error.code) {
                    case 'auth/user-not-found':
                        showMessage('No account found with this email', 'error', loginButton, loginForm);
                        break;
                    case 'auth/wrong-password':
                        showMessage('Incorrect password', 'error', loginButton, loginForm);
                        break;
                    case 'auth/invalid-email':
                        showMessage('Invalid email format', 'error', loginButton, loginForm);
                        break;
                    case 'auth/user-disabled':
                        showMessage('This account has been disabled', 'error', loginButton, loginForm);
                        break;
                    case 'auth/too-many-requests':
                        showMessage('Too many failed login attempts. Please try again later', 'error', loginButton, loginForm);
                        break;
                    default:
                        showMessage('Login failed: ' + error.message, 'error', loginButton, loginForm);
                }
            })
            .finally(() => {
                // Reset button state
                loginButton.textContent = 'LOGIN';
                loginButton.disabled = false;
            });
    }

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

    // Check if user is already logged in
    function checkExistingLogin() {
        // Check current Firebase Auth state
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                // User is signed in
                firebase.database().ref('users/' + user.uid).once('value')
                    .then((snapshot) => {
                        const userData = snapshot.val() || {};
                        if (userData.role === 'admin') {
                            // Redirect admin to admin dashboard
                            window.location.href = '../admin/superuser.html';
                        } else {
                            // Redirect regular user to home
                            window.location.href = '../home.html';
                        }
                    });
            }
        });
    }
    
    // Add a password visibility toggle
    const togglePassword = document.createElement('span');
    togglePassword.innerHTML = '<i class="far fa-eye"></i>';
    togglePassword.style.position = 'absolute';
    togglePassword.style.right = '20px';
    togglePassword.style.top = '50%';
    togglePassword.style.transform = 'translateY(-50%)';
    togglePassword.style.cursor = 'pointer';
    togglePassword.style.color = '#9ca3af';
    
    // Position the toggle button
    const passwordGroup = passwordInput.parentElement;
    passwordGroup.style.position = 'relative';
    passwordGroup.appendChild(togglePassword);
    
    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="far fa-eye"></i>' : '<i class="far fa-eye-slash"></i>';
    });
});
