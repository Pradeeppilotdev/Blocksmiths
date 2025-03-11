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

        // Check if file is selected
        const fileInput = document.getElementById(`certificateFile-${service}`);
        if (!fileInput.files || fileInput.files.length === 0) {
            showError('Please select a file first');
            return;
        }
        
        const file = fileInput.files[0];
        
        // Show loading state
        showLoadingState(service);
        
        // Connect wallet if not already connected
        const account = await connectWallet();
        if (!account) {
            hideLoadingState(service);
            return;
        }
        
        // First upload the file to IPFS
        console.log('Uploading file to IPFS...');
        
        // Prepare metadata
        const metadata = {
            service: service,
            walletAddress: account,
            timestamp: new Date().toISOString(),
            panNumber: userVerificationState?.userData?.panNumber || '',
            userName: userVerificationState?.userData?.name || ''
        };
        
        // Upload to IPFS using the utility function
        const ipfsResult = await uploadToIPFS(file, metadata);
        
        if (!ipfsResult.success) {
            throw new Error('Failed to upload to IPFS: ' + ipfsResult.error);
        }
        
        console.log('File uploaded to IPFS:', ipfsResult);
        
        // Get payment amount based on service
        let amount;
        switch(service) {
            case 'electricity': amount = '0.001'; break;
            case 'water': amount = '0.0015'; break;
            case 'building': amount = '0.002'; break;
            case 'document': amount = '0.0005'; break;
            default: amount = '0.001';
        }
        
        console.log('Processing payment of', amount, 'ETH');
        
        // Get the contract address
        const contractAddress = CONTRACT_ADDRESS;
        
        // Create transaction parameters
        let tx;
        let transaction;
        
        // Handle both ethers v5 and v6
        if (window.ethereum) {
            // Use direct MetaMask API for simplicity
            const weiAmount = BigInt(parseFloat(amount) * 1e18);
            const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: account,
                    to: contractAddress,
                    value: '0x' + weiAmount.toString(16)
                }]
            });
            transaction = { hash: txHash };
        } else {
            throw new Error('MetaMask not found');
        }
        
        console.log('Transaction sent:', transaction.hash);
        
        // Update UI with IPFS link
        const ipfsLink = document.getElementById('ipfsLink');
        if (ipfsLink) {
            ipfsLink.href = ipfsResult.url;
            ipfsLink.textContent = ipfsResult.url;
        }
        
        // Show success alert with transaction details
        const successAlert = document.getElementById('successAlert');
        if (successAlert) {
            const successContent = successAlert.querySelector('.text-center');
            if (successContent) {
                successContent.innerHTML = `
                    <svg class="mx-auto h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <h3 class="mt-4 text-lg font-medium text-white">Payment Successful!</h3>
                    <p class="mt-1 text-sm text-gray-300">Your payment of ${amount} ETH has been processed.</p>
                    <div class="mt-4">
                        <p class="text-sm text-gray-300">Your document is stored on IPFS:</p>
                        <a href="${ipfsResult.url}" target="_blank" class="text-sm text-blue-400 hover:underline break-all">${ipfsResult.url}</a>
                    </div>
                    <div class="mt-4">
                        <p class="text-sm text-gray-300">Transaction Hash:</p>
                        <a href="https://sepolia.etherscan.io/tx/${transaction.hash}" target="_blank" class="text-sm text-blue-400 hover:underline break-all">${transaction.hash}</a>
                    </div>
                    <div class="mt-6">
                        <button type="button" onclick="document.getElementById('successAlert').classList.add('hidden')" class="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
                            Close
                        </button>
                    </div>
                `;
            }
            successAlert.classList.remove('hidden');
        }
        
        // Also update the file info section with the IPFS link
        const fileInfo = document.getElementById(`fileInfo-${service}`);
        if (fileInfo) {
            fileInfo.innerHTML = `
                <div class="mt-2">
                    <p class="text-sm text-gray-400">File uploaded to IPFS:</p>
                    <a href="${ipfsResult.url}" target="_blank" class="text-sm text-blue-400 hover:underline break-all">${ipfsResult.url}</a>
                </div>
            `;
        }
        
        // Update the payment button to show success
        const payButton = document.getElementById(`payButton-${service}`);
        if (payButton) {
            payButton.innerHTML = `
                <svg class="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 13l4 4L19 7" />
                </svg>
                <span>Paid</span>
            `;
            payButton.disabled = true;
        }
        
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
