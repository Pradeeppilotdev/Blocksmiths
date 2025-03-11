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
            throw new Error('MetaMask not found. Please install MetaMask to use this application.');
        }
        console.log('MetaMask found');
        
        // Check which version of ethers is loaded
        console.log('Ethers version:', ethers.version || 'unknown');
        
        // Initialize provider - handle both ethers v5 and v6
        if (ethers.providers && ethers.providers.Web3Provider) {
            // Ethers v5
            console.log('Using ethers v5 syntax');
            provider = new ethers.providers.Web3Provider(window.ethereum);
        } else if (ethers.BrowserProvider) {
            // Ethers v6
            console.log('Using ethers v6 syntax');
            provider = new ethers.BrowserProvider(window.ethereum);
        } else {
            throw new Error('Unsupported ethers.js version. Please check your ethers.js library.');
        }
        
        console.log('Provider initialized:', provider);
        
        // Check if already connected
        let accounts;
        if (provider.listAccounts) {
            accounts = await provider.listAccounts();
        } else if (provider.getAccounts) {
            accounts = await provider.getAccounts();
        } else {
            accounts = await window.ethereum.request({ method: 'eth_accounts' });
        }
        
        console.log('Accounts:', accounts);
        
        if (accounts && accounts.length > 0) {
            userWalletAddress = accounts[0];
            console.log('Already connected to wallet:', userWalletAddress);
            
            // Update UI
            document.getElementById('connectWallet').innerHTML = `
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 13l4 4L19 7" />
                </svg>
                <span>${userWalletAddress.substring(0, 6)}...${userWalletAddress.substring(38)}</span>
            `;
            
            document.getElementById('networkBadge').classList.remove('hidden');
        }
        
        return true;
    } catch (error) {
        console.error('Blockchain initialization error:', error);
        showError('Failed to initialize blockchain: ' + error.message);
        return false;
    }
}

// Connect wallet function
async function connectWallet() {
    try {
        console.log('Connecting wallet...');
        
        // Initialize blockchain if not already done
        if (!provider) {
            const initialized = await initBlockchain();
            if (!initialized) {
                throw new Error('Failed to initialize blockchain');
            }
        }
        
        console.log('Requesting accounts...');
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Accounts received:', accounts);
        
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found. Please check your MetaMask extension.');
        }
        
        userWalletAddress = accounts[0];
        console.log('Connected to wallet:', userWalletAddress);
        
        // Update UI
        document.getElementById('connectWallet').innerHTML = `
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 13l4 4L19 7" />
            </svg>
            <span>${userWalletAddress.substring(0, 6)}...${userWalletAddress.substring(38)}</span>
        `;
        
        document.getElementById('networkBadge').classList.remove('hidden');
        
        return true;
    } catch (error) {
        console.error('Wallet connection error:', error);
        showError('Failed to connect wallet: ' + error.message);
        return false;
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
            <p>PAN: ${userVerificationState.userData.panNumber}</p>
        </div>
    `;

    // Enable upload buttons
    document.querySelectorAll('.upload-button').forEach(button => {
        button.disabled = false;
    });
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

// Add verification log storage
async function storeVerificationLog(logData) {
    console.log('Storing verification log:', logData);
    
    // Store in localStorage
    try {
        // Get existing logs or initialize empty array
        const existingLogs = JSON.parse(localStorage.getItem('verificationLogs') || '[]');
        
        // Add new log
        existingLogs.push({
            ...logData,
            timestamp: new Date().toISOString()
        });
        
        // Save back to localStorage
        localStorage.setItem('verificationLogs', JSON.stringify(existingLogs));
        
        console.log('Verification log stored in localStorage');
    } catch (error) {
        console.error('Error storing verification log:', error);
    }
}

// Client-side IPFS upload function
async function uploadToIPFSClient(file, metadata) {
    console.log('Uploading to IPFS directly from client...');
    
    // Create a Pinata API key and secret (for demo purposes)
    // In production, you should use a more secure approach
    const PINATA_API_KEY = 'YOUR_PINATA_API_KEY';
    const PINATA_SECRET_KEY = 'YOUR_PINATA_SECRET_KEY';
    
    // Create a FormData object
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata
    const metadataObj = {
        name: file.name,
        keyvalues: metadata
    };
    formData.append('pinataMetadata', JSON.stringify(metadataObj));
    
    // Add options
    formData.append('pinataOptions', JSON.stringify({
        cidVersion: 0
    }));
    
    try {
        // Make direct API call to Pinata
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_KEY
            },
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error('Pinata error:', errorData);
            
            // For demo purposes, return a mock response if Pinata API keys are not set
            if (PINATA_API_KEY === 'YOUR_PINATA_API_KEY') {
                console.log('Using mock IPFS response since API keys are not set');
                const mockCid = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                return {
                    success: true,
                    cid: mockCid,
                    url: `https://gateway.pinata.cloud/ipfs/${mockCid}`
                };
            }
            
            throw new Error('Failed to upload to IPFS: ' + errorData);
        }
        
        const data = await response.json();
        return {
            success: true,
            cid: data.IpfsHash,
            url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`
        };
    } catch (error) {
        console.error('IPFS upload error:', error);
        
        // For demo purposes, return a mock response
        if (PINATA_API_KEY === 'YOUR_PINATA_API_KEY') {
            console.log('Using mock IPFS response due to error');
            const mockCid = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            return {
                success: true,
                cid: mockCid,
                url: `https://gateway.pinata.cloud/ipfs/${mockCid}`
            };
        }
        
        throw error;
    }
}

async function handlePayment(service) {
    console.log('Processing payment for service:', service);
    
    // Update button state first to show loading
    const payButton = document.getElementById(`payButton-${service}`);
    const originalText = payButton.innerHTML;
    payButton.innerHTML = `
        <div class="payment-loading">
            <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    `;
    payButton.disabled = true;
    
    try {
        // Check if file is uploaded
        if (!selectedFiles[service]) {
            throw new Error('Please upload a certificate file first');
        }
        
        // Initialize blockchain and connect wallet if needed
        if (!provider || !userWalletAddress) {
            console.log('Provider or wallet not initialized, initializing now...');
            await initBlockchain();
            
            // If still not initialized after trying, connect wallet explicitly
            if (!userWalletAddress) {
                console.log('Wallet not connected, connecting now...');
                const connected = await connectWallet();
                if (!connected) {
                    throw new Error('Failed to connect wallet');
                }
            }
        }
        
        // Double-check that provider and wallet are now available
        if (!provider || !userWalletAddress) {
            throw new Error('Wallet connection failed. Please try again.');
        }
        
        // Get payment amount based on service
        let amount;
        switch(service) {
            case 'electricity': amount = '0.001'; break;
            case 'water': amount = '0.0015'; break;
            case 'building': amount = '0.002'; break;
            case 'document': amount = '0.0005'; break;
            default: amount = '0.001';
        }
        
        console.log('Initiating payment of', amount, 'ETH');
        
        // First, upload the file to IPFS via Pinata
        console.log('Uploading file to IPFS via Pinata...');
        payButton.innerHTML = `
            <div class="payment-loading">
                <span class="mr-2">Uploading file...</span>
                <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        `;
        
        // Upload file to IPFS via Pinata directly from client
        const file = selectedFiles[service];
        
        // Create metadata
        const metadata = {
            service: service,
            walletAddress: userWalletAddress,
            timestamp: new Date().toISOString(),
            panNumber: userVerificationState.userData.panNumber,
            userName: userVerificationState.userData.name
        };
        
        // Upload directly from client
        const uploadData = await uploadToIPFSClient(file, metadata);
        
        console.log('File uploaded to IPFS via Pinata:', uploadData);
        
        if (!uploadData.success || !uploadData.cid) {
            throw new Error('Failed to get IPFS CID');
        }
        
        const ipfsCid = uploadData.cid;
        const ipfsUrl = uploadData.url || `https://gateway.pinata.cloud/ipfs/${ipfsCid}`;
        
        // Now process the payment
        console.log('File uploaded, processing payment...');
        payButton.innerHTML = `
            <div class="payment-loading">
                <span class="mr-2">Processing payment...</span>
                <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        `;
        
        // Get the contract address
        const contractAddress = CONTRACT_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
        
        // Create transaction parameters
        let tx;
        let transaction;
        
        // Handle both ethers v5 and v6
        if (ethers.utils && ethers.utils.parseEther) {
            // Ethers v5
            console.log('Using ethers v5 for transaction');
            const signer = provider.getSigner();
            tx = {
                to: contractAddress,
                value: ethers.utils.parseEther(amount)
            };
            transaction = await signer.sendTransaction(tx);
        } else if (ethers.parseEther) {
            // Ethers v6
            console.log('Using ethers v6 for transaction');
            const signer = await provider.getSigner();
            tx = {
                to: contractAddress,
                value: ethers.parseEther(amount)
            };
            transaction = await signer.sendTransaction(tx);
        } else {
            // Fallback to direct MetaMask API
            console.log('Using direct MetaMask API for transaction');
            const weiAmount = BigInt(parseFloat(amount) * 1e18);
            const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: userWalletAddress,
                    to: contractAddress,
                    value: '0x' + weiAmount.toString(16)
                }]
            });
            transaction = { hash: txHash };
        }
        
        console.log('Transaction sent:', transaction.hash);
        
        // Store transaction details in localStorage instead of server
        const transactionRecord = {
            service: service,
            amount: amount,
            transactionHash: transaction.hash,
            walletAddress: userWalletAddress,
            fileName: file.name,
            ipfsCid: ipfsCid,
            ipfsUrl: ipfsUrl,
            panNumber: userVerificationState.userData.panNumber,
            userName: userVerificationState.userData.name,
            timestamp: new Date().toISOString()
        };
        
        // Get existing transactions or initialize empty array
        const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        existingTransactions.push(transactionRecord);
        localStorage.setItem('transactions', JSON.stringify(existingTransactions));
        
        console.log('Transaction record stored in localStorage');
        
        // Show success message with IPFS link
        Swal.fire({
            title: 'Payment Successful!',
            html: `
                <p>Payment of ${amount} ETH has been processed successfully.</p>
                <p class="mt-4">Your document has been stored on IPFS:</p>
                <a href="${ipfsUrl}" target="_blank" class="text-blue-500 hover:underline break-all">${ipfsUrl}</a>
                <p class="mt-4">Transaction Hash:</p>
                <a href="https://sepolia.etherscan.io/tx/${transaction.hash}" target="_blank" class="text-blue-500 hover:underline break-all">${transaction.hash}</a>
            `,
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3B82F6'
        });
        
        // Update UI
        payButton.innerHTML = `
            <svg class="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 13l4 4L19 7" />
            </svg>
            <span>Paid</span>
        `;
        payButton.disabled = true;
        
        // Add IPFS link below the button
        const fileInfo = document.getElementById(`fileInfo-${service}`);
        fileInfo.innerHTML = `
            <div class="mt-2">
                <p class="text-sm text-gray-400">File uploaded to IPFS:</p>
                <a href="${ipfsUrl}" target="_blank" class="text-sm text-blue-400 hover:underline break-all">${ipfsUrl}</a>
            </div>
        `;
        
    } catch (error) {
        console.error('Payment error:', error);
        showError(error.message);
        
        // Reset button
        payButton.innerHTML = originalText;
        payButton.disabled = false;
    }
}

// PAN verification function
async function verifyPAN(event) {
    try {
        // Make sure we have a valid event
        if (!event || !event.target) {
            console.error('Invalid event object:', event);
            showError('Error: Invalid event object');
            return;
        }
        
        // Get the PAN number from the input field closest to the clicked button
        const clickedButton = event.target;
        const panInput = clickedButton.closest('.mb-6').querySelector('#panNumber');
        
        if (!panInput) {
            console.error('Could not find PAN input field');
            showError('Error: Could not find PAN input field');
            return;
        }
        
        const panNumber = panInput.value;
        
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        
        if (!panRegex.test(panNumber)) {
            showError('Invalid PAN format. Please use format: ABCDE1234F');
            return;
        }
        
        // Show loading state
        clickedButton.innerHTML = '<span class="animate-pulse">Verifying...</span>';
        clickedButton.disabled = true;
        
        console.log('Verifying PAN:', panNumber);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Client-side mock verification
        // Extract a name from the PAN number for demonstration
        const firstChar = panNumber.charAt(0);
        let mockName;
        let mockDob = '01/01/1990';
        let mockGender = 'Male';
        
        switch(firstChar) {
            case 'A': mockName = "Amit Kumar"; break;
            case 'B': mockName = "Bhavesh Patel"; break;
            case 'C': mockName = "Chetan Singh"; break;
            case 'D': mockName = "Deepak Sharma"; break;
            case 'E': mockName = "Ekta Verma"; mockGender = "Female"; break;
            case 'F': mockName = "Farhan Khan"; break;
            case 'G': mockName = "Gaurav Gupta"; break;
            case 'H': mockName = "Harish Reddy"; break;
            case 'I': mockName = "Ishaan Joshi"; break;
            case 'J': mockName = "Jaya Kumari"; mockGender = "Female"; break;
            case 'K': mockName = "Karan Malhotra"; break;
            case 'L': mockName = "Lakshmi Narayan"; break;
            case 'M': mockName = "Manish Tiwari"; break;
            case 'N': mockName = "Neha Kapoor"; mockGender = "Female"; break;
            case 'O': mockName = "Om Prakash"; break;
            case 'P': mockName = "Priya Desai"; mockGender = "Female"; break;
            case 'Q': mockName = "Qamar Ahmed"; break;
            case 'R': mockName = "Rahul Mehta"; break;
            case 'S': mockName = "Sanjay Yadav"; break;
            case 'T': mockName = "Tanvi Mishra"; mockGender = "Female"; break;
            case 'U': mockName = "Umesh Patil"; break;
            case 'V': mockName = "Vijay Chauhan"; break;
            case 'W': mockName = "Wasim Akram"; break;
            case 'X': mockName = "Xavier D'Souza"; break;
            case 'Y': mockName = "Yogesh Agarwal"; break;
            case 'Z': mockName = "Zara Sheikh"; mockGender = "Female"; break;
            default: mockName = "John Doe";
        }
        
        // Create mock response data
        const data = {
            success: true,
            data: {
                name: mockName,
                pan_number: panNumber,
                status: "VALID",
                dob: mockDob,
                gender: mockGender,
                address: {
                    street: "123 Main Street",
                    city: "Mumbai",
                    state: "Maharashtra",
                    pincode: "400001",
                    country: "India"
                }
            },
            source: 'mock'
        };
        
        console.log('Mock PAN verification response:', data);
        
        // Reset button state
        clickedButton.innerHTML = 'Verify PAN';
        clickedButton.disabled = false;
        
        if (data.success) {
            // Update verification state
            userVerificationState.isVerified = true;
            userVerificationState.userData.panNumber = panNumber;
            userVerificationState.userData.name = data.data.name;
            
            // Create a more detailed verification message
            let verificationDetails = `
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div class="font-semibold">Name:</div>
                    <div>${data.data.name}</div>
                    
                    <div class="font-semibold">PAN:</div>
                    <div>${data.data.pan_number}</div>
                    
                    <div class="font-semibold">DOB:</div>
                    <div>${data.data.dob}</div>
                    
                    <div class="font-semibold">Gender:</div>
                    <div>${data.data.gender}</div>
                </div>
            `;
            
            if (data.data.address) {
                verificationDetails += `
                    <div class="mt-2 text-sm">
                        <div class="font-semibold">Address:</div>
                        <div>${data.data.address.street}, ${data.data.address.city}</div>
                        <div>${data.data.address.state} - ${data.data.address.pincode}, ${data.data.address.country}</div>
                    </div>
                `;
            }
            
            // Update UI to show verified state in all service cards
            const verificationStatusDivs = document.querySelectorAll('#verificationStatus');
            verificationStatusDivs.forEach(div => {
                div.innerHTML = `
                    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        <p class="font-bold mb-2">Verification Successful</p>
                        ${verificationDetails}
                        <p class="text-xs mt-2 text-gray-500">${data.source === 'mock' ? 'Development Mode' : 'Official Verification'}</p>
                    </div>
                `;
            });
            
            // Enable file upload buttons
            const fileInputs = document.querySelectorAll('input[type="file"]');
            fileInputs.forEach(input => {
                input.disabled = false;
            });
            
            // Update file input labels to show they're now enabled
            const fileLabels = document.querySelectorAll('label[for^="certificateFile-"]');
            fileLabels.forEach(label => {
                label.classList.remove('bg-gray-700');
                label.classList.add('bg-blue-600', 'hover:bg-blue-700');
            });
            
            // Show success message
            showSuccess('PAN verification successful!');
        } else {
            showError('PAN verification failed: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('PAN verification error:', error);
        
        // Reset button state
        if (event && event.target) {
            event.target.innerHTML = 'Verify PAN';
            event.target.disabled = false;
        }
        
        showError('Error verifying PAN: ' + error.message);
    }
}

// Function to show error messages
function showError(message) {
    console.log('Showing error:', message);
    const errorAlert = document.getElementById('errorAlert');
    const errorText = document.getElementById('errorText');
    
    if (errorAlert && errorText) {
        errorText.textContent = message;
        errorAlert.classList.remove('hidden');
        
        setTimeout(() => {
            errorAlert.classList.add('hidden');
        }, 5000);
    } else {
        // Fallback if elements not found
        alert('Error: ' + message);
    }
}

// Function to show success messages
function showSuccess(message) {
    console.log('Showing success:', message);
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Success!',
            text: message,
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3B82F6'
        });
    } else {
        // Fallback if SweetAlert not available
        alert('Success: ' + message);
    }
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