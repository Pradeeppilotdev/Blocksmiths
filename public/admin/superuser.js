// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 800,
    once: true
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin dashboard loaded');
    initializeAdminDashboard();
    
    // Add event listeners for search and filter
    document.getElementById('documentSearch').addEventListener('input', filterDocuments);
    document.getElementById('statusFilter').addEventListener('change', filterDocuments);
});

function initializeAdminDashboard() {
    // Set up navigation
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            showSection(targetId);
        });
    });

    // Load documents initially
    loadDocuments();

    // Add refresh button to documents section
    const documentsSection = document.getElementById('documents');
    const refreshButton = document.createElement('button');
    refreshButton.className = 'refresh-btn bg-blue-500 text-white px-4 py-2 rounded-lg mb-4';
    refreshButton.innerHTML = '<i class="fas fa-sync-alt mr-2"></i> Refresh Documents';
    refreshButton.onclick = loadDocuments;
    documentsSection.insertBefore(refreshButton, documentsSection.querySelector('.documents-grid'));

    // Sidebar navigation
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('.dashboard-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(link => {
                link.parentElement.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.parentElement.classList.add('active');
            
            // Show corresponding section
            const targetId = this.getAttribute('href').substring(1);
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // User profile dropdown
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.addEventListener('click', function() {
            // Toggle dropdown menu
            const dropdown = document.createElement('div');
            dropdown.className = 'dropdown';
            dropdown.innerHTML = `
                <div class="dropdown-header">
                    <h3>User Profile</h3>
                    <button class="dropdown-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="dropdown-list">
                    <div class="dropdown-item">
                        <i class="fas fa-user"></i> My Profile
                    </div>
                    <div class="dropdown-item">
                        <i class="fas fa-cog"></i> Settings
                    </div>
                    <div class="dropdown-item">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </div>
                </div>
            `;
            
            // Check if dropdown already exists
            const existingDropdown = document.querySelector('.dropdown');
            if (existingDropdown) {
                existingDropdown.remove();
            } else {
                document.body.appendChild(dropdown);
                
                // Position dropdown
                const rect = userProfile.getBoundingClientRect();
                dropdown.style.top = `${rect.bottom + window.scrollY}px`;
                dropdown.style.right = `${window.innerWidth - rect.right}px`;
                
                // Show dropdown
                setTimeout(() => {
                    dropdown.classList.add('active');
                }, 10);
                
                // Close dropdown when clicking outside
                document.addEventListener('click', function closeDropdown(e) {
                    if (!dropdown.contains(e.target) && e.target !== userProfile) {
                        dropdown.classList.remove('active');
                        setTimeout(() => {
                            dropdown.remove();
                        }, 300);
                        document.removeEventListener('click', closeDropdown);
                    }
                });
                
                // Close dropdown when clicking close button
                const closeBtn = dropdown.querySelector('.dropdown-close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', function() {
                        dropdown.classList.remove('active');
                        setTimeout(() => {
                            dropdown.remove();
                        }, 300);
                    });
                }
            }
        });
    }
    
    // Chart period buttons
    const chartButtons = document.querySelectorAll('.chart-actions button');
    chartButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            chartButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update chart data based on selected period
            updateChartData(this.textContent.toLowerCase());
        });
    });
    
    // Table row actions
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            if (this.classList.contains('edit')) {
                const row = this.closest('tr');
                const id = row ? row.querySelector('td:first-child').textContent : '';
                showEditModal(id);
            } else if (this.classList.contains('delete')) {
                const row = this.closest('tr');
                const id = row ? row.querySelector('td:first-child').textContent : '';
                showDeleteConfirmation(id);
            } else if (this.classList.contains('view')) {
                const row = this.closest('tr');
                const id = row ? row.querySelector('td:first-child').textContent : '';
                showDetailsModal(id);
            }
        });
    });
    
    // Copy contract address
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const addressElement = this.previousElementSibling;
            const address = addressElement.textContent;
            
            // Copy to clipboard
            navigator.clipboard.writeText(address).then(() => {
                // Show success message
                const originalIcon = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i>';
                
                setTimeout(() => {
                    this.innerHTML = originalIcon;
                }, 2000);
            });
        });
    });
    
    // Show edit modal
    function showEditModal(id) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>Edit Item ${id}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form class="settings-form">
                        <div class="form-group">
                            <label>Name</label>
                            <input type="text" value="John Doe">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" value="john.doe@example.com">
                        </div>
                        <div class="form-group">
                            <label>Role</label>
                            <select>
                                <option value="admin">Admin</option>
                                <option value="user" selected>User</option>
                                <option value="editor">Editor</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <select>
                                <option value="active" selected>Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="secondary-btn">Cancel</button>
                    <button class="primary-btn">Save Changes</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Close modal
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.secondary-btn');
        
        [closeBtn, cancelBtn].forEach(btn => {
            btn.addEventListener('click', function() {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            });
        });
        
        // Save changes
        const saveBtn = modal.querySelector('.primary-btn');
        saveBtn.addEventListener('click', function() {
            // Simulate saving
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
                showNotification('Changes saved successfully!');
            }, 300);
        });
    }
    
    // Show delete confirmation
    function showDeleteConfirmation(id) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>Confirm Delete</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete item ${id}? This action cannot be undone.</p>
                </div>
                <div class="modal-footer">
                    <button class="secondary-btn">Cancel</button>
                    <button class="primary-btn delete">Delete</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Close modal
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.secondary-btn');
        
        [closeBtn, cancelBtn].forEach(btn => {
            btn.addEventListener('click', function() {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            });
        });
        
        // Delete item
        const deleteBtn = modal.querySelector('.primary-btn.delete');
        deleteBtn.addEventListener('click', function() {
            // Simulate deletion
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
                showNotification('Item deleted successfully!');
            }, 300);
        });
    }
    
    // Show details modal
    function showDetailsModal(id) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>Item Details ${id}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="detail-item">
                        <span class="detail-label">ID:</span>
                        <span class="detail-value">${id}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Name:</span>
                        <span class="detail-value">John Doe</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">john.doe@example.com</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Role:</span>
                        <span class="detail-value">User</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value">Active</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Created:</span>
                        <span class="detail-value">May 15, 2023</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Last Login:</span>
                        <span class="detail-value">June 10, 2023</span>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="secondary-btn">Close</button>
                    <button class="primary-btn">Edit</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Close modal
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.secondary-btn');
        
        [closeBtn, cancelBtn].forEach(btn => {
            btn.addEventListener('click', function() {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            });
        });
        
        // Edit item
        const editBtn = modal.querySelector('.primary-btn');
        editBtn.addEventListener('click', function() {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
                showEditModal(id);
            }, 300);
        });
    }
    
    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('active');
        }, 10);
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('active');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
        
        // Close notification
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', function() {
            notification.classList.remove('active');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
    
    // Initialize charts
    initBarChart();
    animateAnalyticsCharts();
    
    // Initialize first settings panel
    if (settingsPanels.length > 0) {
        settingsPanels[0].classList.add('active');
    }
    
    // Initialize first contract tab
    if (contractTabs.length > 0 && contractContents.length > 0) {
        contractTabs[0].classList.add('active');
        contractContents[0].classList.add('active');
    }
    
    // Initialize new features
    initBlockchainSettings();
    setup2FA();
    initAPIKeys();
    
    // Add event listeners for theme options
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            themeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            const theme = this.querySelector('.theme-preview').classList[1];
            applyTheme(theme);
        });
    });
    
    // Initialize security settings
    initSecuritySettings();

    // Add ripple effect to navigation items
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = link.getBoundingClientRect();
            
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.className = 'ripple';
            
            link.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add data-title attributes to navigation items for mobile tooltips
    document.querySelectorAll('.sidebar-nav li').forEach(item => {
        const text = item.querySelector('a span').textContent;
        item.setAttribute('data-title', text);
    });

    // Handle hover effects for touch devices
    let touchStartY;

    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        });

        link.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const diff = Math.abs(touchStartY - touchEndY);
            
            // Only trigger hover effect if the touch was a tap (not a scroll)
            if (diff < 10) {
                link.classList.add('hover');
                setTimeout(() => {
                    link.classList.remove('hover');
                }, 300);
            }
        });
    });

    loadDocuments();
}

function showSection(sectionId) {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function loadDocuments() {
    console.log('Loading documents...');
    const documentsGrid = document.querySelector('.documents-grid');
    let documents = [];
    
    try {
        documents = JSON.parse(localStorage.getItem('adminDocuments') || '[]');
        console.log('Documents loaded from localStorage:', documents);
    } catch (e) {
        console.error('Error loading documents:', e);
    }
    
    if (!documents || documents.length === 0) {
        documentsGrid.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-folder-open text-4xl mb-4 text-gray-400"></i>
                <p class="text-gray-500">No documents uploaded yet</p>
            </div>
        `;
        return;
    }
    
    documentsGrid.innerHTML = '';
    documents.forEach((doc, index) => {
        const card = createDocumentCard(doc, index);
        documentsGrid.appendChild(card);
    });
}

function filterDocuments() {
    const searchTerm = document.getElementById('documentSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    let documents = JSON.parse(localStorage.getItem('adminDocuments') || '[]');
    
    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.panData.name.toLowerCase().includes(searchTerm) ||
                            doc.fileName.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    displayDocuments(filteredDocs);
}

function displayDocuments(documents) {
    const documentsGrid = document.querySelector('.documents-grid');
    
    if (!documents || documents.length === 0) {
        documentsGrid.innerHTML = `
            <div class="no-documents">
                <i class="fas fa-folder-open"></i>
                <p>No documents found</p>
            </div>
        `;
        return;
    }
    
    documentsGrid.innerHTML = '';
    documents.forEach((doc, index) => {
        const card = createDocumentCard(doc, index);
        documentsGrid.appendChild(card);
    });
}

function createDocumentCard(doc, index) {
    const card = document.createElement('div');
    card.className = 'document-card';
    
    const statusClass = doc.status.toLowerCase().replace(' ', '-');
    
    card.innerHTML = `
        <div class="document-header">
            <span class="document-status ${statusClass}">${doc.status}</span>
            <span class="document-date">${new Date(doc.timestamp).toLocaleDateString()}</span>
        </div>
        
        <div class="user-info">
            <h3>${doc.panData.name}</h3>
            <p><i class="fas fa-calendar"></i> DOB: ${doc.panData.dob}</p>
            <p><i class="fas fa-file-alt"></i> Service: ${doc.service}</p>
            <p><i class="fas fa-wallet"></i> ${doc.walletAddress?.slice(0, 6)}...${doc.walletAddress?.slice(-4)}</p>
        </div>
        
        <div class="document-details">
            <div class="meta-item">
                <i class="fas fa-file"></i>
                <span>${doc.fileName}</span>
            </div>
            <div class="meta-item">
                <i class="fas fa-clock"></i>
                <span>${new Date(doc.timestamp).toLocaleTimeString()}</span>
            </div>
        </div>
        
        <div class="document-actions-footer">
            <button onclick="viewDocument(${index})" class="view-btn">
                <i class="fas fa-eye"></i> View
            </button>
            <button onclick="uploadToIPFS(${index})" class="ipfs-btn" ${doc.ipfsHash ? 'disabled' : ''}>
                <i class="fas fa-cloud-upload-alt"></i> IPFS
            </button>
            <button onclick="approveDocument(${index})" class="approve-btn" ${doc.status === 'Approved' ? 'disabled' : ''}>
                <i class="fas fa-check"></i> Approve
            </button>
            <button onclick="rejectDocument(${index})" class="reject-btn" ${doc.status === 'Rejected' ? 'disabled' : ''}>
                <i class="fas fa-times"></i> Reject
            </button>
        </div>
        
        ${doc.ipfsHash ? `
        <div class="ipfs-hash-container">
            <p class="ipfs-label">IPFS Hash:</p>
            <a href="https://ipfs.io/ipfs/${doc.ipfsHash}" target="_blank" class="ipfs-hash-link">
                <i class="fas fa-external-link-alt"></i>
                ${doc.ipfsHash.slice(0, 20)}...${doc.ipfsHash.slice(-8)}
            </a>
        </div>
        ` : ''}
    `;
    
    return card;
}

function viewDocument(index) {
    const documents = JSON.parse(localStorage.getItem('adminDocuments') || '[]');
    const doc = documents[index];
    if (doc && doc.fileData) {
        // Open base64 data in new tab
        const win = window.open();
        win.document.write(`
            <iframe src="${doc.fileData}" frameborder="0" 
            style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" 
            allowfullscreen></iframe>
        `);
    }
}

async function uploadToIPFS(index) {
    const button = document.querySelector(`.documents-grid .document-card:nth-child(${index + 1}) .ipfs-btn`);
    const card = button.closest('.document-card');
    const originalText = button.innerHTML;
    
    try {
        // Update button and add progress indicator
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
        button.disabled = true;
        
        // Add progress bar to card
        const progressContainer = document.createElement('div');
        progressContainer.className = 'upload-progress';
        progressContainer.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="progress-text">Preparing file...</div>
        `;
        card.appendChild(progressContainer);

        // Get the documents from localStorage
        const documents = JSON.parse(localStorage.getItem('adminDocuments') || '[]');
        const doc = documents[index];

        // Optimize file size before upload (if it's an image)
        let file;
        if (doc.fileName.match(/\.(jpg|jpeg|png)$/i)) {
            const optimizedBlob = await optimizeImage(doc.fileData);
            file = new File([optimizedBlob], doc.fileName);
        } else {
            const response = await fetch(doc.fileData);
            const blob = await response.blob();
            file = new File([blob], doc.fileName);
        }

        // Update progress
        progressContainer.querySelector('.progress-text').textContent = 'Uploading to IPFS...';
        progressContainer.querySelector('.progress-fill').style.width = '30%';

        // Create form data
        const formData = new FormData();
        formData.append('file', file);

        // Upload to IPFS via Pinata with timeout and progress tracking
        const result = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'pinata_api_key': 'f06e5fd1f9bd46842319',
                'pinata_secret_api_key': '8860a2b0c4cc09b36797ebf7f1b05026705ce60c97d65687eba30ef2651517cd'
            },
            timeout: 30000, // 30 second timeout
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 70) / progressEvent.total + 30);
                progressContainer.querySelector('.progress-fill').style.width = `${percentCompleted}%`;
                progressContainer.querySelector('.progress-text').textContent = `Uploading: ${percentCompleted}%`;
            }
        });

        // Update the document with IPFS hash
        documents[index].ipfsHash = result.data.IpfsHash;
        localStorage.setItem('adminDocuments', JSON.stringify(documents));

        // Show 100% completion
        progressContainer.querySelector('.progress-fill').style.width = '100%';
        progressContainer.querySelector('.progress-text').textContent = 'Upload Complete!';

        // Refresh the card display after a short delay
        setTimeout(() => {
            const newCard = createDocumentCard(documents[index], index);
            card.replaceWith(newCard);
            showToast('Document uploaded to IPFS successfully!', 'success');
        }, 1000);

    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        button.innerHTML = originalText;
        button.disabled = false;
        
        // Show error in progress bar
        const progressContainer = card.querySelector('.upload-progress');
        if (progressContainer) {
            progressContainer.querySelector('.progress-text').textContent = 'Upload failed - Click IPFS to retry';
            progressContainer.querySelector('.progress-fill').style.backgroundColor = '#ff4444';
        }
        
        showToast('Failed to upload to IPFS: ' + (error.response?.data?.error || error.message), 'error');
    }
}

// Add this function to optimize images before upload
async function optimizeImage(base64Data) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Max dimension
            const MAX_DIMENSION = 1200;
            
            // Scale down if image is too large
            if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                if (width > height) {
                    height = Math.round((height * MAX_DIMENSION) / width);
                    width = MAX_DIMENSION;
                } else {
                    width = Math.round((width * MAX_DIMENSION) / height);
                    height = MAX_DIMENSION;
                }
            }

            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to blob with quality 0.8 for JPG
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.8);
        };
        img.src = base64Data;
    });
}

function approveDocument(index) {
    const documents = JSON.parse(localStorage.getItem('adminDocuments') || '[]');
    documents[index].status = 'Approved';
    localStorage.setItem('adminDocuments', JSON.stringify(documents));
    loadDocuments();
}

function rejectDocument(index) {
    const documents = JSON.parse(localStorage.getItem('adminDocuments') || '[]');
    documents[index].status = 'Rejected';
    localStorage.setItem('adminDocuments', JSON.stringify(documents));
    loadDocuments();
}

// Apply theme
function applyTheme(theme) {
    const body = document.body;
    
    if (theme === 'dark') {
        body.classList.add('dark-theme');
        showNotification('Dark theme applied');
    } else if (theme === 'light') {
        body.classList.remove('dark-theme');
        showNotification('Light theme applied');
    } else if (theme === 'system') {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            body.classList.add('dark-theme');
        } else {
            body.classList.remove('dark-theme');
        }
        showNotification('System theme applied');
    }
}

// Initialize blockchain settings
function initBlockchainSettings() {
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            updateGasPrices();
            showNotification('Gas prices updated successfully!');
        });
    }
    
    // Initial gas price update
    updateGasPrices();
    
    // Network connection toggles
    const networkToggles = document.querySelectorAll('.network-toggle');
    networkToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const networkName = this.getAttribute('data-network');
            const isConnected = this.checked;
            
            // Update network status
            const statusIndicator = document.querySelector(`.network-card[data-network="${networkName}"] .status-indicator`);
            const statusText = document.querySelector(`.network-card[data-network="${networkName}"] .status-text`);
            
            if (statusIndicator && statusText) {
                if (isConnected) {
                    statusIndicator.classList.remove('disconnected');
                    statusIndicator.classList.add('connected');
                    statusText.textContent = 'Connected';
                    showNotification(`Connected to ${networkName} network`);
                } else {
                    statusIndicator.classList.remove('connected');
                    statusIndicator.classList.add('disconnected');
                    statusText.textContent = 'Disconnected';
                    showNotification(`Disconnected from ${networkName} network`);
                }
            }
        });
    });
}

// Update gas prices with random values (simulated)
function updateGasPrices() {
    const slowPrice = document.getElementById('slow-gas-price');
    const averagePrice = document.getElementById('average-gas-price');
    const fastPrice = document.getElementById('fast-gas-price');
    
    if (slowPrice && averagePrice && fastPrice) {
        // Simulate loading
        slowPrice.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        averagePrice.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        fastPrice.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // Simulate API delay
        setTimeout(() => {
            // Generate random gas prices
            const slow = Math.floor(Math.random() * 30) + 20;
            const average = slow + Math.floor(Math.random() * 20) + 10;
            const fast = average + Math.floor(Math.random() * 30) + 20;
            
            // Update UI
            slowPrice.textContent = slow;
            averagePrice.textContent = average;
            fastPrice.textContent = fast;
        }, 1000);
    }
}

// Handle 2FA setup
function setup2FA() {
    const enableToggle = document.getElementById('enable-2fa');
    const qrContainer = document.querySelector('.qr-container');
    const verifyBtn = document.querySelector('.verification-input button');
    
    if (enableToggle) {
        enableToggle.addEventListener('change', function() {
            if (this.checked) {
                // Show QR code when enabled
                if (qrContainer) {
                    qrContainer.style.display = 'flex';
                }
            } else {
                // Hide QR code when disabled
                if (qrContainer) {
                    qrContainer.style.display = 'none';
                }
            }
        });
    }
    
    if (verifyBtn) {
        verifyBtn.addEventListener('click', function() {
            const codeInput = document.querySelector('.verification-input input');
            if (codeInput && codeInput.value.length === 6) {
                // Simulate verification
                showNotification('Two-factor authentication enabled successfully!');
                
                // Hide QR code after successful verification
                if (qrContainer) {
                    qrContainer.style.display = 'none';
                }
            } else {
                showNotification('Please enter a valid 6-digit code', 'error');
            }
        });
    }
}

// Handle API key management
function initAPIKeys() {
    const showButtons = document.querySelectorAll('.api-key-show');
    const regenerateButtons = document.querySelectorAll('.api-key-regenerate');
    const deleteButtons = document.querySelectorAll('.api-key-delete');
    const generateButton = document.querySelector('.generate-key-btn');
    
    showButtons.forEach(button => {
        button.addEventListener('click', function() {
            const keyContainer = this.closest('.api-key-item');
            const keyMask = keyContainer.querySelector('.api-key-mask');
            
            if (keyMask.classList.contains('masked')) {
                // Show the API key
                keyMask.textContent = generateRandomAPIKey();
                keyMask.classList.remove('masked');
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                
                // Auto-hide after 30 seconds
                setTimeout(() => {
                    keyMask.textContent = '••••••••••••••••••••••••••••••';
                    keyMask.classList.add('masked');
                    this.innerHTML = '<i class="fas fa-eye"></i>';
                }, 30000);
            } else {
                // Hide the API key
                keyMask.textContent = '••••••••••••••••••••••••••••••';
                keyMask.classList.add('masked');
                this.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    });
    
    regenerateButtons.forEach(button => {
        button.addEventListener('click', function() {
            showConfirmDialog(
                'Regenerate API Key',
                'Are you sure you want to regenerate this API key? The current key will be invalidated immediately.',
                () => {
                    // Simulate regeneration
                    showNotification('API key regenerated successfully!');
                }
            );
        });
    });
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            showConfirmDialog(
                'Delete API Key',
                'Are you sure you want to delete this API key? This action cannot be undone.',
                () => {
                    // Simulate deletion
                    const keyItem = this.closest('.api-key-item');
                    keyItem.style.height = keyItem.offsetHeight + 'px';
                    keyItem.style.opacity = '0';
                    keyItem.style.marginTop = '0';
                    keyItem.style.marginBottom = '0';
                    keyItem.style.padding = '0';
                    keyItem.style.overflow = 'hidden';
                    
                    setTimeout(() => {
                        keyItem.remove();
                    }, 300);
                    
                    showNotification('API key deleted successfully!');
                }
            );
        });
    });
    
    if (generateButton) {
        generateButton.addEventListener('click', function() {
            // Show modal to create new API key
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <h2>Generate New API Key</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form class="settings-form">
                            <div class="form-group">
                                <label>Key Name</label>
                                <input type="text" placeholder="e.g., Development, Production">
                            </div>
                            <div class="form-group">
                                <label>Permissions</label>
                                <div class="checkbox-group">
                                    <label>
                                        <input type="checkbox" checked> Read
                                    </label>
                                    <label>
                                        <input type="checkbox"> Write
                                    </label>
                                    <label>
                                        <input type="checkbox"> Delete
                                    </label>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Expiration</label>
                                <select>
                                    <option value="never">Never</option>
                                    <option value="30days">30 Days</option>
                                    <option value="90days">90 Days</option>
                                    <option value="1year">1 Year</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="secondary-btn">Cancel</button>
                        <button class="primary-btn">Generate Key</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Show modal
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
            
            // Close modal
            const closeBtn = modal.querySelector('.modal-close');
            const cancelBtn = modal.querySelector('.secondary-btn');
            
            [closeBtn, cancelBtn].forEach(btn => {
                btn.addEventListener('click', function() {
                    modal.classList.remove('active');
                    setTimeout(() => {
                        modal.remove();
                    }, 300);
                });
            });
            
            // Generate key
            const generateBtn = modal.querySelector('.primary-btn');
            generateBtn.addEventListener('click', function() {
                // Simulate key generation
                const keyName = modal.querySelector('input[type="text"]').value || 'New API Key';
                
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.remove();
                    
                    // Show the new key
                    showNewAPIKey(keyName, generateRandomAPIKey());
                }, 300);
            });
        });
    }
}

// Show a newly generated API key
function showNewAPIKey(name, key) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2>API Key Generated</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>Your new API key has been generated. Please copy it now as it won't be shown again.</p>
                <div class="api-key-display">
                    <code>${key}</code>
                    <button class="copy-key-btn" data-key="${key}">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
                <div class="api-key-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Make sure to store this key securely. For security reasons, we can't show it again.</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="primary-btn">I've Copied It</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Copy key button
    const copyBtn = modal.querySelector('.copy-key-btn');
    copyBtn.addEventListener('click', function() {
        const keyToCopy = this.getAttribute('data-key');
        navigator.clipboard.writeText(keyToCopy).then(() => {
            this.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-copy"></i> Copy';
            }, 2000);
        });
    });
    
    // Close modal
    const closeBtn = modal.querySelector('.modal-close');
    const doneBtn = modal.querySelector('.primary-btn');
    
    [closeBtn, doneBtn].forEach(btn => {
        btn.addEventListener('click', function() {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
                
                // Add the new key to the list
                addAPIKeyToList(name, key);
            }, 300);
        });
    });
}

// Add a new API key to the list
function addAPIKeyToList(name, key) {
    const container = document.querySelector('.api-key-container');
    if (!container) return;
    
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    
    const keyItem = document.createElement('div');
    keyItem.className = 'api-key-item';
    keyItem.innerHTML = `
        <div class="api-key-header">
            <span class="api-key-name">${name}</span>
            <div class="api-key-actions">
                <button class="api-key-regenerate"><i class="fas fa-sync-alt"></i></button>
                <button class="api-key-delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>
        <div class="api-key-value">
            <span class="api-key-mask masked">••••••••••••••••••••••••••••••</span>
            <button class="api-key-show"><i class="fas fa-eye"></i></button>
        </div>
        <div class="api-key-info">
            <span>Created: ${formattedDate}</span>
            <span>Last used: Never</span>
        </div>
    `;
    
    // Add to the beginning of the list
    container.insertBefore(keyItem, container.firstChild);
    
    // Initialize the new buttons
    initAPIKeys();
    
    // Highlight the new item
    keyItem.style.backgroundColor = '#f0f7ff';
    setTimeout(() => {
        keyItem.style.transition = 'background-color 1s ease';
        keyItem.style.backgroundColor = 'white';
    }, 100);
}

// Generate a random API key
function generateRandomAPIKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    
    // Generate a random prefix
    for (let i = 0; i < 8; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    key += '.';
    
    // Generate a random middle section
    for (let i = 0; i < 16; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    key += '.';
    
    // Generate a random suffix
    for (let i = 0; i < 8; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return key;
}

// Show a confirmation dialog
function showConfirmDialog(title, message, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="secondary-btn">Cancel</button>
                <button class="primary-btn confirm">Confirm</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Close modal
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.secondary-btn');
    
    [closeBtn, cancelBtn].forEach(btn => {
        btn.addEventListener('click', function() {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        });
    });
    
    // Confirm action
    const confirmBtn = modal.querySelector('.primary-btn.confirm');
    confirmBtn.addEventListener('click', function() {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
        }, 300);
    });
}

// Enhanced notification function
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    let icon = 'fa-check-circle';
    let color = 'var(--success-color)';
    
    if (type === 'error') {
        icon = 'fa-exclamation-circle';
        color = 'var(--danger-color)';
    } else if (type === 'warning') {
        icon = 'fa-exclamation-triangle';
        color = 'var(--warning-color)';
    } else if (type === 'info') {
        icon = 'fa-info-circle';
        color = 'var(--info-color)';
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${icon}" style="color: ${color}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('active');
    }, 10);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('active');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
    
    // Close notification
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', function() {
        notification.classList.remove('active');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
}

// Security Settings Functions

// Initialize security settings
function initSecuritySettings() {
    // Two-factor authentication toggle
    const twoFactorToggle = document.getElementById('enable-2fa');
    const qrContainer = document.querySelector('.qr-container');
    
    if (twoFactorToggle && qrContainer) {
        twoFactorToggle.addEventListener('change', function() {
            if (this.checked) {
                // Show QR code when enabled
                qrContainer.style.display = 'flex';
            } else {
                // Hide QR code when disabled
                qrContainer.style.display = 'none';
            }
        });
    }
    
    // Verification code handling
    const verifyButton = document.querySelector('.verification-input button');
    if (verifyButton) {
        verifyButton.addEventListener('click', function() {
            const codeInput = document.querySelector('.verification-input input');
            if (codeInput && codeInput.value.length === 6) {
                // Simulate verification
                showNotification('Two-factor authentication enabled successfully!');
                
                // Hide QR code after successful verification
                if (qrContainer) {
                    qrContainer.style.display = 'none';
                }
            } else {
                showNotification('Please enter a valid 6-digit code', 'error');
            }
        });
    }
    
    // Password strength meter
    const passwordInput = document.getElementById('new-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    }
    
    // Session revoke buttons
    const revokeButtons = document.querySelectorAll('.revoke-btn');
    revokeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sessionItem = this.closest('.session-item');
            const sessionName = sessionItem.querySelector('.session-details h4').textContent;
            
            showConfirmDialog(
                'Revoke Session',
                `Are you sure you want to revoke the "${sessionName}" session? This will log out that device.`,
                () => {
                    // Simulate session revocation
                    sessionItem.style.opacity = '0.5';
                    this.disabled = true;
                    this.textContent = 'Revoking...';
                    
                    setTimeout(() => {
                        sessionItem.style.height = '0';
                        sessionItem.style.padding = '0';
                        sessionItem.style.margin = '0';
                        sessionItem.style.overflow = 'hidden';
                        sessionItem.style.borderBottom = 'none';
                        
                        setTimeout(() => {
                            sessionItem.remove();
                            showNotification('Session revoked successfully');
                        }, 300);
                    }, 1000);
                }
            );
        });
    });
    
    // Revoke all sessions button
    const revokeAllButton = document.querySelector('.danger-btn');
    if (revokeAllButton) {
        revokeAllButton.addEventListener('click', function() {
            showConfirmDialog(
                'Revoke All Sessions',
                'Are you sure you want to revoke all sessions? This will log you out of all devices except the current one.',
                () => {
                    // Simulate revoking all sessions
                    const sessionItems = document.querySelectorAll('.session-item:not(:first-child)');
                    sessionItems.forEach(item => {
                        item.style.opacity = '0.5';
                    });
                    
                    setTimeout(() => {
                        sessionItems.forEach(item => {
                            item.remove();
                        });
                        showNotification('All sessions revoked successfully');
                    }, 1000);
                }
            );
        });
    }
    
    // Security action buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const actionName = this.closest('.action-card').querySelector('h4').textContent;
            showNotification(`${actionName} configuration initiated`);
        });
    });
}

// Update password strength meter
function updatePasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    // Check requirements
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };
    
    // Update requirement indicators
    Object.keys(requirements).forEach(req => {
        const reqElement = document.getElementById(`req-${req}`);
        if (reqElement) {
            const icon = reqElement.querySelector('i');
            if (requirements[req]) {
                icon.className = 'fas fa-check-circle';
                reqElement.style.color = '#555';
            } else {
                icon.className = 'fas fa-times-circle';
                reqElement.style.color = '#777';
            }
        }
    });
    
    // Calculate strength percentage
    const metRequirements = Object.values(requirements).filter(Boolean).length;
    const strengthPercentage = (metRequirements / 5) * 100;
    
    // Update strength bar
    strengthBar.style.width = `${strengthPercentage}%`;
    
    // Update strength class and text
    if (strengthPercentage < 40) {
        strengthBar.className = 'strength-bar weak';
        strengthText.textContent = 'Weak password';
    } else if (strengthPercentage < 80) {
        strengthBar.className = 'strength-bar medium';
        strengthText.textContent = 'Medium password';
    } else {
        strengthBar.className = 'strength-bar strong';
        strengthText.textContent = 'Strong password';
    }
} 

document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const sidebar = document.querySelector('.sidebar');

    navToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        this.classList.toggle('active');
    });

    // Close navigation when clicking outside
    document.addEventListener('click', function(e) {
        if (!sidebar.contains(e.target) && !navToggle.contains(e.target)) {
            sidebar.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });

    // Handle scroll behavior
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            // Scrolling down - hide nav
            sidebar.style.transform = 'translateY(100%)';
        } else {
            // Scrolling up - show nav
            sidebar.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
});

// Add a toast notification function
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
}