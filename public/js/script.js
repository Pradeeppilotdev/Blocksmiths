async function verifyPAN() {
    const panNumber = document.getElementById('panNumber').value;
    
    try {
        const response = await fetch('/api/verify-pan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ panNumber })
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('PAN verified successfully', 'success');
            // Enable the next steps or form submission
        } else {
            showNotification(data.message || 'PAN verification failed', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error verifying PAN', 'error');
    }
} 