function showLoadingState(service) {
    const button = document.querySelector(`#payButton-${service}`);
    const text = button.querySelector('.payment-text');
    const loading = button.querySelector('.payment-loading');
    
    text.classList.add('hidden');
    loading.classList.remove('hidden');
    button.disabled = true;
}

function hideLoadingState(service) {
    const button = document.querySelector(`#payButton-${service}`);
    const text = button.querySelector('.payment-text');
    const loading = button.querySelector('.payment-loading');
    
    text.classList.remove('hidden');
    loading.classList.add('hidden');
    button.disabled = false;
}

async function handlePayment(service) {
    try {
        showLoadingState(service);
        // Your existing payment logic here
        
        // After successful payment and IPFS upload:
        const ipfsLink = document.getElementById('ipfsLink');
        ipfsLink.href = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`; // Use the actual IPFS hash
        
        // Show success alert
        document.getElementById('successAlert').classList.remove('hidden');
        
    } catch (error) {
        console.error('Payment failed:', error);
        // Show error message
    } finally {
        hideLoadingState(service);
    }
}

function handleFileSelect(event, service) {
    const file = event.target.files[0];
    const fileNameElement = document.getElementById(`fileName-${service}`);
    const fileInfo = document.getElementById(`fileInfo-${service}`);
    const payButton = document.getElementById(`payButton-${service}`);
    
    if (file) {
        fileNameElement.textContent = file.name;
        fileInfo.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
        fileInfo.classList.remove('hidden');
        selectedFiles[service] = file;
        payButton.disabled = false;
    } else {
        fileNameElement.textContent = 'Choose file';
        fileInfo.classList.add('hidden');
        delete selectedFiles[service];
        payButton.disabled = true;
    }
}
