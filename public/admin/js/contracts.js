// Smart Contracts Management Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Search and Filter Functionality
    const searchInput = document.querySelector('#contracts .search-filter input');
    const networkFilter = document.querySelector('#contracts .search-filter select');
    const contractRows = document.querySelectorAll('#contracts .data-table tbody tr');

    function filterContracts() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedNetwork = networkFilter.value.toLowerCase();

        contractRows.forEach(row => {
            const contractName = row.querySelector('.contract-info span').textContent.toLowerCase();
            const contractAddress = row.querySelector('.contract-address').textContent.toLowerCase();
            const network = row.querySelector('td:nth-child(3)').textContent.toLowerCase();

            const matchesSearch = contractName.includes(searchTerm) || 
                                contractAddress.includes(searchTerm);
            const matchesNetwork = selectedNetwork === 'all' || network.includes(selectedNetwork);

            row.style.display = matchesSearch && matchesNetwork ? '' : 'none';
        });
    }

    searchInput.addEventListener('input', filterContracts);
    networkFilter.addEventListener('change', filterContracts);

    // Copy Address Functionality
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const address = this.previousElementSibling.textContent;
            
            // Copy to clipboard
            navigator.clipboard.writeText(address).then(() => {
                // Show feedback
                const originalIcon = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i>';
                this.style.color = '#4CAF50';
                
                setTimeout(() => {
                    this.innerHTML = originalIcon;
                    this.style.color = '';
                }, 1500);
            });
        });
    });

    // Contract Details View
    const detailsHandler = () => {
        let activeRow = null;
        const contractDetails = document.querySelector('.contract-details');

        contractRows.forEach(row => {
            row.addEventListener('click', function() {
                // Remove active state from previous row
                if (activeRow) {
                    activeRow.style.background = '';
                }
                
                // Set active state
                this.style.background = '#f0f7ff';
                activeRow = this;
                
                // Show contract details
                contractDetails.style.display = 'block';
                
                // Scroll to details
                contractDetails.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
        });
    };

    detailsHandler();

    // Tab Switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const contractContent = document.querySelector('.contract-content');

    tabButtons.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabButtons.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Update content based on tab
            const tabName = this.textContent.toLowerCase();
            
            // Example content for different tabs
            let content = '';
            switch(tabName) {
                case 'overview':
                    content = document.querySelector('.contract-overview').outerHTML;
                    break;
                case 'code':
                    content = '<div class="contract-code"><pre><code>// Contract source code would be displayed here</code></pre></div>';
                    break;
                case 'transactions':
                    content = `
                        <div class="transactions-list">
                            <div class="transaction-item">
                                <span class="hash">0x1234...5678</span>
                                <span class="type">Transfer</span>
                                <span class="time">2 hours ago</span>
                            </div>
                            <!-- More transactions would be listed here -->
                        </div>
                    `;
                    break;
                case 'events':
                    content = `
                        <div class="events-list">
                            <div class="event-item">
                                <span class="event-name">Transfer</span>
                                <span class="block">Block #14356789</span>
                                <span class="time">1 hour ago</span>
                            </div>
                            <!-- More events would be listed here -->
                        </div>
                    `;
                    break;
            }
            
            contractContent.innerHTML = content;
        });
    });

    // Deploy New Contract Button
    const deployButton = document.querySelector('#contracts .primary-btn');
    deployButton.addEventListener('click', function() {
        // Here you would typically open a modal or navigate to deployment page
        alert('Contract deployment interface would open here');
    });

    // External Link Handler
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent row click
            
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-external-link-alt')) {
                // Open in block explorer
                const address = this.closest('tr').querySelector('.contract-address').textContent;
                // Example URL - would need to be adjusted based on the network
                window.open(`https://etherscan.io/address/${address}`, '_blank');
            } else if (icon.classList.contains('fa-code')) {
                // Show contract code
                alert('Contract source code would be displayed here');
            } else if (icon.classList.contains('fa-eye')) {
                // Trigger row click to show details
                this.closest('tr').click();
            }
        });
    });

    // Add tooltips
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
        const icon = btn.querySelector('i');
        let tooltip = '';
        
        if (icon.classList.contains('fa-eye')) tooltip = 'View Details';
        else if (icon.classList.contains('fa-code')) tooltip = 'View Source Code';
        else if (icon.classList.contains('fa-external-link-alt')) tooltip = 'View on Explorer';
        
        if (tooltip) {
            btn.setAttribute('title', tooltip);
        }
    });
});
