// Service definitions
const services = {
    electricity: { 
        amount: 0.001, 
        title: 'Electricity Board'
    },
    water: { 
        amount: 0.0015, 
        title: 'Water Connection'
    },
    building: { 
        amount: 0.002, 
        title: 'Building Permits'
    },
    document: { 
        amount: 0.0005, 
        title: 'Document Verification'
    }
};

// State management
let walletAddress = null;
let loading = false;
let selectedFiles = {};

// DOM Elements
const connectWalletBtn = document.getElementById('connectWallet');
const serviceButtons = document.querySelectorAll('.service-pay');
const errorAlert = document.getElementById('errorAlert');
const errorText = document.getElementById('errorText');

// Add at the top with other constants
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // Chain ID for Sepolia testnet
const PAYMENT_ADDRESS = '0x4c961ff79a2d2607afE8cd6B25E55f78a89B69B7';

function showError(message) {
    errorText.textContent = message;
    errorAlert.classList.remove('hidden');
    setTimeout(() => {
        errorAlert.classList.add('hidden');
    }, 5000);
}

function showSuccess(txHash) {
    const successAlert = document.getElementById('successAlert');
    const txHashElement = document.getElementById('txHash');
    const txLink = document.getElementById('txLink');
    
    txHashElement.textContent = txHash;
    txLink.href = `https://sepolia.etherscan.io/tx/${txHash}`;
    successAlert.classList.remove('hidden');

    // Optionally hide after some time
    setTimeout(() => {
        successAlert.classList.add('hidden');
    }, 10000); // Hide after 10 seconds
}

async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        showError('Please install MetaMask to use this service');
        return;
    }

    loading = true;
    try {
        // Request account access
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        walletAddress = accounts[0];
        updateWalletButton();
    } catch (err) {
        showError(err.message || 'Failed to connect wallet');
        walletAddress = null;
    }
    loading = false;

    // Show network badge
    const networkBadge = document.getElementById('networkBadge');
    networkBadge.classList.remove('hidden');
    
    // Set a timeout to hide the badge after 7 seconds
    setTimeout(() => {
        networkBadge.classList.add('hidden');
    }, 7000);
}

function disconnectWallet() {
    walletAddress = null;
    updateWalletButton();
}


function updateWalletButton() {
    if (walletAddress) {
        connectWalletBtn.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="flex items-center space-x-2">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                        <path d="M18 12h.01" />
                    </svg>
                    <span>${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}</span>
                </div>
                <button onclick="disconnectWallet()" class="ml-2 bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-white text-sm transition-colors">
                    Disconnect
                </button>
            </div>
        `;
        connectWalletBtn.classList.add('connected');
        connectWalletBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        connectWalletBtn.classList.add('bg-gray-800', 'hover:bg-gray-700');
    } else {
        connectWalletBtn.innerHTML = `
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12h.01" />
            </svg>
            <span>Connect Wallet</span>
        `;
        connectWalletBtn.classList.remove('connected', 'bg-gray-800', 'hover:bg-gray-700');
        connectWalletBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');
    }
}

// Event Listeners
connectWalletBtn.addEventListener('click', (e) => {
    // Prevent the click if it's on the disconnect button
    if (e.target.closest('button[onclick="disconnectWallet()"]')) {
        return;
    }
    if (!walletAddress) {
        connectWallet();
    }
});

serviceButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const serviceId = button.dataset.service;
        handlePayment(serviceId, button);
    });
});

// MetaMask Events
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        walletAddress = accounts.length ? accounts[0] : null;
        updateWalletButton();
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}

async function handlePayment(serviceId, button) {
    if (!walletAddress) {
        showError('Please connect your wallet first');
        return;
    }

    // Check and switch to Sepolia network if needed
    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== SEPOLIA_CHAIN_ID) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: SEPOLIA_CHAIN_ID }],
                });
            } catch (switchError) {
                // This error code indicates that the chain has not been added to MetaMask
                if (switchError.code === 4902) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: SEPOLIA_CHAIN_ID,
                                chainName: 'Sepolia Testnet',
                                nativeCurrency: {
                                    name: 'SepoliaETH',
                                    symbol: 'SEP',
                                    decimals: 18
                                },
                                rpcUrls: ['https://sepolia.infura.io/v3/'],
                                blockExplorerUrls: ['https://sepolia.etherscan.io']
                            }]
                        });
                    } catch (addError) {
                        showError('Could not add Sepolia network to MetaMask');
                        return;
                    }
                } else {
                    showError('Could not switch to Sepolia network');
                    return;
                }
            }
        }

        const service = services[serviceId];
        if (!service) {
            showError('Invalid service selected');
            return;
        }

        const file = selectedFiles[serviceId];
        if (!file) {
            throw new Error('Please upload a certificate first');
        }

        // Upload file to IPFS or your preferred storage
        const fileHash = await uploadFileToIPFS(file);

        // Create the transaction parameters
        const transactionParameters = {
            to: PAYMENT_ADDRESS,
            from: walletAddress,
            value: '0x' + (service.amount * 1e18).toString(16) // Convert to Wei manually
        };

        // Send the transaction
        const transactionHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
        });

        showSuccess(transactionHash);
    } catch (err) {
        showError(err.message || 'Payment failed');
    }
    // After successful wallet connection
    document.getElementById('networkBadge').classList.remove('hidden'); 
}

async function uploadFileToIPFS(file) {
    // Implement your file upload logic here
    // You might want to use services like Web3.Storage, Pinata, or your own IPFS node
    // Return the IPFS hash/CID of the uploaded file
}

function copyTxHash() {
    const txHash = document.getElementById('txHash').textContent;
    navigator.clipboard.writeText(txHash).then(() => {
        // Show a small tooltip or notification that it was copied
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Hash copied to clipboard!',
            showConfirmButton: false,
            timer: 1500
        });
    });
}

function handlePaymentSuccess() {
    // Hide network badge after successful payment
    const networkBadge = document.getElementById('networkBadge');
    networkBadge.classList.add('hidden');
}