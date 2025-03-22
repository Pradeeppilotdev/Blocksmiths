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
        const signupButton = document.querySelector('.btn');
        const originalText = signupButton.textContent;
        signupButton.textContent = 'Creating Account...';
        signupButton.disabled = true;
        
        // Check for internet connection
        if (!navigator.onLine) {
            showStatusMessage('No internet connection. Please check your network and try again.', 'error');
            signupButton.textContent = originalText;
            signupButton.disabled = false;
            return;
        }
        
        // Normalize email consistently (always lowercase and trimmed)
        const normalizedEmail = email.toLowerCase().trim();
        
        // Log to console for debugging
        console.log("Attempting to create user with normalized email:", normalizedEmail);

        // Check if user already exists in Auth before attempting to create
        Promise.all([
            // Check Firebase Auth
            firebase.auth().fetchSignInMethodsForEmail(normalizedEmail)
                .then(methods => methods && methods.length > 0)
                .catch(() => false),
                
            // Check Database
            firebase.database().ref('users').orderByChild('email').equalTo(normalizedEmail).once('value')
                .then(snapshot => snapshot.exists())
                .catch(() => false)
        ])
        .then(([existsInAuth, existsInDb]) => {
            if (existsInAuth) {
                // Email already in use in Auth
                throw { code: 'auth/email-already-in-use', message: 'Email already in use in authentication system' };
            }
            
            if (existsInDb) {
                // Email exists in database but not in auth - might need recovery
                console.log("Email exists in database but not in auth - offering recovery options");
                
                // If auth record is missing but DB record exists, offer recovery
                const confirmRecreate = confirm(
                    "This email exists in our database but doesn't have an authentication record. " +
                    "Would you like to create a new authentication record with this password? " +
                    "(Click Cancel to try a different email address)"
                );
                
                if (!confirmRecreate) {
                    throw { code: 'auth/email-already-in-use', message: 'Email already exists in database', handled: true };
                }
                
                // User confirmed, proceed with creating auth record
                console.log("User confirmed recreation of auth record for existing database email");
            }
            
            // Create user in Firebase Authentication
            return firebase.auth().createUserWithEmailAndPassword(normalizedEmail, password);
        })
        .then((userCredential) => {
            // Get user from credentials
            const user = userCredential.user;
            
            if (!user) {
                throw new Error("User creation succeeded but user object is null");
            }
            
            console.log("User created successfully with UID:", user.uid);
            
            // Update the user's display name
            return user.updateProfile({
                displayName: name
            }).then(() => {
                // Create user data object
                const userData = {
                    name: name,
                    email: normalizedEmail, // Use normalized email
                    role: isAdmin ? 'admin' : 'user',
                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                    lastLogin: firebase.database.ServerValue.TIMESTAMP,
                    authMethod: 'email_password',
                    uid: user.uid // Store UID for cross-reference
                };
                
                // Log the data being saved
                console.log("Saving user data to database:", userData);
                
                // Save user data to Firebase Database
                return firebase.database().ref('users/' + user.uid).set(userData);
            });
        })
        .then(() => {
            // Verify the user was created in Auth
            const currentUser = firebase.auth().currentUser;
            if (!currentUser) {
                throw new Error("User not available after creation");
            }
            
            // Send email verification
            return currentUser.sendEmailVerification();
        })
        .then(() => {
            // Double-check that user exists in database
            const currentUser = firebase.auth().currentUser;
            return firebase.database().ref('users/' + currentUser.uid).once('value')
                .then(snapshot => {
                    if (!snapshot.exists()) {
                        // Create record if missing
                        const userData = {
                            name: name,
                            email: normalizedEmail,
                            role: isAdmin ? 'admin' : 'user',
                            createdAt: firebase.database.ServerValue.TIMESTAMP,
                            lastLogin: firebase.database.ServerValue.TIMESTAMP,
                            authMethod: 'email_password',
                            uid: currentUser.uid
                        };
                        return firebase.database().ref('users/' + currentUser.uid).set(userData);
                    }
                    return snapshot;
                });
        })
        .then(() => {
            // Update UI with success message
            showStatusMessage('Account created successfully! Please check your email for verification.', 'success');
            
            // Store login state in localStorage
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userUid', firebase.auth().currentUser.uid);
            localStorage.setItem('userName', name);
            localStorage.setItem('userEmail', normalizedEmail);
            localStorage.setItem('userRole', isAdmin ? 'admin' : 'user');
            
            // Create a log entry of the signup in a separate collection
            const signupLog = {
                email: normalizedEmail,
                name: name,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                isAdmin: isAdmin,
                method: 'email_password',
                uid: firebase.auth().currentUser.uid
            };
            
            // Add to signup logs
            return firebase.database().ref('signupLogs').push(signupLog);
        })
        .then(() => {
            // Log CSS status for debugging
            const styles = document.querySelectorAll('link[rel="stylesheet"]');
            styles.forEach(styleSheet => {
                console.log(`CSS Load Status: ${styleSheet.href} - ${styleSheet.sheet ? 'Loaded' : 'Not Loaded'}`);
            });
            
            // Redirect to appropriate page after short delay
            signupButton.textContent = 'Success! Redirecting...';
            setTimeout(() => {
                if (isAdmin) {
                    window.location.href = '../admin/superuser.html';
                } else {
                    window.location.href = '../home.html';
                }
            }, 2000);
        })
        .catch((error) => {
            // Skip if already handled
            if (error.handled) {
                signupButton.textContent = originalText;
                signupButton.disabled = false;
                return;
            }
            
            console.error('Signup error:', error);
            
            // Handle specific Firebase errors
            let errorMessage = 'Registration failed: ' + error.message;
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Email address is already in use. Please use a different email or try logging in.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format. Please enter a valid email address.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak. Please choose a stronger password.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection and try again.';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Email/password accounts are not enabled. Please contact support.';
                    break;
                default:
                    // If no specific error code but message contains specific text
                    if (error.message && error.message.includes("already in use")) {
                        errorMessage = 'Email address is already in use. Please try logging in instead.';
                    }
            }
            
            showStatusMessage(errorMessage, 'error');
            
            // Reset button
            signupButton.textContent = originalText;
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
    
    // CSS Loading diagnostics
    console.log("DOM Content Loaded for signup page");
    
    // Add debug container if it doesn't exist
    let debugElement = document.getElementById('debug');
    let authTroubleshooter = document.getElementById('auth-troubleshooter');
    
    if (!debugElement) {
        debugElement = document.createElement('div');
        debugElement.id = 'debug';
        debugElement.style.display = 'none';
        debugElement.style.backgroundColor = '#212121';
        debugElement.style.color = '#4CAF50';
        debugElement.style.fontFamily = 'monospace';
        debugElement.style.padding = '15px';
        debugElement.style.marginTop = '20px';
        debugElement.style.borderRadius = '8px';
        debugElement.style.whiteSpace = 'pre-wrap';
        debugElement.style.wordBreak = 'break-all';
        debugElement.style.fontSize = '12px';
        debugElement.style.maxHeight = '300px';
        debugElement.style.overflowY = 'auto';
        debugElement.style.border = '1px solid #333';
        
        // Add to form area
        const formArea = document.querySelector('.form_area');
        formArea.appendChild(debugElement);
    }
    
    // Create auth troubleshooter if it doesn't exist
    if (!authTroubleshooter) {
        authTroubleshooter = document.createElement('div');
        authTroubleshooter.id = 'auth-troubleshooter';
        authTroubleshooter.style.display = 'none';
        authTroubleshooter.style.marginTop = '15px';
        authTroubleshooter.style.padding = '10px';
        authTroubleshooter.style.backgroundColor = 'rgba(33, 33, 33, 0.7)';
        authTroubleshooter.style.borderRadius = '8px';
        
        authTroubleshooter.innerHTML = `
            <div class="troubleshooter-title" style="font-weight: bold; margin-bottom: 10px; color: #DDD;">Authentication Troubleshooter</div>
            <button class="troubleshooter-button" id="check-email-btn" style="background-color: #333; color: white; border: none; padding: 5px 10px; margin: 5px; border-radius: 4px; cursor: pointer; font-size: 12px;">Check Email in Database</button>
            <button class="troubleshooter-button" id="check-auth-btn" style="background-color: #333; color: white; border: none; padding: 5px 10px; margin: 5px; border-radius: 4px; cursor: pointer; font-size: 12px;">Check Auth State</button>
            <button class="troubleshooter-button" id="list-db-users-btn" style="background-color: #333; color: white; border: none; padding: 5px 10px; margin: 5px; border-radius: 4px; cursor: pointer; font-size: 12px;">List Database Users</button>
            <button class="troubleshooter-button" id="reset-local-storage-btn" style="background-color: #333; color: white; border: none; padding: 5px 10px; margin: 5px; border-radius: 4px; cursor: pointer; font-size: 12px;">Reset Local Storage</button>
        `;
        
        // Add to form area
        const formArea = document.querySelector('.form_area');
        formArea.appendChild(authTroubleshooter);
        
        // Debug activation (Shift+D)
        document.addEventListener('keydown', function(e) {
            if (e.shiftKey && e.key === 'D') {
                debugElement.style.display = debugElement.style.display === 'none' ? 'block' : 'none';
                authTroubleshooter.style.display = authTroubleshooter.style.display === 'none' ? 'block' : 'none';
                updateDebugInfo();
            }
        });
        
        // Attach troubleshooter button handlers
        document.getElementById('check-email-btn').addEventListener('click', function() {
            const email = document.getElementById('email').value;
            if (!email) {
                alert('Please enter an email address first');
                return;
            }
            
            debugElement.style.display = 'block';
            debugElement.textContent = "Checking database for email: " + email + "...";
            
            // Check Firebase Auth
            firebase.auth().fetchSignInMethodsForEmail(email)
                .then(methods => {
                    let debugInfo = `=== EMAIL CHECK: ${email} ===\n\n`;
                    debugInfo += `Auth Methods Available: ${methods.length ? methods.join(', ') : 'None'}\n\n`;
                    
                    // Check Realtime Database
                    return firebase.database().ref('users').orderByChild('email').equalTo(email).once('value')
                        .then(snapshot => {
                            if (snapshot.exists()) {
                                debugInfo += "✅ Email found in Database!\n\n";
                                snapshot.forEach(childSnapshot => {
                                    const userData = childSnapshot.val();
                                    debugInfo += `User ID: ${childSnapshot.key}\n`;
                                    debugInfo += `Name: ${userData.name || 'N/A'}\n`;
                                    debugInfo += `Role: ${userData.role || 'user'}\n`;
                                    debugInfo += `Auth Method: ${userData.authMethod || 'N/A'}\n`;
                                    if (userData.createdAt) {
                                        debugInfo += `Created: ${new Date(userData.createdAt).toLocaleString()}\n`;
                                    }
                                });
                            } else {
                                debugInfo += "❌ Email NOT found in Database\n";
                            }
                            
                            debugElement.textContent = debugInfo;
                        });
                })
                .catch(error => {
                    debugElement.textContent = `Error checking email: ${error.message}`;
                });
        });
        
        // Auth state button
        document.getElementById('check-auth-btn').addEventListener('click', updateDebugInfo);
        
        // List database users button
        document.getElementById('list-db-users-btn').addEventListener('click', function() {
            debugElement.style.display = 'block';
            debugElement.textContent = "Loading users from database...";
            
            firebase.database().ref('users').limitToLast(10).once('value')
                .then(snapshot => {
                    let debugInfo = "=== RECENT DATABASE USERS ===\n\n";
                    
                    if (snapshot.exists()) {
                        snapshot.forEach(childSnapshot => {
                            const userData = childSnapshot.val();
                            debugInfo += `Email: ${userData.email}\n`;
                            debugInfo += `Name: ${userData.name || 'N/A'}\n`;
                            debugInfo += `Role: ${userData.role || 'user'}\n`;
                            if (userData.lastLogin) {
                                debugInfo += `Last Login: ${new Date(userData.lastLogin).toLocaleString()}\n\n`;
                            } else {
                                debugInfo += "Last Login: Never\n\n";
                            }
                        });
                    } else {
                        debugInfo += "No users found in database.";
                    }
                    
                    debugElement.textContent = debugInfo;
                })
                .catch(error => {
                    debugElement.textContent = `Error loading users: ${error.message}`;
                });
        });
        
        // Reset localStorage button
        document.getElementById('reset-local-storage-btn').addEventListener('click', function() {
            if (confirm('This will clear all local authentication data. Continue?')) {
                localStorage.clear();
                updateDebugInfo();
                alert('Local storage cleared.');
            }
        });
    }
    
    // Log any CSS loading issues
    const styles = document.querySelectorAll('link[rel="stylesheet"]');
    styles.forEach(styleSheet => {
        console.log(`CSS Load Status: ${styleSheet.href} - ${styleSheet.sheet ? 'Loaded' : 'Not Loaded'}`);
        
        // Check for CORS issues
        if (!styleSheet.sheet && styleSheet.href && !styleSheet.href.startsWith('data:')) {
            console.error(`Possible CORS issue or file not found: ${styleSheet.href}`);
        }
    });
    
    // Update debug info function
    function updateDebugInfo() {
        if (debugElement.style.display === 'none') return;
        
        // Get current user
        const user = firebase.auth().currentUser;
        
        let debugInfo = "=== AUTHENTICATION DEBUG INFO ===\n\n";
        
        // Auth state
        debugInfo += "Current Auth State:\n";
        debugInfo += user ? `User: ${user.email} (${user.uid})\n` : "No user signed in\n";
        
        // localStorage
        debugInfo += "\nLocalStorage:\n";
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            debugInfo += `${key}: ${localStorage.getItem(key)}\n`;
        }
        
        // Firebase SDK version
        debugInfo += "\nFirebase SDK:\n";
        debugInfo += `Version: ${firebase.SDK_VERSION}\n`;
        
        // CSS loading info
        debugInfo += "\n=== CSS LOADING INFO ===\n";
        const styles = document.querySelectorAll('link[rel="stylesheet"]');
        
        styles.forEach(styleSheet => {
            debugInfo += `${styleSheet.href || 'inline style'}: ${styleSheet.sheet ? 'LOADED' : 'FAILED'}\n`;
        });
        
        // Check computed styles
        const bodyBgColor = window.getComputedStyle(document.body).backgroundColor;
        debugInfo += `\nComputed body background: ${bodyBgColor}\n`;
        debugInfo += `Inline styles active: ${document.body.classList.contains('test-active') ? 'YES' : 'NO'}\n`;
        
        debugElement.textContent = debugInfo;
    }
    
    // Add test-active class to confirm styles
    setTimeout(function() {
        document.body.classList.add('test-active');
        console.log("Added test-active class to body");
    }, 500);
}); 