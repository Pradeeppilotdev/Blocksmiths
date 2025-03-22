// Initialize EmailJS
(function() {
    try {
        emailjs.init("cOJKkQGjbNXrANdw-"); // Public key
        console.log("EmailJS initialized successfully");
    } catch (error) {
        console.error("EmailJS initialization error:", error);
    }
})();

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC1xpIBYJ9z8Xgwrt1RkZQffyPhtnAhY3c",
    authDomain: "blocksmiths-a8021.firebaseapp.com",
    databaseURL: "https://blocksmiths-a8021-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "blocksmiths-a8021",
    storageBucket: "blocksmiths-a8021.appspot.com",
    messagingSenderId: "243684466522",
    appId: "1:243684466522:web:8f1231b1e3831de1c99d63",
    measurementId: "G-FVBSQRWGB1"
};

// Initialize Firebase
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("Firebase initialized for OTP auth");
    }
} catch (error) {
    console.error("Firebase initialization error:", error);
}

// Generate a random 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}

let generatedOTP = null;

function sendOTP() {
    const emailInput = document.getElementById('email');
    const sendButton = document.getElementById('send-btn');
    const loadingDiv = document.getElementById('loading');
    const email = emailInput.value;
    
    if (!email) {
        alert('Please enter an email address');
        return;
    }

    // Disable button and show loading
    sendButton.disabled = true;
    loadingDiv.style.display = 'block';

    generatedOTP = generateOTP();
    
    // Prepare template parameters
    const templateParams = {
        to_email: email,
        otp: generatedOTP,
        to_name: email.split('@')[0],
        from_name: 'Blocksmiths',
        message: `Your OTP is: ${generatedOTP}`
    };

    console.log("Attempting to send email to:", email);
    
    // Send email using EmailJS
    emailjs.send('service_xazqc32', 'template_5zc6xye', templateParams)
        .then(function(response) {
            console.log("Email sent successfully:", response);
            alert("OTP sent successfully!");
            document.querySelector('.otpverify').style.display = 'flex';
        })
        .catch(function(error) {
            console.error("Failed to send email:", error);
            alert("Failed to send OTP. Error: " + (error.text || error.message || "Unknown error"));
        })
        .finally(function() {
            // Re-enable button and hide loading
            sendButton.disabled = false;
            loadingDiv.style.display = 'none';
        });
}

function verifyOTP() {
    const otpInput = document.getElementById('otp_inp');
    const enteredOTP = otpInput.value;
    const email = document.getElementById('email').value;
    
    if (!enteredOTP) {
        alert('Please enter the OTP');
        return;
    }
    
    if (parseInt(enteredOTP) === generatedOTP) {
        // Show loading state for verification
        const verifyButton = document.getElementById('otp-btn');
        verifyButton.disabled = true;
        verifyButton.textContent = 'Verifying...';
        
        // Create a custom token for this email to store in Firebase
        const customToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
        
        // Store verification in Firebase
        firebase.database().ref('otpUsers/' + customToken).set({
            email: email,
            verifiedAt: new Date().toISOString(),
            method: 'otp',
            loginTime: firebase.database.ServerValue.TIMESTAMP
        })
        .then(() => {
            console.log('OTP verification data saved to Firebase');
            
            // Create a new anonymous user in Firebase Auth if user not already logged in
            return firebase.auth().signInAnonymously();
        })
        .then((userCredential) => {
            // Get the anonymous user
            const user = userCredential.user;
            
            // Update the profile with the email
            return user.updateProfile({
                displayName: email.split('@')[0] // Set display name as username from email
            }).then(() => {
                // Store additional info in Realtime Database
                return firebase.database().ref('users/' + user.uid).set({
                    email: email,
                    name: email.split('@')[0],
                    role: 'user',
                    authMethod: 'otp',
                    lastLogin: firebase.database.ServerValue.TIMESTAMP
                });
            });
        })
        .then(() => {
            // Show success message
            alert('OTP verified successfully! Redirecting...');
            
            // Store verification status in localStorage as backup
            localStorage.setItem('isEmailVerified', 'true');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userLoggedIn', 'true');
            
            // Redirect to home page after a short delay
            setTimeout(() => {
                window.location.href = '../home.html';
            }, 1000);
        })
        .catch((error) => {
            console.error('Firebase error:', error);
            alert('Verification successful but failed to save to database: ' + error.message);
            verifyButton.disabled = false;
            verifyButton.textContent = 'Verify OTP';
        });
    } else {
        alert('Invalid OTP. Please try again.');
        // Clear the OTP input field
        otpInput.value = '';
    }
}

// Add event listeners when the document loads
document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('send-btn');
    const verifyButton = document.getElementById('otp-btn');
    
    // Check if user is already verified and logged in with Firebase
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in with Firebase
            firebase.database().ref('users/' + user.uid).once('value')
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        // Valid database entry, redirect to home
                        window.location.href = '../home.html';
                    }
                })
                .catch((error) => {
                    console.error("Error checking user data:", error);
                });
        } else {
            // Check localStorage as fallback
            const isVerified = localStorage.getItem('isEmailVerified');
            if (isVerified === 'true') {
                // Redirect to home page if already verified
                window.location.href = '../home.html';
            }
        }
    });
    
    sendButton.addEventListener('click', sendOTP);
    verifyButton.addEventListener('click', verifyOTP);
});
