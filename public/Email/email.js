// Initialize EmailJS
(function() {
    try {
        emailjs.init("cOJKkQGjbNXrANdw-"); // Public key
        console.log("EmailJS initialized successfully");
    } catch (error) {
        console.error("EmailJS initialization error:", error);
    }
})();

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
    
    if (!enteredOTP) {
        alert('Please enter the OTP');
        return;
    }
    
    if (parseInt(enteredOTP) === generatedOTP) {
        // Show success message
        alert('OTP verified successfully!');
        
        // Store verification status in localStorage
        localStorage.setItem('isEmailVerified', 'true');
        localStorage.setItem('userEmail', document.getElementById('email').value);
        
        // Redirect to home page after a short delay
        setTimeout(() => {
            window.location.href = '../home.html';
        }, 1000);
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
    
    // Check if user is already verified
    const isVerified = localStorage.getItem('isEmailVerified');
    if (isVerified === 'true') {
        // Redirect to home page if already verified
        window.location.href = '../home.html';
    }
    
    sendButton.addEventListener('click', sendOTP);
    verifyButton.addEventListener('click', verifyOTP);
});
