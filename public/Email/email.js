// No need for EmailJS or Firebase initialization here anymore
// The server will handle all secure operations

// Cache for OTP value
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

    console.log("Attempting to send OTP to:", email);
    
    // Send request to our server API endpoint
    fetch('/api/send-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("OTP sent successfully");
            alert("OTP sent successfully!");
            document.querySelector('.otpverify').style.display = 'flex';
        } else {
            throw new Error(data.message || 'Failed to send OTP');
        }
    })
    .catch(error => {
        console.error("Failed to send OTP:", error);
        alert("Failed to send OTP. Error: " + (error.message || "Unknown error"));
    })
    .finally(() => {
        // Re-enable button and hide loading
        sendButton.disabled = false;
        loadingDiv.style.display = 'none';
    });
}

function verifyOTP() {
    const otpInput = document.getElementById('otp_inp');
    const enteredOTP = otpInput.value;
    const email = document.getElementById('email').value;
    const verifyButton = document.getElementById('otp-btn');
    
    if (!enteredOTP) {
        alert('Please enter the OTP');
        return;
    }
    
    if (!email) {
        alert('Email is missing');
        return;
    }
    
    // Show loading state for verification
    verifyButton.disabled = true;
    verifyButton.textContent = 'Verifying...';
    
    // Verify OTP through our server API
    fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: enteredOTP }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Store auth data in localStorage
            localStorage.setItem('isEmailVerified', 'true');
            localStorage.setItem('userEmail', data.email);
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('authToken', data.token);
            
            // Show success message
            alert('OTP verified successfully! Redirecting...');
            
            // Redirect to home page after a short delay
            setTimeout(() => {
                window.location.href = '../home.html';
            }, 1000);
        } else {
            throw new Error(data.error || 'Verification failed');
        }
    })
    .catch(error => {
        console.error('Verification error:', error);
        alert('Verification failed: ' + (error.message || 'Unknown error'));
        verifyButton.disabled = false;
        verifyButton.textContent = 'Verify OTP';
    });
}

// Add event listeners when the document loads
document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('send-btn');
    const verifyButton = document.getElementById('otp-btn');
    
    // Check if user is already logged in
    const isVerified = localStorage.getItem('isEmailVerified');
    if (isVerified === 'true') {
        // Redirect to home page if already verified
        window.location.href = '../home.html';
    }
    
    sendButton.addEventListener('click', sendOTP);
    verifyButton.addEventListener('click', verifyOTP);
});
