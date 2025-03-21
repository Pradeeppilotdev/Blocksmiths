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
const contractAddress = window.CONTRACT_ADDRESS || '0x8a8D3b51DD43d5673322ceA64f8957F2eca92ccD';
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

// Update the SEPOLIA_CHAIN_ID constant to handle both formats
const SEPOLIA_CHAIN_ID = '0xaa36a7';
const SEPOLIA_CHAIN_ID_DECIMAL = '11155111';

// Add Firebase configuration for Blocksmiths project
const firebaseConfig = {
  apiKey: "AIzaSyC1xpIBYJ9z8Xgwrt1RkZQffyPhtnAhY3c",
  authDomain: "blocksmiths-a8021.firebaseapp.com",
  databaseURL: "https://blocksmiths-a8021-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "blocksmiths-a8021",
  storageBucket: "blocksmiths-a8021.firebasestorage.app",
  messagingSenderId: "243684466522",
  appId: "1:243684466522:web:8f1231b1e3831de1c99d63",
  measurementId: "G-FVBSQRWGB1"
};

// Initialize Firebase
let firebaseApp;
let firebaseStorage;
let firebaseDb;

// Initialize Firebase when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize Firebase
        firebaseApp = firebase.initializeApp(firebaseConfig);
        firebaseStorage = firebase.storage();
        firebaseDb = firebase.database();
        console.log("Firebase initialized successfully for Blocksmiths project");
        
        // Test Firebase connectivity
        testFirebaseConnection();
    } catch (error) {
        console.error("Firebase initialization error:", error);
        showError("Failed to initialize Firebase: " + error.message);
    }
});

// Function to initialize Firebase if not already initialized
function initFirebase() {
    if (!firebaseApp) {
        try {
            console.log("Initializing Firebase...");
            firebaseApp = firebase.initializeApp(firebaseConfig);
            firebaseStorage = firebase.storage();
            firebaseDb = firebase.database();
            console.log("Firebase initialized successfully");
            return true;
        } catch (error) {
            console.error("Firebase initialization error:", error);
            showError("Failed to initialize Firebase: " + error.message);
            return false;
        }
    } else {
        console.log("Firebase already initialized");
        return true;
    }
}

// Function to test Firebase database connectivity
function testFirebaseConnection() {
    if (firebaseDb) {
        // Write a test value to a test location
        firebaseDb.ref('test/connection').set({
            timestamp: new Date().getTime(),
            message: 'Test connection successful'
        })
        .then(() => {
            console.log('✅ Firebase connection test successful');
            showSuccess(`
                <h3 class="text-xl font-bold mb-4">Firebase Connection Successful!</h3>
                <p class="mb-4">Successfully connected to Firebase Realtime Database.</p>
            `);
        })
        .catch(error => {
            console.error('❌ Firebase connection test failed:', error);
            
            // Special handling for permission denied errors
            if (error.message && error.message.includes('permission_denied')) {
                console.error('You need to update your Firebase database rules to allow read/write access.');
                console.log('Please go to: https://console.firebase.google.com/project/blocksmiths-a8021/database/blocksmiths-a8021-default-rtdb/rules');
                console.log('And update your rules to:');
                console.log(`
                {
                  "rules": {
                    ".read": true,
                    ".write": true
                  }
                }
                `);
                
                // Show debug panel to make testing easier
                document.getElementById('debugPanel').style.display = 'block';
                
                // Show a more detailed error dialog
                showSuccess(`
                    <h3 class="text-xl font-bold mb-4 text-red-500">Firebase Permission Error</h3>
                    <p class="mb-4">Your app cannot write to Firebase database due to security rules.</p>
                    <div class="bg-gray-800 p-4 rounded-lg mb-4 text-left">
                        <p>To fix this issue:</p>
                        <ol class="list-decimal pl-5 mt-2 space-y-1">
                            <li>Go to the <a href="https://console.firebase.google.com/project/blocksmiths-a8021/database/blocksmiths-a8021-default-rtdb/rules" target="_blank" class="text-blue-400 hover:underline">Firebase Console Rules</a></li>
                            <li>Replace current rules with:</li>
                            <pre class="bg-gray-900 p-2 rounded mt-2 overflow-x-auto">
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
                            </pre>
                            <li>Click "Publish" and try again</li>
                        </ol>
                        <p class="text-yellow-400 mt-4 text-sm">Note: These rules allow public access and should be replaced with proper security rules before production.</p>
                    </div>
                `);
            }
        });
    } else {
        console.error('❌ Firebase DB not initialized');
    }
}

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
    
    // Check contract ABI
    console.log("Contract ABI length:", contractABI ? contractABI.length : "undefined");
    
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
        console.log('Signer initialized:', await signer.getAddress());

        // Use the same approach that worked in the direct test
        try {
            console.log('Creating contract with address:', contractAddress);
            
            // Create a minimal ABI if the full one is causing issues
            const minimalABI = [
                {
                    "inputs": [{"internalType": "string", "name": "service", "type": "string"}],
                    "name": "getServiceFee",
                    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "owner",
                    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {"internalType": "string", "name": "service", "type": "string"},
                        {"internalType": "string", "name": "ipfsHash", "type": "string"}
                    ],
                    "name": "makePayment",
                    "outputs": [],
                    "stateMutability": "payable",
                    "type": "function"
                }
            ];
            
            // Use the minimal ABI that we know works
            contract = new window.ethers.Contract(contractAddress, minimalABI, signer);
            console.log('Contract object created');
            
            // Test contract read function
            try {
                const fee = await contract.getServiceFee('electricity');
                console.log('Contract verified! Service fee for electricity:', fee.toString());
                console.log('Contract mode is ACTIVE - blockchain payments will be processed');
                
                // Also test owner function
                const owner = await contract.owner();
                console.log('Contract owner:', owner);
                
                // Force the contract to be recognized as valid
                if (fee && owner) {
                    console.log('Contract validation complete - ready for transactions');
                }
            } catch (readError) {
                console.error('Contract read test failed:', readError);
                console.log('Error details:', readError.message);
                contract = null;
                console.log('Continuing in Firebase-only mode (no blockchain transactions)');
            }
        } catch (contractError) {
            console.error('Contract initialization error:', contractError);
            contract = null;
            console.log('Continuing in Firebase-only mode (no blockchain transactions)');
        }

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
        // Make sure the input has the correct styles for text visibility
        input.classList.add('text-white');
        input.style.color = 'white';
        // Ensure the input is actually editable
        input.readOnly = false;
    });
    
    document.querySelectorAll('[id^="verifyPanButton-"]').forEach(button => {
        button.disabled = false;
        button.classList.remove('opacity-50', 'cursor-not-allowed');
    });
    
    // File inputs and payment buttons will be enabled based on PAN verification
    console.log("Service interactions enabled - PAN inputs should be editable now");
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

// Function to create network badge that shows temporarily for 3 seconds
function createNetworkBadge() {
    const networkBadge = document.getElementById('networkBadge');
    if (networkBadge) {
        networkBadge.classList.remove('hidden');
        // Hide network badge after 3 seconds
        setTimeout(() => {
            networkBadge.classList.add('hidden');
        }, 3000);
    }
}

// Modified connectWallet function to ensure contract initialization
async function connectWallet() {
    console.log("Connecting wallet...");
    
    if (window.ethereum) {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userWalletAddress = accounts[0];
            console.log("Connected wallet:", userWalletAddress);
            
            // Update UI to show connected wallet - using correct element ID
            const walletButton = document.getElementById('connectWallet');
            if (walletButton) {
                walletButton.innerHTML = `
                    <div class="flex items-center">
                        <span class="mr-2">${userWalletAddress.slice(0, 6)}...${userWalletAddress.slice(-4)}</span>
                        <svg class="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                `;
                walletButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
                walletButton.classList.add('bg-green-500', 'hover:bg-green-600');
                walletButton.onclick = disconnectWallet;
                
                // Create network badge with temporary display
                createNetworkBadge();
            }
            
            // Initialize blockchain (including contract)
            const blockchainInitialized = await initBlockchain();
            console.log("Blockchain initialization result:", blockchainInitialized);
            
            // If contract is still null, try the direct test approach
            if (!contract) {
                console.log("Contract initialization failed, trying direct approach...");
                contract = await testContractDirectly();
                console.log("Direct contract test result:", contract ? "Success" : "Failed");
            }
            
            // Initialize Firebase only if not already initialized
            await initFirebase();
            
            // Enable service interactions BEFORE updating document table
            enableAllServiceInteractions();

            // Update document table immediately
            setTimeout(() => {
                updateDocumentTable();
            }, 500);
            
            // Force check and make sure inputs are enabled with correct styles
            setTimeout(() => {
                document.querySelectorAll('[id^="panInput-"]').forEach(input => {
                    input.disabled = false;
                    input.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-gray-700');
                    input.classList.add('text-white');
                    input.style.color = 'white';
                    input.readOnly = false;
                });
                console.log("Double-checked that PAN inputs are enabled");
            }, 800);
            
            return true;
        } catch (error) {
            console.error("Error connecting wallet:", error);
            showError("Failed to connect wallet: " + error.message);
            return false;
        }
    } else {
        showError("Ethereum wallet not detected. Please install MetaMask or compatible wallet.");
        return false;
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
                
                // Initialize Firebase
                initFirebase();
                
                // Enable service interactions if wallet is connected
                enableAllServiceInteractions();
                
                // Show temporary network badge
                createNetworkBadge();
                
                // Update the document table
                setTimeout(() => {
                    updateDocumentTable();
                }, 1000);
            }
        }
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
        const payButton = document.getElementById(`payButton-${service}`);
        
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
            
            // Update pay button text if in Firebase-only mode
            if (!contract || !contract.address) {
                const paymentText = payButton.querySelector('.payment-text');
                if (paymentText) {
                    paymentText.textContent = "Submit Document";
                }
            }
            
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
    console.log(`File selected for ${service}`);
    
    const file = event.target.files[0];
    if (!file) {
        console.log('No file selected');
        return;
    }
    
    // Store the selected file
    selectedFiles[service] = file;
    
    // Update the file info display
    const fileInfoElement = document.getElementById(`fileInfo-${service}`);
    if (fileInfoElement) {
        fileInfoElement.textContent = `Selected: ${file.name} (${formatFileSize(file.size)})`;
        fileInfoElement.classList.remove('text-gray-500');
        fileInfoElement.classList.add('text-green-400');
    }
    
    // Enable the payment button
    const payButton = document.getElementById(`payButton-${service}`);
    if (payButton) {
        console.log(`Enabling payment button for ${service}`);
        payButton.disabled = false;
        payButton.classList.remove('opacity-50', 'cursor-not-allowed');
        payButton.classList.add('hover:bg-blue-600');
    } else {
        console.error(`Payment button for ${service} not found`);
    }
    
    console.log(`File selected for ${service}, UI updated, payment button enabled`);
    
    // Skip table update to avoid errors
    // console.log(`File selected for ${service}, skipping table update for now`);
}

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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

// Function to upload file to IPFS via Pinata
async function uploadToIPFS(file) {
    try {
        console.log('Uploading to IPFS via Pinata...');
        
        // Update UI text in relevant places that might refer to IPFS
        const uploadingElements = document.querySelectorAll('[id^="payButton-"]');
        uploadingElements.forEach(element => {
            if (element.innerHTML.includes('Uploading to IPFS')) {
                element.innerHTML = '<span class="animate-spin">↻</span> Processing...';
            }
        });
        
        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        
        // Pinata credentials - same as in admin panel (superuser.js)
        const pinataApiKey = 'f06e5fd1f9bd46842319';
        const pinataSecretApiKey = '8860a2b0c4cc09b36797ebf7f1b05026705ce60c97d65687eba30ef2651517cd';
        
        // Upload to IPFS via Pinata with timeout and progress tracking
        const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'pinata_api_key': pinataApiKey,
                'pinata_secret_api_key': pinataSecretApiKey
            },
            timeout: 30000 // 30 second timeout
        });
        
        if (response.status === 200) {
            console.log('Successfully uploaded to IPFS:', response.data);
            return {
                ipfsHash: response.data.IpfsHash,
                ipfsUrl: `https://ipfs.io/ipfs/${response.data.IpfsHash}`
            };
        } else {
            throw new Error(`Pinata upload failed with status ${response.status}`);
        }
    } catch (error) {
        console.error('IPFS upload error:', error);
        throw new Error('Failed to upload to IPFS: ' + (error.response?.data?.error || error.message));
    }
}

// Completely rewritten handlePayment function with NO network check
async function handlePayment(service) {
    console.log(`handlePayment called for ${service}`);
    
    // Update button state
    let originalText = 'Pay Now';
    const payButton = document.getElementById(`payButton-${service}`);
    if (payButton) {
        originalText = payButton.querySelector('.payment-text')?.textContent || 'Pay Now';
        payButton.innerHTML = '<span class="animate-spin">↻</span> Processing...';
        payButton.disabled = true;
    }
    
    try {
        // Skip ALL network checks and just try to make the payment
        console.log('Proceeding directly to payment...');
        
        // Make sure contract is available
        if (!contract) {
            throw new Error('Contract not initialized');
        }
        
        // Get service fee
        console.log('Getting service fee...');
        const serviceFee = await contract.getServiceFee(service);
        console.log('Service fee:', serviceFee.toString());
        
        // Make payment - this should trigger MetaMask
        console.log('Initiating payment...');
        const tx = await contract.makePayment(
            service,
            "test-ipfs-hash",
            {
                value: serviceFee,
                gasLimit: 300000
            }
        );
        
        console.log('Transaction sent:', tx.hash);
        
        // Update button
        if (payButton) {
            payButton.innerHTML = '<span class="animate-spin">↻</span> Confirming Transaction...';
        }
        
        // Wait for confirmation
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt);
        
        // Success!
        showSuccess('Payment successful!');
        
        // Continue with your existing logic...
        
    } catch (error) {
        console.error('Payment error:', error);
        
        // Reset button state
        if (payButton) {
            payButton.innerHTML = `<span class="payment-text">${originalText}</span>`;
            payButton.disabled = false;
        }
        
        showError('Payment error: ' + error.message);
    }
}

// Get service fee based on service type
function getServiceFee(service) {
    const fees = {
        'electricity': '0.001',
        'water': '0.0015',
        'building': '0.002',
        'document': '0.0005'
    };
    return fees[service] || '0.001';
}

// Upload file to Firebase Storage
async function uploadFileToFirebase(file, service, panNumber) {
    return new Promise((resolve, reject) => {
        try {
            if (!firebaseStorage) {
                reject(new Error('Firebase Storage not initialized'));
                return;
            }
            
            // Create a unique filename
            const timestamp = new Date().getTime();
            const fileName = `${service}_${panNumber}_${timestamp}`;
            
            // Create a storage reference
            const storageRef = firebaseStorage.ref();
            const fileRef = storageRef.child(`documents/${fileName}`);
            
            // Upload file
            const uploadTask = fileRef.put(file);
            
            // Listen for state changes, errors, and completion
            uploadTask.on('state_changed',
                // Progress function
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload progress: ' + progress + '%');
                },
                // Error function
                (error) => {
                    console.error('Upload error:', error);
                    reject(error);
                },
                // Complete function
                async () => {
                    // Get download URL
                    try {
                        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                        
                        resolve({
                            fileName: fileName,
                            originalName: file.name,
                            downloadURL: downloadURL,
                            contentType: file.type,
                            size: file.size,
                            uploadTime: timestamp
                        });
                    } catch (error) {
                        console.error('Error getting download URL:', error);
                        reject(error);
                    }
                }
            );
        } catch (error) {
            console.error('Error uploading to Firebase:', error);
            reject(error);
        }
    });
}

// Save user data to Firebase Realtime Database
async function saveToFirebaseDB(service, panNumber, panData, fileData, walletAddress) {
    return new Promise((resolve, reject) => {
        try {
            if (!firebaseDb) {
                reject(new Error('Firebase Database not initialized'));
                return;
            }
            
            // Create a unique record ID
            const timestamp = new Date().getTime();
            const recordId = `${panNumber}_${service}_${timestamp}`;
            
            // Create fileDetails object
            const fileDetails = {
                fileName: fileData.originalName,
                fileSize: fileData.size,
                contentType: fileData.contentType,
                // Include file content for small files
                fileContent: fileData.fileContent,
                // Include storage issue flag if present
                storageIssue: fileData.storageIssue || null
            };
            
            // Add IPFS data to fileDetails if available
            if (fileData.ipfsHash) {
                fileDetails.ipfsHash = fileData.ipfsHash;
                fileDetails.ipfsUrl = fileData.ipfsUrl;
            }
            
            // Create document data with proper structure
            const docData = {
                id: recordId, // Store ID in the document for easy reference
                service: service,
                panNumber: panNumber,
                userDetails: {
                    name: panData.name,
                    dob: panData.dob,
                    address: panData.address
                },
                walletAddress: walletAddress,
                fileDetails: fileDetails,
                status: 'Pending',
                createdAt: timestamp
            };
            
            // Add IPFS data at root level too for easier access
            if (fileData.ipfsHash) {
                docData.ipfsHash = fileData.ipfsHash;
                docData.ipfsUrl = fileData.ipfsUrl;
                console.log('IPFS hash saved to document record:', fileData.ipfsHash);
            }
            
            // Reference to the database
            const dbRef = firebaseDb.ref('userDocuments/' + recordId);
            
            // Save to Firebase
            dbRef.set(docData, (error) => {
                if (error) {
                    console.error('Error saving to Firebase:', error);
                    reject(error);
                } else {
                    console.log('Data saved successfully with record ID:', recordId);
                    
                    // Log IPFS status for debugging
                    if (fileData.ipfsHash) {
                        console.log('Document stored with IPFS hash:', fileData.ipfsHash);
                    } else {
                        console.log('Document stored without IPFS hash');
                    }
                    
                    // Add ID to the returned object
                    docData.id = recordId; 
                    resolve(docData);
                }
            });
        } catch (error) {
            console.error('Error saving to Firebase Database:', error);
            reject(error);
        }
    });
}

// Update transaction details in Firebase
async function updateTransactionDetails(service, panNumber, transactionHash) {
    return new Promise((resolve, reject) => {
        try {
            if (!firebaseDb) {
                reject(new Error('Firebase Database not initialized'));
                return;
            }
            
            // Find the latest record for this PAN+service combination
            const dbRef = firebaseDb.ref('userDocuments');
            
            dbRef.orderByChild('panNumber').equalTo(panNumber).once('value', (snapshot) => {
                let foundRecord = null;
                let foundKey = null;
                let latestTimestamp = 0;
                
                snapshot.forEach((childSnapshot) => {
                    const record = childSnapshot.val();
                    if (record.service === service && record.createdAt > latestTimestamp) {
                        foundRecord = record;
                        foundKey = childSnapshot.key;
                        latestTimestamp = record.createdAt;
                    }
                });
                
                if (foundKey) {
                    // First get the current document to properly update nested structures
                    firebaseDb.ref('userDocuments/' + foundKey).once('value')
                        .then((docSnapshot) => {
                            const currentDoc = docSnapshot.val() || {};
                            
                            // Prepare update data
                            const updateData = {
                                transactionHash: transactionHash,
                                status: 'Paid',
                                paymentTimestamp: new Date().getTime()
                            };
                            
                            // We'll no longer automatically generate an IPFS hash at this stage
                            // Let the admin explicitly approve the document later
                            
                            // Update the record with transaction details
                            return firebaseDb.ref('userDocuments/' + foundKey).update(updateData);
                        })
                        .then(() => {
                            console.log('Transaction details updated successfully for record:', foundKey);
                            resolve();
                        })
                        .catch((error) => {
                            console.error('Error updating transaction details:', error);
                            reject(error);
                        });
                } else {
                    console.error('No matching record found to update');
                    reject(new Error('No matching record found'));
                }
            }, (error) => {
                console.error('Error querying Firebase:', error);
                reject(error);
            });
        } catch (error) {
            console.error('Error updating transaction details:', error);
            reject(error);
        }
    });
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

// Fix for the updateDocumentsTable error - more specific fix
function updateDocumentsTable() {
    console.log("Updating documents table...");
    
    // Check if the table exists
    const tableElement = document.getElementById('documentStatusTable');
    if (!tableElement) {
        console.log('Document status table not found in DOM - skipping update');
        return; // Exit the function if the table doesn't exist
    }
    
    // Find the table body - this is likely where the error is occurring
    const tableBody = tableElement.querySelector('tbody');
    if (!tableBody) {
        console.log('Table body not found in document status table - creating one');
        const newTbody = document.createElement('tbody');
        tableElement.appendChild(newTbody);
        // Now use the newly created tbody
        updateDocumentsTableContent(newTbody);
    } else {
        // Use the existing tbody
        updateDocumentsTableContent(tableBody);
    }
}

// Helper function to update the table content
function updateDocumentsTableContent(tableBody) {
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Rest of your table update logic...
    // Make sure to use tableBody instead of directly accessing the table
    
    // Example:
    if (!firebaseDb || !userWalletAddress) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-gray-500">
                    ${!userWalletAddress ? 'Please connect your wallet to view your documents' : 'No documents found'}
                </td>
            </tr>
        `;
        return;
    }
    
    // Continue with your existing logic, but use tableBody for all DOM operations
}

// Fix for the contract address issue
function handlePayment(service) {
    console.log(`handlePayment called for ${service}`);
    
    // Check network
    const chainId = window.ethereum.request({ method: 'eth_chainId' });
    console.log('Current chain ID:', chainId);
    console.log('Expected Sepolia chain ID:', SEPOLIA_CHAIN_ID);
    if (chainId !== SEPOLIA_CHAIN_ID) {
        console.error('Wrong network! Please switch to Sepolia');
        showError('Please switch to Sepolia network in your wallet');
        return;
    }
    
    // Log contract status with more detailed information
    console.log('Contract status:', contract ? 'Available' : 'Null');
    console.log('Contract address from variable:', contractAddress);
    if (contract) {
        try {
            console.log('Contract target address:', contract.target);
            console.log('Contract functions:', 
                Object.keys(contract.interface.functions).join(', '));
        } catch (e) {
            console.log('Error accessing contract properties:', e.message);
        }
    } else {
        console.log('Contract not available - using Firebase-only mode');
    }
    
    // Rest of your handlePayment function...
}

// Fix for the handleFileSelect function
function handleFileSelect(event, serviceType) {
    console.log(`File selected for ${serviceType}`);
    
    const file = event.target.files[0];
    if (!file) {
        console.log('No file selected');
        return;
    }
    
    // Store the selected file
    selectedFiles[serviceType] = file;
    
    // Update the file info display
    const fileInfoElement = document.getElementById(`fileInfo-${serviceType}`);
    if (fileInfoElement) {
        fileInfoElement.textContent = `Selected: ${file.name} (${formatFileSize(file.size)})`;
        fileInfoElement.classList.remove('text-gray-500');
        fileInfoElement.classList.add('text-green-400');
    }
    
    // Enable the payment button
    const payButton = document.getElementById(`payButton-${serviceType}`);
    if (payButton) {
        console.log(`Enabling payment button for ${serviceType}`);
        payButton.disabled = false;
        payButton.classList.remove('opacity-50', 'cursor-not-allowed');
        payButton.classList.add('hover:bg-blue-600');
    } else {
        console.error(`Payment button for ${serviceType} not found`);
    }
    
    console.log(`File selected for ${serviceType}, UI updated, payment button enabled`);
    
    // Skip table update to avoid errors
    // console.log(`File selected for ${serviceType}, skipping table update for now`);
}

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Function to update document table
function updateDocumentTable() {
    console.log("Updating document table...");
    
    if (!userWalletAddress) {
        console.log("No wallet address available, can't update document table");
        return;
    }
    
    if (!firebaseDb) {
        console.log("Firebase DB not initialized, can't update document table");
        return;
    }
    
    // First try with documentStatusTable (from HTML)
    let tableBody = document.getElementById('documentStatusTable');
    
    // If not found, try documentsTableBody (from JS)
    if (!tableBody) {
        tableBody = document.getElementById('documentsTableBody');
    }
    
    if (!tableBody) {
        console.error("Document table body element not found with either ID");
        return;
    }
    
    console.log("Found table element:", tableBody.id);
    
    // Add loading indicator
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center p-4">
                <div class="flex justify-center items-center space-x-2 text-blue-400">
                    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading documents...</span>
                </div>
            </td>
        </tr>
    `;
    
    const query = firebaseDb.ref('userDocuments').orderByChild('walletAddress').equalTo(userWalletAddress);
    
    query.once('value', (snapshot) => {
        console.log("Firebase query returned data:", snapshot.exists());
        
        if (!snapshot.exists()) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center p-4">
                        <div class="text-gray-400">
                            <svg class="mx-auto h-12 w-12 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                            No documents found for your account
                        </div>
            </td>
                </tr>
            `;
            
            // Also update the empty state if it exists
            const emptyState = document.getElementById('emptyState');
            if (emptyState) {
                emptyState.classList.remove('hidden');
            }
            
            return;
        }
        
        // Hide the empty state if it exists
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
            emptyState.classList.add('hidden');
        }
        
        tableBody.innerHTML = '';
        
        // Add table header if not already present in HTML
        const tableElement = tableBody.closest('table');
        const headerRow = tableElement.querySelector('thead');
        
        if (!headerRow || headerRow.querySelectorAll('th').length < 7) {
            // Create or update the header
            const thead = document.createElement('thead');
            thead.className = 'bg-gray-800';
            thead.innerHTML = `
                <tr>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-300">Service</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-300">File Name</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-300">IPFS Hash</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-300">Transaction</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-300">Timestamp</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-300">Remove</th>
                </tr>
            `;
            
            // If there's an existing header, replace it
            if (headerRow) {
                tableElement.replaceChild(thead, headerRow);
            } else {
                // Otherwise insert it before the body
                tableElement.insertBefore(thead, tableBody);
            }
        }
        
        // Create an array to hold all documents for sorting
        const documents = [];
        
        snapshot.forEach((doc) => {
            const docData = doc.val();
            // Add the document key to the data object
            docData.key = doc.key;
            documents.push(docData);
        });
        
        // Sort documents by createdAt timestamp, most recent first
        documents.sort((a, b) => {
            return b.createdAt - a.createdAt;
        });
        
        // Process and add the sorted documents to the table
        documents.forEach((docData) => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-800 border-t border-gray-800';
            
            // Get file name or default
            const fileName = docData.fileDetails?.fileName || 'Document';
            
            // Format date with both date and time
            const timestamp = new Date(docData.createdAt);
            const formattedDate = timestamp.toLocaleDateString();
            const formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const formattedTimestamp = `${formattedDate} ${formattedTime}`;
            
            // Get status with proper styling
            const status = docData.status || 'Pending';
            let statusHtml = '';
            
            switch(status.toLowerCase()) {
                case 'approved':
                    statusHtml = `<span class="px-2 py-1 inline-block rounded-full text-xs bg-green-900/50 text-green-400 font-semibold">Approved</span>`;
                    break;
                case 'paid':
                    statusHtml = `<span class="px-2 py-1 inline-block rounded-full text-xs bg-blue-900/50 text-blue-400 font-semibold">Paid</span>`;
                    break;
                case 'rejected':
                    statusHtml = `<span class="px-2 py-1 inline-block rounded-full text-xs bg-red-900/50 text-red-400 font-semibold">Rejected</span>`;
                    break;
                case 'testing':
                    statusHtml = `<span class="px-2 py-1 inline-block rounded-full text-xs bg-purple-900/50 text-purple-400 font-semibold">Testing</span>`;
                    break;
                default:
                    statusHtml = `<span class="px-2 py-1 inline-block rounded-full text-xs bg-yellow-900/50 text-yellow-400 font-semibold">Pending</span>`;
            }
            
            // Create clickable file name for preview
            const fileNameHtml = docData.fileDetails?.fileContent || docData.ipfsHash ? 
                `<a href="javascript:void(0)" onclick="viewFile('${docData.key}')" class="text-blue-400 hover:underline cursor-pointer document-filename">${fileName}</a>` : 
                fileName;
            
            // Create IPFS hash display - Check for the hash in multiple possible locations
            // This ensures we catch the hash whether it was added directly to the document or in fileDetails
            const ipfsHash = docData.ipfsHash || docData.fileDetails?.ipfsHash || null;
            
            // Only show IPFS hash if it exists AND document is approved
            const ipfsHashHtml = (ipfsHash && docData.status === 'Approved') ? 
                `<a href="https://ipfs.io/ipfs/${ipfsHash}" target="_blank" class="text-blue-400 hover:underline">${ipfsHash.slice(0, 6)}...${ipfsHash.slice(-4)}</a>` : 
                '<span class="text-gray-500">Not available</span>';
            
            // Create transaction link
            const transactionHtml = docData.transactionHash ? 
                `<a href="https://sepolia.etherscan.io/tx/${docData.transactionHash}" target="_blank" class="text-blue-400 hover:underline">View Transaction</a>` : 
                '-';
            
            row.innerHTML = `
                <td class="p-3 text-sm text-gray-300">${docData.service || 'Unknown'}</td>
                <td class="p-3 text-sm text-gray-300">${fileNameHtml}</td>
                <td class="p-3 text-sm">${statusHtml}</td>
                <td class="p-3 text-sm">${ipfsHashHtml}</td>
                <td class="p-3 text-sm">${transactionHtml}</td>
                <td class="p-3 text-sm text-gray-300">${formattedTimestamp}</td>
                <td class="p-3 text-sm">
                    <button onclick="deleteDocument('${docData.key}')" class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs transition-colors">
                        Remove
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        console.log("Document table updated successfully");
    }, (error) => {
        console.error("Error fetching documents:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center p-4">
                    <div class="text-red-400">
                        Error loading documents: ${error.message}
                    </div>
            </td>
        </tr>
        `;
    });
}

// Function to delete a document
function deleteDocument(docId) {
    if (!docId || !firebaseDb) {
        showError("Firebase not initialized or invalid document ID");
        return;
    }
    
    // Show confirmation dialog
    if (confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
        // Show loading message
        showSuccess(`
            <div class="flex justify-center items-center">
                <svg class="animate-spin h-5 w-5 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Deleting document...</span>
            </div>
        `);
        
        // Delete from Firebase
        firebaseDb.ref('userDocuments/' + docId).remove()
            .then(() => {
                showSuccess(`
                    <h3 class="text-xl font-bold mb-4">Document Deleted</h3>
                    <p class="mb-4">The document was successfully deleted.</p>
                `);
                
                // Refresh the table
                setTimeout(() => {
            updateDocumentTable();
                }, 1000);
            })
            .catch((error) => {
                console.error("Error deleting document:", error);
                showError("Failed to delete document: " + error.message);
            });
    }
}

// Helper function to get status display
function getStatusDisplay(status) {
    let classes = '';
    switch(status) {
        case 'Approved':
            classes = 'bg-green-900/50 text-green-400';
            break;
        case 'Rejected':
            classes = 'bg-red-900/50 text-red-400';
            break;
        case 'Paid':
            classes = 'bg-blue-900/50 text-blue-400';
            break;
        default:
            classes = 'bg-yellow-900/50 text-yellow-400';
    }
    
    return `
        <span class="px-2 py-1 rounded-full text-xs ${classes}">
            ${status}
        </span>
    `;
}

// Initialize document updates to listen for Firebase changes
function initializeDocumentUpdates() {
    if (firebaseDb && userWalletAddress) {
        const dbRef = firebaseDb.ref('userDocuments');
        
        // Listen for changes on documents belonging to the current user
        dbRef.orderByChild('walletAddress').equalTo(userWalletAddress).on('value', () => {
            updateDocumentTable();
        });
    }
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', function() {
    updateDocumentTable();
    initializeDocumentUpdates();
});

// New function to verify data was stored in Firebase
function verifyDataInFirebase(service, panNumber) {
    if (!firebaseDb) {
        console.error('Firebase DB not initialized - cannot verify data');
        return;
    }
    
    console.log(`Verifying data in Firebase for ${service} service and PAN ${panNumber}...`);
    
    // Query Firebase for the latest record for this PAN+service combination
    const dbRef = firebaseDb.ref('userDocuments');
    
    dbRef.orderByChild('panNumber').equalTo(panNumber).once('value', (snapshot) => {
        if (!snapshot.exists()) {
            console.error('❌ No data found in Firebase for this PAN');
            return;
        }
        
        let foundRecord = null;
        let foundKey = null;
        let latestTimestamp = 0;
        
        snapshot.forEach((childSnapshot) => {
            const record = childSnapshot.val();
            if (record.service === service && record.createdAt > latestTimestamp) {
                foundRecord = record;
                foundKey = childSnapshot.key;
                latestTimestamp = record.createdAt;
            }
        });
        
        if (foundRecord) {
            console.log('✅ Data verification successful!');
            console.log('Record found in Firebase:', foundKey);
            console.log('Data stored:', foundRecord);
            
            // Open Firebase console URL for this record
            const consoleUrl = `https://console.firebase.google.com/project/blocksmiths-a8021/database/blocksmiths-a8021-default-rtdb/data/userDocuments/${foundKey}`;
            console.log('View in Firebase Console:', consoleUrl);
        } else {
            console.error('❌ No matching record found in Firebase for this service');
        }
    }, (error) => {
        console.error('Error verifying data in Firebase:', error);
    });
}

// Debug function to add dummy data to Firebase
function debugAddDummyData() {
    if (!firebaseDb) {
        console.error('Firebase DB not initialized - cannot add dummy data');
        showError('Firebase DB not initialized');
        return;
    }
    
    if (!userWalletAddress) {
        console.error('Wallet not connected - cannot add dummy data');
        showError('Please connect your wallet first');
        return;
    }
    
    console.log('Adding dummy data to Firebase...');
    
    // Create dummy data
    const timestamp = new Date().getTime();
    const dummyPanNumber = 'TEST1234Z';
    const dummyService = 'test';
    const recordId = `${dummyPanNumber}_${dummyService}_${timestamp}`;
    
    // Create document data
    const dummyData = {
        service: dummyService,
        panNumber: dummyPanNumber,
        userDetails: {
            name: 'Test User',
            dob: '01-01-2000',
            address: 'Test Address, Test City'
        },
        walletAddress: userWalletAddress,
        fileDetails: {
            fileName: 'test_file.pdf',
            fileURL: 'https://example.com/test_file.pdf',
            fileSize: 1024,
            contentType: 'application/pdf'
        },
        status: 'Testing',
        createdAt: timestamp,
        testMode: true
    };
    
    // Reference to the database
    const dbRef = firebaseDb.ref('userDocuments/' + recordId);
    
    // Save to Firebase
    dbRef.set(dummyData, (error) => {
        if (error) {
            console.error('❌ Error adding dummy data to Firebase:', error);
            showError('Failed to add dummy data: ' + error.message);
        } else {
            console.log('✅ Dummy data added successfully!');
            console.log('Record ID:', recordId);
            console.log('Data:', dummyData);
            
            // Open Firebase console URL for this record
            const consoleUrl = `https://console.firebase.google.com/project/blocksmiths-a8021/database/blocksmiths-a8021-default-rtdb/data/userDocuments/${recordId}`;
            console.log('View in Firebase Console:', consoleUrl);
            
            showSuccess(`
                <h3 class="text-xl font-bold mb-4">Dummy Data Added!</h3>
                <p class="mb-4">Test data has been added to Firebase.</p>
                <div class="bg-gray-800 p-4 rounded-lg mb-4 text-left">
                    <p><span class="text-gray-400">Record ID:</span> ${recordId}</p>
                    <p><span class="text-gray-400">PAN:</span> ${dummyPanNumber}</p>
                    <p><span class="text-gray-400">Service:</span> ${dummyService}</p>
                </div>
                <p class="text-sm text-gray-500">Check browser console for more details</p>
            `);
            
            // Update the documents table
            updateDocumentTable();
        }
    });
}

// Function to view a file from its ID
function viewFile(docId) {
    console.log("Viewing file for document:", docId);
    
    if (!firebaseDb) {
        showError("Firebase not initialized");
        return;
    }
    
    // Show loading message
    showSuccess(`
        <div class="flex justify-center items-center">
            <svg class="animate-spin h-5 w-5 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading document preview...</span>
        </div>
    `);
    
    // Get document details from Firebase
    firebaseDb.ref('userDocuments/' + docId).once('value')
        .then((snapshot) => {
            const docData = snapshot.val();
            
            if (!docData) {
                throw new Error("Document not found");
            }
            
            // Get file content
            const fileName = docData.fileDetails?.fileName || 'Document';
            const fileContent = docData.fileDetails?.fileContent;
            const fileType = fileName.split('.').pop().toLowerCase();
            
            // Check for IPFS hash - only use if document is approved
            const ipfsHash = (docData.status === 'Approved') ? 
                (docData.ipfsHash || docData.fileDetails?.ipfsHash) : null;
            
            // Show transaction hash if available
            const transactionHash = docData.transactionHash || '';
            const transactionHashDisplay = transactionHash ? `
                <div class="mt-4 pt-4 border-t border-gray-700">
                    <p class="text-sm text-gray-400">Transaction Hash:</p>
                    <a href="https://sepolia.etherscan.io/tx/${transactionHash}" target="_blank" class="text-blue-400 hover:underline text-sm break-all">
                        ${transactionHash}
                    </a>
                </div>
            ` : '';
            
            let previewContent = '';
            
            if (ipfsHash) {
                // Use IPFS gateway URL for preview
                const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
                
                if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
                    // Image preview
                    previewContent = `
                        <div class="max-w-full overflow-hidden">
                            <img src="${ipfsUrl}" alt="${fileName}" class="max-w-full h-auto mx-auto" />
                        </div>
                    `;
                } else if (fileType === 'pdf') {
                    // PDF preview
                    previewContent = `
                        <iframe src="${ipfsUrl}" class="w-full h-[70vh]" frameborder="0"></iframe>
                    `;
                } else {
                    // Generic file link
                    previewContent = `
                        <div class="text-center p-8">
                            <svg class="h-16 w-16 mx-auto mb-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                            <p class="mb-4">This file type cannot be previewed directly.</p>
                            <a href="${ipfsUrl}" target="_blank" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                                Download File
                            </a>
                        </div>
                    `;
                }
                
                // Show IPFS hash only if approved
                const ipfsHashDisplay = docData.status === 'Approved' ? `
                    <div class="mt-4 pt-4 border-t border-gray-700">
                        <p class="text-sm text-gray-400">IPFS Hash:</p>
                        <a href="${ipfsUrl}" target="_blank" class="text-blue-400 hover:underline text-sm break-all">
                            ${ipfsHash}
                        </a>
                    </div>
                ` : '';
                
                showSuccess(`
                    <h3 class="text-xl font-bold mb-4">Document Preview</h3>
                    <div class="document-preview">
                        ${previewContent}
                    </div>
                    ${ipfsHashDisplay}
                    ${transactionHashDisplay}
                    <div class="mt-4 flex justify-center">
                        <button onclick="hideSuccess()" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                            Close
                        </button>
                    </div>
                `);
                
            } else if (fileContent) {
                // Use direct file content from Firebase
                if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
                    // Image preview
                    previewContent = `
                        <div class="max-w-full overflow-hidden">
                            <img src="${fileContent}" alt="${fileName}" class="max-w-full h-auto mx-auto" />
                        </div>
                    `;
                } else if (fileType === 'pdf') {
                    // PDF preview
                    previewContent = `
                        <iframe src="${fileContent}" class="w-full h-[70vh]" frameborder="0"></iframe>
                    `;
                } else {
                    // Generic file link
                    previewContent = `
                        <div class="text-center p-8">
                            <svg class="h-16 w-16 mx-auto mb-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                            <p class="mb-4">This file type cannot be previewed directly.</p>
                            <a href="${fileContent}" target="_blank" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                                Download File
                            </a>
                        </div>
                    `;
                }
                
                // Show document status
                const statusBadge = getStatusDisplay(docData.status || 'Pending');
                
                showSuccess(`
                    <h3 class="text-xl font-bold mb-2">Document Preview</h3>
                    <div class="mb-4">${statusBadge}</div>
                    <div class="document-preview">
                        ${previewContent}
                    </div>
                    ${transactionHashDisplay}
                    <div class="mt-4 flex justify-center">
                        <button onclick="hideSuccess()" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                            Close
                        </button>
                    </div>
                `);
            } else {
                throw new Error("No file content available");
            }
        })
        .catch((error) => {
            console.error("Error viewing file:", error);
            showError("Failed to preview document: " + error.message);
        });
}

function hideSuccess() {
    const successAlert = document.getElementById('successAlert');
    if (successAlert) {
        successAlert.classList.add('hidden');
    }
}

// Add this function to your app.js
function checkPayButtonState() {
    const payButtons = document.querySelectorAll('[id^="payButton-"]');
    payButtons.forEach(button => {
        console.log(`Button ${button.id}: disabled=${button.disabled}, classList=${Array.from(button.classList)}`);
    });
}

// Call this after PAN verification and file upload
// Also add it to your initBlockchain function at the end

// Add this function to your app.js file
async function testContractDirectly() {
  try {
    console.log("DIRECT CONTRACT TEST STARTING");
    
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      console.error("MetaMask not found");
      return;
    }
    console.log("MetaMask found");
    
    // Get accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log("Connected account:", accounts[0]);
    
    // Create provider
    const provider = new window.ethers.BrowserProvider(window.ethereum);
    console.log("Provider created");
    
    // Get signer
    const signer = await provider.getSigner();
    console.log("Signer created:", await signer.getAddress());
    
    // Create contract - using minimal ABI with just the functions we need
    const minimalABI = [
      {
        "inputs": [{"internalType": "string", "name": "service", "type": "string"}],
        "name": "getServiceFee",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    console.log("Creating contract with address:", contractAddress);
    const testContract = new window.ethers.Contract(contractAddress, minimalABI, signer);
    console.log("Test contract created");
    
    // Test owner function
    const owner = await testContract.owner();
    console.log("Contract owner:", owner);
    
    // Test getServiceFee function
    const fee = await testContract.getServiceFee("electricity");
    console.log("Electricity fee:", fee.toString());
    
    console.log("DIRECT CONTRACT TEST SUCCESSFUL");
    return testContract;
  } catch (error) {
    console.error("DIRECT CONTRACT TEST FAILED:", error);
    console.error("Error message:", error.message);
    return null;
  }
}

// Add a button to your HTML to trigger this test
// Or call it directly from the console with: testContractDirectly()

// Brand new function with a different name to avoid any caching issues
async function processPayment(service) {
    console.log(`processPayment called for ${service}`);
    
    // Update button state
    let originalText = 'Pay Now';
    const payButton = document.getElementById(`payButton-${service}`);
    if (payButton) {
        originalText = payButton.querySelector('.payment-text')?.textContent || 'Pay Now';
        payButton.innerHTML = '<span class="animate-spin">↻</span> Processing...';
        payButton.disabled = true;
    }
    
    try {
        console.log('Proceeding directly to payment without network check...');
        
        // Make sure contract is available
        if (!contract) {
            throw new Error('Contract not initialized');
        }
        
        // Get service fee
        console.log('Getting service fee...');
        const serviceFee = await contract.getServiceFee(service);
        console.log('Service fee:', serviceFee.toString());
        
        // Make payment - this should trigger MetaMask
        console.log('Initiating payment...');
        const tx = await contract.makePayment(
            service,
            "test-ipfs-hash",
            {
                value: serviceFee,
                gasLimit: 300000
            }
        );
        
        console.log('Transaction sent:', tx.hash);
        
        // Store the transaction hash globally so it can be used by submitDocument
        window.lastTransactionHash = tx.hash;
        
        // Update button to show transaction in progress
        if (payButton) {
            payButton.innerHTML = '<span class="animate-spin">↻</span> Confirming Transaction...';
        }
        
        // Wait for confirmation
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt);
        
        // Update button to show success
        if (payButton) {
            payButton.innerHTML = '<span class="text-green-500">✓</span> Payment Successful';
            payButton.disabled = true;
            
            // After 3 seconds, reset the button
            setTimeout(() => {
                payButton.innerHTML = `<span class="payment-text">${originalText}</span>`;
                payButton.disabled = true; // Keep it disabled to prevent double payments
                payButton.classList.add('bg-green-500');
                payButton.classList.remove('bg-blue-500');
            }, 3000);
        }
        
        // Show success message
        showSuccess(`
            <h3 class="text-xl font-bold mb-4">Payment Successful!</h3>
            <p class="mb-4">Your transaction has been confirmed on the blockchain.</p>
            <p class="text-sm text-gray-400 mb-4">Transaction Hash: ${receipt.hash}</p>
            <div class="mt-4">
                <button id="submitDocumentBtn-${service}" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                    Submit Document
                </button>
                <button onclick="hideSuccess()" class="ml-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Close
                </button>
            </div>
        `);
        
        // Add click handler to the submit document button in the success message
        const submitDocumentBtn = document.getElementById(`submitDocumentBtn-${service}`);
        if (submitDocumentBtn) {
            submitDocumentBtn.onclick = function() {
                console.log(`Submit document button clicked for ${service}`);
                submitDocument(service);
                hideSuccess();
            };
        }
        
        // Update the document table
        updateDocumentTable();
        
    } catch (error) {
        console.error('Payment error:', error);
        
        // Reset button state
        if (payButton) {
            payButton.innerHTML = `<span class="payment-text">${originalText}</span>`;
            payButton.disabled = false;
        }
        
        showError('Payment error: ' + error.message);
    }
}

// Now update all the payment buttons to use this new function
document.addEventListener('DOMContentLoaded', function() {
    // Update all payment buttons to use the new function
    document.querySelectorAll('[id^="payButton-"]').forEach(button => {
        const service = button.id.split('-')[1];
        button.onclick = function() {
            console.log(`Button ${button.id} was clicked`);
            processPayment(service);
        };
    });
});

// Fix the submit document button functionality
function enableSubmitButton(service) {
    console.log(`Enabling submit document button for ${service}`);
    
    // Get the submit button
    const submitButton = document.getElementById(`submitButton-${service}`);
    if (!submitButton) {
        console.error(`Submit button for ${service} not found`);
        return;
    }
    
    // Enable the button
    submitButton.disabled = false;
    submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
    submitButton.classList.add('hover:bg-green-600');
    
    // Add click handler
    submitButton.onclick = function(event) {
        event.preventDefault();
        console.log(`Submit button for ${service} clicked`);
        submitDocument(service);
        return false;
    };
    
    console.log(`Submit button for ${service} enabled and click handler added`);
}

// Fix the submitDocument function to handle missing verifiedUserDetails
async function submitDocument(service) {
    console.log(`submitDocument called for ${service}`);
    
    try {
        // Show processing message
        showSuccess(`
            <h3 class="text-xl font-bold mb-4">Submitting Document...</h3>
            <p class="mb-4">Please wait while we process your document.</p>
            <div class="flex justify-center">
                <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
            </div>
        `);
        
        // Get the selected file
        const file = selectedFiles[service];
        if (!file) {
            throw new Error('No file selected');
        }
        
        // Get the verified PAN
        const panNumber = verifiedPANs[service];
        if (!panNumber) {
            throw new Error('PAN not verified');
        }
        
        // Read the file as data URL
        const reader = new FileReader();
        
        // Create a promise to handle the file reading
        const fileReadPromise = new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
        });
        
        reader.readAsDataURL(file);
        const fileContent = await fileReadPromise;
        
        // Create a unique ID for the document
        const timestamp = new Date().getTime();
        const documentId = `${panNumber}_${service}_${timestamp}`;
        
        // Get user details from the mock database or create an empty object
        let userDetails = {};
        if (typeof mockPANDatabase !== 'undefined' && mockPANDatabase[panNumber]) {
            userDetails = mockPANDatabase[panNumber];
        }
        
        // Get the transaction hash from the most recent transaction (if available)
        let transactionHash = '';
        if (window.lastTransactionHash) {
            transactionHash = window.lastTransactionHash;
            console.log('Using transaction hash:', transactionHash);
        }
        
        // Create document data
        const documentData = {
            service: service,
            panNumber: panNumber,
            userDetails: userDetails,
            walletAddress: userWalletAddress,
            fileDetails: {
                fileName: file.name,
                fileSize: file.size,
                contentType: file.type,
                fileContent: fileContent
            },
            status: 'Pending Review',
            createdAt: timestamp,
            transactionHash: transactionHash
        };
        
        // Save to Firebase
        console.log('Saving document to Firebase...');
        
        if (!firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        // Reference to the database
        const dbRef = firebaseDb.ref('userDocuments/' + documentId);
        
        // Save to Firebase
        await dbRef.set(documentData);
        console.log('Document saved to Firebase with ID:', documentId);
        
        // Show success message
        showSuccess(`
            <h3 class="text-xl font-bold mb-4">Document Submitted Successfully!</h3>
            <p class="mb-4">Your document has been submitted and will be processed shortly.</p>
            <p class="text-sm text-gray-400 mb-4">Document ID: ${documentId}</p>
            <button onclick="hideSuccess()" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                Close
            </button>
        `);
        
        // Update the document table
        updateDocumentTable();
        
    } catch (error) {
        console.error('Document submission error:', error);
        showError('Document submission error: ' + error.message);
    }
}
