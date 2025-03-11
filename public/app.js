// Global state
let userWalletAddress = null;
let provider = null;
let signer = null;
let contract = null;
const selectedFiles = {};

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

<<<<<<< HEAD
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // Chain ID for Sepolia

// Add DigiLocker configuration
const DIGILOCKER_CONFIG = {
    API_URL: 'YOUR_DIGILOCKER_API_ENDPOINT',
    CLIENT_ID: 'YOUR_CLIENT_ID',
    CLIENT_SECRET: 'YOUR_CLIENT_SECRET'
};

// Add verification state
let userVerificationState = {
    isVerified: false,
    aadharVerified: false,
    panVerified: false,
    userData: null
};

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

=======
>>>>>>> parent of 47712672 (blocksmiths)
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

// Add DigiLocker verification functions
async function initiateDigiLockerVerification() {
    try {
        const response = await axios.post('/api/digilocker/initiate', {
            walletAddress: userWalletAddress
        });
        
        // Open DigiLocker authorization window
        const authWindow = window.open(
            response.data.authUrl,
            'DigiLocker Authorization',
            'width=800,height=600'
        );

        // Listen for verification completion
        window.addEventListener('message', handleDigiLockerCallback);
    } catch (error) {
        showError('Failed to initiate DigiLocker verification');
        console.error(error);
    }
}

async function handleDigiLockerCallback(event) {
    try {
        if (event.data.type === 'DIGILOCKER_CALLBACK') {
            const code = event.data.code;
            
            // Verify documents with DigiLocker
            const verificationResult = await axios.post('/api/digilocker/verify', {
                code: code,
                walletAddress: userWalletAddress
            });

            if (verificationResult.data.verified) {
                userVerificationState = {
                    isVerified: true,
                    aadharVerified: verificationResult.data.aadharVerified,
                    panVerified: verificationResult.data.panVerified,
                    userData: verificationResult.data.userData
                };
                
                showSuccess('Documents verified successfully!');
                updateUIAfterVerification();
            } else {
                throw new Error('Document verification failed');
            }
        }
    } catch (error) {
        showError('Verification failed: ' + error.message);
        console.error(error);
    }
}

function updateUIAfterVerification() {
    // Update UI to show verification status
    const verificationStatus = document.getElementById('verificationStatus');
    verificationStatus.innerHTML = `
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p class="font-bold">Verified User</p>
            <p>Aadhar: ${userVerificationState.userData.aadharNumber}</p>
            <p>PAN: ${userVerificationState.userData.panNumber}</p>
        </div>
    `;

    // Enable upload buttons
    document.querySelectorAll('.upload-button').forEach(button => {
        button.disabled = false;
    });
}

// Modify handleFileSelect to check verification
function handleFileSelect(event, service) {
    if (!userVerificationState.isVerified) {
        showError('Please verify your documents through DigiLocker first');
        event.target.value = '';
        return;
    }

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

        // Add verification log data
        const verificationLog = {
            timestamp: new Date().toISOString(),
            walletAddress: userWalletAddress,
            aadharNumber: userVerificationState.userData.aadharNumber,
            panNumber: userVerificationState.userData.panNumber,
            fileName: file.name,
            fileType: file.type,
            service: service
        };

        // Store verification log
        storeVerificationLog(verificationLog);

        selectedFiles[service] = file;
        fileInfo.textContent = `Selected: ${file.name}`;
        fileInfo.className = 'mt-2 text-sm text-gray-500';
        payButton.disabled = false;
    }
}

// Add verification log storage
async function storeVerificationLog(logData) {
    try {
        await axios.post('/api/verification/log', {
            ...logData,
            signature: await signVerificationLog(logData)
        });
    } catch (error) {
        console.error('Failed to store verification log:', error);
    }
}

// Sign verification log with user's wallet
async function signVerificationLog(logData) {
    const message = JSON.stringify(logData);
    const signature = await signer.signMessage(message);
    return signature;
}

// Payment handling
async function handlePayment(service) {
    try {
        if (!userWalletAddress) {
            throw new Error('Please connect your wallet first');
        }

        const payButton = document.getElementById(`payButton-${service}`);
        const originalText = payButton.innerHTML || 'Pay Now';  // Save original text with fallback
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

        // Upload to Pinata
        const formData = new FormData();
        formData.append('file', selectedFiles[service]);

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

        showSuccess(`Payment successful! View certificate: https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
        
        // Reset UI
        payButton.innerHTML = originalText;
        payButton.disabled = false;
        delete selectedFiles[service];
        document.getElementById(`certificateFile-${service}`).value = '';
        document.getElementById(`fileInfo-${service}`).textContent = '';

    } catch (error) {
        console.error('Payment error:', error);
        showError(error.message);
        
        const payButton = document.getElementById(`payButton-${service}`);
        payButton.innerHTML = originalText || 'Pay Now';
        payButton.disabled = false;
    }
}

function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
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