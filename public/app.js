// Global state
let userWalletAddress = null;
let provider = null;
let signer = null;
let contract = null;
const selectedFiles = {};
const verifiedPANs = {}; // Track which PANs have been verified
const uploadedDocuments = new Map();

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

// Function to disable all service interactions
function disableAllServiceInteractions() {
    // Disable all PAN verification inputs and buttons
    document.querySelectorAll('[id^="panInput-"]').forEach(input => {
        input.disabled = true;
        input.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-700');
    });
    
    document.querySelectorAll('[id^="verifyPanButton-"]').forEach(button => {
        button.disabled = true;
        button.classList.add('opacity-50', 'cursor-not-allowed');
    });
    
    // Disable all file inputs
    document.querySelectorAll('[id^="certificateFile-"]').forEach(input => {
        input.disabled = true;
    });
    
    document.querySelectorAll('[id^="fileUploadButton-"]').forEach(button => {
        button.classList.add('opacity-50', 'cursor-not-allowed');
    });
    
    // Disable all payment buttons
    document.querySelectorAll('.service-pay').forEach(button => {
        button.disabled = true;
        button.classList.add('opacity-50', 'cursor-not-allowed');
    });
}

// Function to enable all service interactions
function enableAllServiceInteractions() {
    // Enable all PAN verification inputs and buttons
    document.querySelectorAll('[id^="panInput-"]').forEach(input => {
        input.disabled = false;
        input.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-gray-700');
    });
    
    document.querySelectorAll('[id^="verifyPanButton-"]').forEach(button => {
        button.disabled = false;
        button.classList.remove('opacity-50', 'cursor-not-allowed');
    });
    
    // File inputs and payment buttons will be enabled based on PAN verification
}

// Modify disconnectWallet function
async function disconnectWallet() {
    try {
        userWalletAddress = null;
        provider = null;
        signer = null;
        contract = null;

        // Update UI
        const connectButton = document.getElementById('connectWallet');
        connectButton.innerHTML = `
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12h.01" />
            </svg>
            <span>Connect Wallet</span>
        `;
        connectButton.classList.remove('bg-green-500', 'hover:bg-green-600');
        connectButton.classList.add('bg-blue-500', 'hover:bg-blue-600');
        connectButton.onclick = connectWallet;

        // Hide network badge
        document.getElementById('networkBadge').classList.add('hidden');

        // Disable all service interactions
        disableAllServiceInteractions();

        // Clear any existing verifications and selections
        verifiedPANs = {};
        Object.keys(selectedFiles).forEach(key => delete selectedFiles[key]);

        // Reset all file inputs
        document.querySelectorAll('[id^="certificateFile-"]').forEach(input => {
            input.value = '';
        });

        // Reset all file info texts
        document.querySelectorAll('[id^="fileInfo-"]').forEach(info => {
            info.textContent = '';
        });

        // Hide all PAN verification results and details
        document.querySelectorAll('[id^="panVerificationResult-"]').forEach(result => {
            result.classList.add('hidden');
        });
        document.querySelectorAll('[id^="panDetails-"]').forEach(details => {
            details.classList.add('hidden');
        });

        showSuccess('Wallet disconnected successfully!');
    } catch (error) {
        console.error('Disconnection error:', error);
        showError(error.message);
    }
}

// Modify connectWallet function
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
        connectButton.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">${userWalletAddress.slice(0, 6)}...${userWalletAddress.slice(-4)}</span>
                <svg class="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        `;
        connectButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        connectButton.classList.add('bg-green-500', 'hover:bg-green-600');
        connectButton.onclick = disconnectWallet;

        // Enable all service interactions
        enableAllServiceInteractions();

        showSuccess('Wallet connected successfully!');

    } catch (error) {
        console.error('Connection error:', error);
        showError(error.message);
        const connectButton = document.getElementById('connectWallet');
        connectButton.innerHTML = 'Connect Wallet';
        disableAllServiceInteractions();
    }
}

// Modify window load event listener
window.addEventListener('load', async () => {
    console.log('Page loaded, checking wallet...');
    
    // Add reveal class to sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('reveal');
    });
    
    // Initial check for reveals
    revealOnScroll();
    
    // Add scroll event listener
    window.addEventListener('scroll', revealOnScroll);
    
    // Initially disable all service interactions
    disableAllServiceInteractions();
    
    try {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                userWalletAddress = accounts[0];
                await initBlockchain();
                const connectButton = document.getElementById('connectWallet');
                connectButton.innerHTML = `
                    <div class="flex items-center">
                        <span class="mr-2">${userWalletAddress.slice(0, 6)}...${userWalletAddress.slice(-4)}</span>
                        <svg class="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                `;
                connectButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
                connectButton.classList.add('bg-green-500', 'hover:bg-green-600');
                connectButton.onclick = disconnectWallet;
                
                // Enable service interactions if wallet is connected
                enableAllServiceInteractions();
            }
        }
        updateDocumentsTable();
    } catch (error) {
        console.error('Initialization error:', error);
        disableAllServiceInteractions();
    }
});

// Add event listener for account changes
if (window.ethereum) {
    window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length === 0) {
            // User disconnected their wallet
            await disconnectWallet();
        } else {
            // User switched accounts
            userWalletAddress = accounts[0];
            await initBlockchain();
            const connectButton = document.getElementById('connectWallet');
            connectButton.innerHTML = `
                <div class="flex items-center">
                    <span class="mr-2">${userWalletAddress.slice(0, 6)}...${userWalletAddress.slice(-4)}</span>
                    <svg class="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            `;
            enableAllServiceInteractions();
        }
    });
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
            payButton.disabled = true;
            payButton.classList.add('opacity-50', 'cursor-not-allowed');
            return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            fileInfo.textContent = 'File too large. Maximum size is 10MB.';
            fileInfo.className = 'mt-2 text-sm text-red-500';
            payButton.disabled = true;
            payButton.classList.add('opacity-50', 'cursor-not-allowed');
            return;
        }

        selectedFiles[service] = file;
        fileInfo.textContent = `Selected: ${file.name}`;
        fileInfo.className = 'mt-2 text-sm text-green-500 fade-in';
        
        // Enable payment button only if PAN is verified
        if (verifiedPANs[service]) {
            payButton.disabled = false;
            payButton.classList.remove('opacity-50', 'cursor-not-allowed');
            payButton.classList.add('payment-ready');
        }

        // Add to uploaded documents with pending status
        uploadedDocuments.set(service, {
            fileName: file.name,
            status: 'Pending',
            ipfsHash: null,
            transactionHash: null
        });
        
        // Update the documents table
        updateDocumentsTable();
    } else {
        fileInfo.textContent = '';
        delete selectedFiles[service];
        
        // Disable payment button
        payButton.disabled = true;
        payButton.classList.add('opacity-50', 'cursor-not-allowed');
        payButton.classList.remove('payment-ready');
    }
}

// Payment handling
async function handlePayment(service) {
    let originalText = 'Pay Now';
    const payButton = document.getElementById(`payButton-${service}`);
    
    try {
        if (!userWalletAddress) {
            throw new Error('Please connect your wallet first');
        }

        if (!verifiedPANs[service]) {
            throw new Error('Please verify your PAN first');
        }

        if (!selectedFiles[service]) {
            throw new Error('Please upload a certificate first');
        }

        // Save original button text
        originalText = payButton.querySelector('.payment-text').textContent;
        payButton.innerHTML = '<span class="animate-spin">↻</span> Processing Payment...';
        payButton.disabled = true;

        try {
            // Process payment first
            console.log('Making payment for service:', service);
            
            const tx = await contract.makePayment(
                service,
                "pending",
                {
                    value: ethers.parseEther('0.001'),
                    gasLimit: 300000
                }
            );

            console.log('Transaction sent:', tx.hash);
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            // Get PAN details
            const panData = mockPANDatabase[verifiedPANs[service]];
            
            // Convert file to base64
            const fileData = await fileToBase64(selectedFiles[service]);
            console.log('File converted to base64');

            // Create document data object
            const documentData = {
                id: Date.now().toString(),
                fileName: selectedFiles[service].name,
                fileData: fileData,
                status: 'Pending Review',
                panData: panData,
                service: service,
                transactionHash: tx.hash,
                timestamp: new Date().toISOString(),
                walletAddress: userWalletAddress
            };

            console.log('Document data created:', documentData);

            // Get existing documents from localStorage
            let existingDocs = [];
            try {
                existingDocs = JSON.parse(localStorage.getItem('adminDocuments') || '[]');
            } catch (e) {
                console.error('Error parsing existing documents:', e);
            }

            // Add new document
            existingDocs.push(documentData);
            
            // Save to localStorage
            try {
                localStorage.setItem('adminDocuments', JSON.stringify(existingDocs));
                console.log('Document saved to localStorage. Total documents:', existingDocs.length);
            } catch (e) {
                console.error('Error saving to localStorage:', e);
            }

            // Show success message
            showSuccess(`
                <h3 class="text-xl font-bold mb-4">Payment Successful!</h3>
                <p class="mb-4">Your document has been submitted for review.</p>
                <div class="bg-gray-800 p-4 rounded-lg mb-4 text-left">
                    <p><span class="text-gray-400">Name:</span> ${panData.name}</p>
                    <p><span class="text-gray-400">Service:</span> ${service}</p>
                    <p><span class="text-gray-400">Transaction:</span> <a href="https://sepolia.etherscan.io/tx/${tx.hash}" target="_blank" class="text-blue-400 hover:underline">View Transaction</a></p>
                </div>
            `);
            
            // Reset UI
            resetUIAfterPayment(service, originalText);

        } catch (error) {
            throw new Error('Transaction failed: ' + error.message);
        }

    } catch (error) {
        console.error('Payment error:', error);
        showError(error.message);
        payButton.innerHTML = `<span class="payment-text">${originalText}</span>`;
        payButton.disabled = false;
    }
}

// Helper function to reset UI after payment
function resetUIAfterPayment(service, originalText) {
    const payButton = document.getElementById(`payButton-${service}`);
    payButton.innerHTML = `<span class="payment-text">${originalText}</span>`;
    payButton.disabled = false;
    delete selectedFiles[service];
    document.getElementById(`certificateFile-${service}`).value = '';
    document.getElementById(`fileInfo-${service}`).textContent = '';
    document.getElementById(`panVerificationResult-${service}`).classList.add('hidden');
    document.getElementById(`certificateFile-${service}`).disabled = true;
    document.getElementById(`fileUploadButton-${service}`).classList.add('opacity-50', 'cursor-not-allowed');
    payButton.classList.add('opacity-50', 'cursor-not-allowed');
}

// Helper function to convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
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

// Add scroll reveal animation
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    
    reveals.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('active');
        }
    });
}

// Add this function to handle logout
function handleLogout() {
    // Disconnect wallet if connected
    if (userWalletAddress) {
        disconnectWallet();
    }
    
    // Show loading state
    const logoutButton = document.querySelector('button[onclick="handleLogout()"]');
    const originalContent = logoutButton.innerHTML;
    logoutButton.innerHTML = '<span class="animate-spin">↻</span> Logging out...';
    
    // Simulate a brief delay for better UX
    setTimeout(() => {
        // Redirect to index.html
        window.location.href = 'index.html';
    }, 1000);
}
// Add this new function to update the documents table
function updateDocumentsTable() {
    const tableBody = document.getElementById('documentStatusTable');
    const emptyState = document.getElementById('emptyState');
    
    if (uploadedDocuments.size === 0) {
        tableBody.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    tableBody.innerHTML = '';
    
    uploadedDocuments.forEach((doc, service) => {
        const row = document.createElement('tr');
        row.className = 'border-t border-gray-800';
        
        const statusClass = doc.status === 'Verified' 
            ? 'text-green-400' 
            : 'text-yellow-400';
        
        row.innerHTML = `
            <td class="px-6 py-4 text-sm text-gray-300">${service}</td>
            <td class="px-6 py-4 text-sm text-gray-300">${doc.fileName}</td>
            <td class="px-6 py-4 text-sm ${statusClass}">${doc.status}</td>
            <td class="px-6 py-4 text-sm text-gray-300">
                ${doc.transactionHash 
                    ? `<a href="https://sepolia.etherscan.io/tx/${doc.transactionHash}" 
                         target="_blank" 
                         class="text-blue-400 hover:underline">
                         ${doc.transactionHash.substring(0, 6)}...${doc.transactionHash.substring(doc.transactionHash.length - 4)}
                       </a>`
                    : '-'}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}
