const SEPOLIA_CHAIN_ID = '0xaa36a7'; // Chain ID for Sepolia
const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID'; // Replace with your Infura project ID

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

async function addSepoliaNetwork() {
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
                rpcUrls: [SEPOLIA_RPC_URL],
                blockExplorerUrls: ['https://sepolia.etherscan.io']
            }]
        });
        return true;
    } catch (error) {
        console.error('Error adding Sepolia network:', error);
        showError('Failed to add Sepolia network to MetaMask');
        return false;
    }
}

async function switchToSepoliaNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }]
        });
        return true;
    } catch (error) {
        if (error.code === 4902) { // Chain not added yet
            return await addSepoliaNetwork();
        }
        console.error('Error switching to Sepolia:', error);
        showError('Failed to switch to Sepolia network');
        return false;
    }
}

async function checkAndSwitchNetwork() {
    if (!window.ethereum) {
        showError('Please install MetaMask to use this feature');
        return false;
    }

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== SEPOLIA_CHAIN_ID) {
        const networkSwitched = await switchToSepoliaNetwork();
        if (!networkSwitched) {
            showError('Please switch to Sepolia Test Network to continue');
            return false;
        }
    }
    return true;
}

async function connectWallet() {
    try {
        if (!window.ethereum) {
            showError('Please install MetaMask to use this feature');
            return;
        }

        // First check and switch network
        const networkCorrect = await checkAndSwitchNetwork();
        if (!networkCorrect) return;

        // Then connect wallet
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        
        // Update UI to show connected state
        document.getElementById('connectWallet').innerHTML = `
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12h.01" />
            </svg>
            <span>${account.substring(0, 6)}...${account.substring(38)}</span>
        `;
        
        // Show network badge
        document.getElementById('networkBadge').classList.remove('hidden');
        
        return account;
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showError('Failed to connect wallet');
    }
}

async function handlePayment(service) {
    try {
        // Check network before proceeding with payment
        const networkCorrect = await checkAndSwitchNetwork();
        if (!networkCorrect) return;

        showLoadingState(service);
        // Your existing payment logic here
        
        // After successful payment and IPFS upload:
        const ipfsLink = document.getElementById('ipfsLink');
        ipfsLink.href = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`; // Use the actual IPFS hash
        
        // Show success alert
        document.getElementById('successAlert').classList.remove('hidden');
        
    } catch (error) {
        console.error('Payment failed:', error);
        showError('Payment failed: ' + error.message);
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

// Add event listener for network changes
if (window.ethereum) {
    window.ethereum.on('chainChanged', (chainId) => {
        if (chainId !== SEPOLIA_CHAIN_ID) {
            document.getElementById('networkBadge').classList.add('hidden');
            showError('Please switch to Sepolia Test Network to continue');
        } else {
            document.getElementById('networkBadge').classList.remove('hidden');
        }
    });
}

function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    const errorText = document.getElementById('errorText');
    errorText.textContent = message;
    errorAlert.classList.remove('hidden');
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorAlert.classList.add('hidden');
    }, 5000);
}
