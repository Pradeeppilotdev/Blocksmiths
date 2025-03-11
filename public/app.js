// Global state
let userWalletAddress = null;
let provider = null;
let signer = null;
let contract = null;
const selectedFiles = {};
const verifiedPANs = {}; // Track which PANs have been verified

// Mock PAN data for verification
const mockPANDatabase = {
    'ABCDE1234F': {
        name: 'Rahul Sharma',
        dob: '15-04-1985',
        address: '123 MG Road, Bangalore, Karnataka'
    },
    'PQRST5678G': {
        name: 'Priya Patel',
        dob: '22-09-1990',
        address: '456 Park Street, Mumbai, Maharashtra'
    },
    'LMNOP9012H': {
        name: 'Amit Kumar',
        dob: '03-12-1982',
        address: '789 Gandhi Road, Delhi'
    },
    'XYZAB3456J': {
        name: 'Sneha Reddy',
        dob: '18-07-1988',
        address: '234 Lake View, Hyderabad, Telangana'
    },
    'FGHIJ7890K': {
        name: 'Vikram Singh',
        dob: '29-01-1979',
        address: '567 Hill Road, Shimla, Himachal Pradesh'
    }
};

// Contract configuration
const contractAddress = '0xf8e81D47203A594245E36C48e151709F0C19fBe8';
const contractABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "payer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "service",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "certificateIPFSHash",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "PaymentMade",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "service",
          "type": "string"
        }
      ],
      "name": "getServiceFee",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "service",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "certificateIPFSHash",
          "type": "string"
        }
      ],
      "name": "makePayment",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "serviceFees",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "service",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "newFee",
          "type": "uint256"
        }
      ],
      "name": "updateServiceFee",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "userPayments",
      "outputs": [
        {
          "internalType": "address",
          "name": "payer",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "service",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "certificateIPFSHash",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdrawFunds",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
];

const SEPOLIA_CHAIN_ID = '0xaa36a7'; // Chain ID for Sepolia

async function checkAndSwitchNetwork() {
    if (!window.ethereum) {
        showError('Please install MetaMask to use this feature');
        return false;
    }

    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== SEPOLIA_CHAIN_ID) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: SEPOLIA_CHAIN_ID }],
                });
                return true;
            } catch (switchError) {
                if (switchError.code === 4902) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: SEPOLIA_CHAIN_ID,
                                chainName: 'Sepolia Test Network',
                                nativeCurrency: {
                                    name: 'Sepolia ETH',
                                    symbol: 'SEP',
                                    decimals: 18
                                },
                                rpcUrls: ['https://sepolia.infura.io/v3/'],
                                blockExplorerUrls: ['https://sepolia.etherscan.io']
                            }]
                        });
                        return true;
                    } catch (addError) {
                        console.error('Error adding Sepolia network:', addError);
                        showError('Failed to add Sepolia network');
                        return false;
                    }
                }
                console.error('Error switching to Sepolia:', switchError);
                showError('Failed to switch to Sepolia network');
                return false;
            }
        }
        return true;
    } catch (error) {
        console.error('Error checking network:', error);
        showError('Failed to check network');
        return false;
    }
}

// Wait for ethers to load
function waitForEthers() {
    return new Promise((resolve) => {
        if (typeof ethers !== 'undefined') {
            return resolve();
        }
        
        const interval = setInterval(() => {
            if (typeof ethers !== 'undefined') {
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });
}

// Initialize blockchain connection
async function initBlockchain() {
    console.log('Starting blockchain initialization...');
    try {
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask not found');
        }
        console.log('MetaMask found');

        // Initialize Web3Provider directly from window.ethereum
        provider = new window.ethers.BrowserProvider(window.ethereum);
        console.log('Provider initialized');

        // Get signer
        signer = await provider.getSigner();
        console.log('Signer initialized');

        // Initialize contract
        contract = new window.ethers.Contract(contractAddress, contractABI, signer);
        console.log('Contract initialized:', contract.address);

        return true;
    } catch (error) {
        console.error('Blockchain initialization error:', error);
        showError('Failed to initialize blockchain: ' + error.message);
        return false;
    }
}

// Connect wallet function
async function connectWallet() {
    console.log('Starting wallet connection...');
    try {
        if (typeof window.ethereum === 'undefined') {
            throw new Error('Please install MetaMask!');
        }

        const connectButton = document.getElementById('connectWallet');
        connectButton.innerHTML = 'Connecting...';

        // Request accounts
        console.log('Requesting accounts...');
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        userWalletAddress = accounts[0];
        console.log('Connected to wallet:', userWalletAddress);

        // Initialize blockchain
        const initialized = await initBlockchain();
        if (!initialized) {
            throw new Error('Failed to initialize blockchain');
        }

        // Update button
        connectButton.innerHTML = userWalletAddress.slice(0, 6) + '...' + userWalletAddress.slice(-4);
        connectButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        connectButton.classList.add('bg-green-500', 'hover:bg-green-600');

        showSuccess('Wallet connected successfully!');

    } catch (error) {
        console.error('Connection error:', error);
        showError(error.message);
        const connectButton = document.getElementById('connectWallet');
        connectButton.innerHTML = 'Connect Wallet';
    }
}

// PAN Verification function
async function verifyPAN(service) {
    try {
        const panInput = document.getElementById(`panInput-${service}`);
        const panValue = panInput.value.trim().toUpperCase();
        const verificationResult = document.getElementById(`panVerificationResult-${service}`);
        const panDetails = document.getElementById(`panDetails-${service}`);
        const fileUploadSection = document.getElementById(`fileUploadSection-${service}`);
        const fileInput = document.getElementById(`certificateFile-${service}`);
        const fileUploadButton = document.getElementById(`fileUploadButton-${service}`);
        
        // Validate PAN format (5 letters + 4 numbers + 1 letter)
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        
        if (!panRegex.test(panValue)) {
            verificationResult.textContent = 'Invalid PAN format. Please enter a valid PAN.';
            verificationResult.className = 'mt-2 text-sm text-red-400';
            verificationResult.classList.remove('hidden');
            panDetails.classList.add('hidden');
            return;
        }
        
        // Show loading state
        const verifyButton = document.getElementById(`verifyPanButton-${service}`);
        const originalButtonText = verifyButton.textContent;
        verifyButton.textContent = 'Verifying...';
        verifyButton.disabled = true;
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check if PAN exists in our mock database
        if (mockPANDatabase[panValue]) {
            // PAN verified successfully
            const panData = mockPANDatabase[panValue];
            
            // Update verification result
            verificationResult.textContent = '✓ PAN verified successfully';
            verificationResult.className = 'mt-2 text-sm text-green-400';
            verificationResult.classList.remove('hidden');
            
            // Display PAN details
            document.getElementById(`panName-${service}`).textContent = panData.name;
            document.getElementById(`panDob-${service}`).textContent = panData.dob;
            document.getElementById(`panAddress-${service}`).textContent = panData.address;
            panDetails.classList.remove('hidden');
            
            // Enable file upload
            fileInput.disabled = false;
            fileUploadButton.classList.remove('opacity-50', 'cursor-not-allowed');
            
            // Mark this PAN as verified for this service
            verifiedPANs[service] = panValue;
            
        } else {
            // PAN not found
            verificationResult.textContent = 'PAN not found in our records. Please check and try again.';
            verificationResult.className = 'mt-2 text-sm text-red-400';
            verificationResult.classList.remove('hidden');
            panDetails.classList.add('hidden');
            
            // Disable file upload
            fileInput.disabled = true;
            fileUploadButton.classList.add('opacity-50', 'cursor-not-allowed');
            
            // Remove this service from verified PANs if it was previously verified
            delete verifiedPANs[service];
        }
        
        // Reset button state
        verifyButton.textContent = originalButtonText;
        verifyButton.disabled = false;
        
    } catch (error) {
        console.error('PAN verification error:', error);
        showError(error.message);
    }
}

// File handling
function handleFileSelect(event, service) {
    const file = event.target.files[0];
    const fileInfo = document.getElementById(`fileInfo-${service}`);
    const payButton = document.getElementById(`payButton-${service}`);
    
    if (file) {
        // Validate file type
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            fileInfo.textContent = 'Invalid file type. Please upload PDF or image files.';
            fileInfo.className = 'mt-2 text-sm text-red-500';
            return;
        }

        selectedFiles[service] = file;
        fileInfo.textContent = `Selected: ${file.name}`;
        fileInfo.className = 'mt-2 text-sm text-gray-500';
        
        // Enable payment button only if PAN is verified
        if (verifiedPANs[service]) {
            payButton.disabled = false;
            payButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    } else {
        fileInfo.textContent = '';
        delete selectedFiles[service];
        
        // Disable payment button
        payButton.disabled = true;
        payButton.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

// Payment handling
async function handlePayment(service) {
    let originalText = 'Pay Now'; // Default text
    const payButton = document.getElementById(`payButton-${service}`);
    
    try {
        if (!userWalletAddress) {
            throw new Error('Please connect your wallet first');
        }

        if (!verifiedPANs[service]) {
            throw new Error('Please verify your PAN first');
        }

        // Save original button text
        originalText = payButton.querySelector('.payment-text').textContent;
        payButton.innerHTML = '<span class="animate-spin">↻</span> Uploading...';
        payButton.disabled = true;

        if (!contract) {
            await initBlockchain();
        }

        if (!contract) {
            throw new Error('Contract not initialized');
        }

        if (!selectedFiles[service]) {
            throw new Error('Please upload a certificate first');
        }

        // Get PAN details for metadata
        const panData = mockPANDatabase[verifiedPANs[service]];
        
        // Upload to Pinata
        const formData = new FormData();
        formData.append('file', selectedFiles[service]);
        
        // Add metadata with PAN details
        const metadata = JSON.stringify({
            name: `${service} Certificate`,
            description: `${service} payment certificate for ${panData.name}`,
            pan: verifiedPANs[service],
            timestamp: new Date().toISOString()
        });
        formData.append('pinataMetadata', metadata);

        try {
            const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'pinata_api_key': 'f06e5fd1f9bd46842319',
                    'pinata_secret_api_key': '8860a2b0c4cc09b36797ebf7f1b05026705ce60c97d65687eba30ef2651517cd'
                }
            });

            const ipfsHash = response.data.IpfsHash;
            console.log('File uploaded to IPFS:', ipfsHash);

            // Process payment
            payButton.innerHTML = '<span class="animate-spin">↻</span> Processing Payment...';

            console.log('Making payment for service:', service);
            
            // Use ethers.parseEther instead of ethers.utils.parseEther
            const tx = await contract.makePayment(
                service,
                ipfsHash,
                {
                    value: ethers.parseEther('0.001'),  // Updated for ethers v6
                    gasLimit: 300000
                }
            );

            console.log('Transaction sent:', tx.hash);
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            // Show success message with PAN details
            showSuccess(`
                <h3 class="text-xl font-bold mb-4">Payment Successful!</h3>
                <p class="mb-4">Your payment for ${service} has been processed.</p>
                <div class="bg-gray-800 p-4 rounded-lg mb-4 text-left">
                    <p><span class="text-gray-400">Name:</span> ${panData.name}</p>
                    <p><span class="text-gray-400">PAN:</span> ${verifiedPANs[service]}</p>
                    <p><span class="text-gray-400">Service:</span> ${service}</p>
                    <p><span class="text-gray-400">Certificate:</span> <a href="https://gateway.pinata.cloud/ipfs/${ipfsHash}" target="_blank" class="text-blue-400 hover:underline">View Certificate</a></p>
                </div>
            `);
            
            // Reset UI
            payButton.innerHTML = `<span class="payment-text">${originalText}</span>`;
            payButton.disabled = false;
            delete selectedFiles[service];
            document.getElementById(`certificateFile-${service}`).value = '';
            document.getElementById(`fileInfo-${service}`).textContent = '';
            
            // Reset PAN verification UI but keep the PAN verified
            document.getElementById(`panVerificationResult-${service}`).classList.add('hidden');
            
            // Disable file upload again
            document.getElementById(`certificateFile-${service}`).disabled = true;
            document.getElementById(`fileUploadButton-${service}`).classList.add('opacity-50', 'cursor-not-allowed');
            
            // Disable payment button again
            payButton.classList.add('opacity-50', 'cursor-not-allowed');

        } catch (uploadError) {
            throw new Error('Failed to upload file: ' + uploadError.message);
        }

    } catch (error) {
        console.error('Payment error:', error);
        showError(error.message);
        
        // Reset button state
        payButton.innerHTML = `<span class="payment-text">${originalText}</span>`;
        payButton.disabled = false;
    }
}

function showSuccess(message) {
    const successAlert = document.getElementById('successAlert');
    const content = successAlert.querySelector('.text-center');
    content.innerHTML = message;
    successAlert.classList.remove('hidden');
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors';
    closeButton.textContent = 'Close';
    closeButton.onclick = () => successAlert.classList.add('hidden');
    content.appendChild(closeButton);
    
    // Auto-hide after 15 seconds
    setTimeout(() => {
        successAlert.classList.add('hidden');
    }, 15000);
}

function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

// Initialize on page load
window.addEventListener('load', async () => {
    console.log('Page loaded, checking wallet...');
    try {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                userWalletAddress = accounts[0];
                await initBlockchain();
                const connectButton = document.getElementById('connectWallet');
                connectButton.innerHTML = userWalletAddress.slice(0, 6) + '...' + userWalletAddress.slice(-4);
                connectButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
                connectButton.classList.add('bg-green-500', 'hover:bg-green-600');
            }
        }
    } catch (error) {
        console.error('Initialization error:', error);
    }
});