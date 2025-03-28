// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 800,
    once: true
});

// Add pagination variables at the top of the file
let currentPage = 1;
const documentsPerPage = 10;
let totalDocumentPages = 1;

// Add CSS for IPFS button pulse animation
document.addEventListener('DOMContentLoaded', function() {
    // Add the pulse animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(245, 158, 11, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
            }
        }
        
        .ipfs-hash-container {
            margin-top: 10px;
            padding: 8px;
            background-color: rgba(0, 0, 0, 0.1);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .ipfs-label {
            font-weight: bold;
            margin-right: 10px;
            color: #9ca3af;
        }
        
        .ipfs-hash-link {
            color: #3b82f6;
            text-decoration: none;
            font-family: monospace;
            display: inline-flex;
            align-items: center;
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .ipfs-hash-link i {
            margin-right: 5px;
        }
        
        .ipfs-hash-link:hover {
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);
    
    console.log('Admin dashboard loaded');
    initializeAdminDashboard();
    
    // Add event listeners for search and filter
    document.getElementById('documentSearch').addEventListener('input', filterDocuments);
    document.getElementById('statusFilter').addEventListener('change', filterDocuments);
    
    // Show dashboard by default
    showPage('dashboard');
    
    // Ensure buttons are clickable
    makeButtonsClickable();
    
    // Add a MutationObserver to detect DOM changes and make buttons clickable again
    const observer = new MutationObserver(function(mutations) {
        makeButtonsClickable();
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
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
    showPage(sectionId);
}

function showPage(sectionId) {
    console.log('Showing section:', sectionId);
    
    // First, hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Then, show the requested section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // If showing documents section, ensure documents are loaded
        if (sectionId === 'documents') {
            console.log('Loading documents for documents section');
            if (typeof loadDocuments === 'function') {
                loadDocuments();
            } else {
                console.error('loadDocuments function not found');
            }
        } else if (sectionId === 'users') {
            console.log('Loading users for users section');
            if (typeof loadUsers === 'function') {
                loadUsers();
            } else {
                console.error('loadUsers function not found');
            }
        }
    } else {
        console.error('Section not found:', sectionId);
    }
    
    // Update the active state in the sidebar
    document.querySelectorAll('.sidebar-nav li').forEach(item => {
        item.classList.remove('active');
    });
    
    // Try both href and onclick attributes to find the active link
    const hrefLink = document.querySelector(`.sidebar-nav a[href="#${sectionId}"]`);
    const onclickLink = document.querySelector(`.sidebar-nav a[onclick*="${sectionId}"]`);
    
    if (hrefLink) {
        hrefLink.parentElement.classList.add('active');
    } else if (onclickLink) {
        onclickLink.parentElement.classList.add('active');
    }
}

function loadDocuments() {
    console.log('Loading documents from Firebase...');
    
    // Show loading indicator
    const documentsGrid = document.querySelector('.documents-grid');
    if (documentsGrid) {
        documentsGrid.innerHTML = `
            <div class="loading-indicator">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading documents...</p>
            </div>
        `;
    }
    
    // Get documents from Firebase
    const firebaseDb = firebase.database();
    if (firebaseDb) {
        firebaseDb.ref('userDocuments').once('value')
            .then((snapshot) => {
                const data = snapshot.val();
                if (!data) {
                    console.log('No documents found in Firebase');
                    displayDocuments([]);
                    return;
                }
                
                // Convert Firebase object to array and add ID
                const documents = Object.entries(data).map(([id, doc]) => ({
                    ...doc,
                    id: id
                }));
                
                console.log(`Loaded ${documents.length} documents from Firebase`);
                
                // Save a lighter version to localStorage for faster access
                try {
                    // Create a lightweight version by removing large file content
                    const lightDocuments = documents.map(doc => {
                        // Create a shallow copy of the document
                        const lightDoc = { ...doc };
                        
                        // Remove large file content if it exists
                        if (lightDoc.fileDetails && lightDoc.fileDetails.fileContent) {
                            // Save file name and type but not the content
                            lightDoc.fileDetails = {
                                fileName: lightDoc.fileDetails.fileName,
                                fileType: lightDoc.fileDetails.fileType,
                                fileSize: lightDoc.fileDetails.fileSize,
                                hasContent: true // Flag to indicate content exists in Firebase
                            };
                        }
                        
                        return lightDoc;
                    });
                    
                    // Store the lighter version in localStorage
                    localStorage.setItem('adminDocuments', JSON.stringify(lightDocuments));
                    
                    // Store documents in memory for the current session
                    window.adminDocuments = documents;
                } catch (storageError) {
                    console.error('Error saving to localStorage:', storageError);
                    
                    // If we hit storage limit, try storing even less data
                    try {
                        // Create an ultra light version with minimal data
                        const minimalDocuments = documents.map(doc => ({
                            id: doc.id,
                            status: doc.status,
                            createdAt: doc.createdAt,
                            service: doc.service,
                            userDetails: doc.userDetails ? {
                                name: doc.userDetails.name,
                                dob: doc.userDetails.dob
                            } : null,
                            hasDetails: true // Flag to indicate more details exist in Firebase
                        }));
                        
                        localStorage.setItem('adminDocuments', JSON.stringify(minimalDocuments));
                    } catch (e) {
                        console.error('Still cannot save to localStorage:', e);
                        showToast('Warning: Documents too large for local storage', 'warning');
                    }
                    
                    // Keep full documents in memory
                    window.adminDocuments = documents;
                }
                
                // Display the documents
                displayDocuments(documents);
            })
            .catch((error) => {
                console.error('Error loading documents from Firebase:', error);
                showToast('Error loading documents: ' + error.message, 'error');
                
                // Try to load from localStorage as fallback
                try {
                    const cachedDocuments = JSON.parse(localStorage.getItem('adminDocuments') || '[]');
                    displayDocuments(cachedDocuments);
                } catch (parseError) {
                    console.error('Error parsing cached documents:', parseError);
                    displayDocuments([]);
                }
            });
    } else {
        console.error('Firebase database not initialized');
        showToast('Firebase database not initialized', 'error');
        
        // Try to load from localStorage as fallback
        try {
            const cachedDocuments = JSON.parse(localStorage.getItem('adminDocuments') || '[]');
            displayDocuments(cachedDocuments);
        } catch (parseError) {
            console.error('Error parsing cached documents:', parseError);
            displayDocuments([]);
        }
    }
}

function filterDocuments() {
    const searchTerm = document.getElementById('documentSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    // Reset pagination to first page
    currentPage = 1;
    
    // Get full document list from memory
    const allDocuments = window.adminDocuments || [];
    
    // If we don't have documents in memory, try loading from localStorage
    if (allDocuments.length === 0) {
        try {
            const cachedDocuments = JSON.parse(localStorage.getItem('adminDocuments') || '[]');
            if (cachedDocuments.length > 0) {
                window.adminDocuments = cachedDocuments;
            }
        } catch (error) {
            console.error('Error parsing documents from localStorage:', error);
        }
    }
    
    // Apply filters to the full list
    let filteredDocuments = allDocuments.filter(doc => {
        // Search term filter
        const matchesSearch = searchTerm === '' || 
            (doc.userDetails?.name && doc.userDetails.name.toLowerCase().includes(searchTerm)) ||
            (doc.userDetails?.email && doc.userDetails.email.toLowerCase().includes(searchTerm)) ||
            (doc.walletAddress && doc.walletAddress.toLowerCase().includes(searchTerm)) ||
            (doc.fileDetails?.fileName && doc.fileDetails.fileName.toLowerCase().includes(searchTerm)) ||
            (doc.service && doc.service.toLowerCase().includes(searchTerm)) ||
            (doc.panNumber && doc.panNumber.toLowerCase().includes(searchTerm));
        
        // Status filter
        const matchesStatus = statusFilter === 'all' || 
            (doc.status && doc.status.toLowerCase() === statusFilter.toLowerCase());
        
        return matchesSearch && matchesStatus;
    });
    
    // Display filtered documents
    displayDocuments(filteredDocuments);
    
    // Show message if no results
    if (filteredDocuments.length === 0) {
        const documentsGrid = document.querySelector('.documents-grid');
        documentsGrid.innerHTML = `
            <div class="no-documents">
                <i class="fas fa-search"></i>
                <p>No documents match your search criteria</p>
                <button class="reset-filter-btn" onclick="resetFilters()">Reset Filters</button>
            </div>
        `;
    }
}

// Function to reset filters
function resetFilters() {
    // Clear search and reset filter
    document.getElementById('documentSearch').value = '';
    document.getElementById('statusFilter').value = 'all';
    
    // Reset page
    currentPage = 1;
    
    // Reload documents
    if (window.adminDocuments && window.adminDocuments.length > 0) {
        displayDocuments(window.adminDocuments);
    } else {
        loadDocuments();
    }
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
    
    // Store documents in a global variable for easy access if not already stored
    if (!window.adminDocuments) {
        window.adminDocuments = documents;
    }
    
    // Calculate pagination
    totalDocumentPages = Math.ceil(documents.length / documentsPerPage);
    
    // Get current page documents
    const startIndex = (currentPage - 1) * documentsPerPage;
    const endIndex = Math.min(startIndex + documentsPerPage, documents.length);
    const currentPageDocuments = documents.slice(startIndex, endIndex);
    
    // Clear the grid
    documentsGrid.innerHTML = '';
    
    // Create document cards for current page
    currentPageDocuments.forEach((doc, index) => {
        // The actual index in the full array
        const globalIndex = startIndex + index;
        const card = createDocumentCard(doc, globalIndex);
        documentsGrid.appendChild(card);
    });
    
    // Add pagination controls
    addDocumentPagination(documents.length);
    
    // Add event listeners to buttons after adding cards to DOM
    attachDocumentCardListeners();
}

// New function to attach event listeners to document card buttons
function attachDocumentCardListeners() {
    // Use event delegation - attach one listener to the documents grid
    const documentsGrid = document.querySelector('.documents-grid');
    if (!documentsGrid) return;
    
    // Remove any existing event listeners by cloning and replacing
    const newGrid = documentsGrid.cloneNode(true);
    documentsGrid.parentNode.replaceChild(newGrid, documentsGrid);
    
    // Add a single event listener for all button clicks
    newGrid.addEventListener('click', function(e) {
        // Find the closest button to the click target
        const button = e.target.closest('button');
        if (!button) return;
        
        // Get the action type from data attribute
        const action = button.getAttribute('data-action');
        if (!action) return;
        
        // Find the parent card and get the document index
        const card = button.closest('.document-card');
        if (!card) return;
        
        const index = parseInt(card.dataset.documentIndex);
        if (isNaN(index)) return;
        
        // Prevent default and stop propagation
        e.preventDefault();
        e.stopPropagation();
        
        // Call the appropriate function based on action type
        switch (action) {
            case 'view':
                viewDocument(index);
                break;
            case 'ipfs':
                if (!button.disabled) {
                    uploadToIPFS(index);
                }
                break;
            case 'approve':
                if (!button.disabled) {
                    approveDocument(index);
                }
                break;
            case 'reject':
                if (!button.disabled) {
                    rejectDocument(index);
                }
                break;
            case 'push':
                pushToUser(index);
                break;
        }
    });
}

function createDocumentCard(doc, index) {
    const card = document.createElement('div');
    card.className = 'document-card';
    card.dataset.documentIndex = index; // Store index as data attribute for easier access
    
    // Determine status class
    const statusClass = doc.status ? doc.status.toLowerCase().replace(' ', '-') : 'pending';
    
    // Format date if available
    const formattedDate = doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A';
    
    // Extract user details if available
    const userName = doc.userDetails?.name || 'Unknown User';
    const userDob = doc.userDetails?.dob || 'N/A';
    
    // Extract transaction hash or use placeholder
    const txHash = doc.transactionHash || 'No transaction';
    const txHashDisplay = txHash.startsWith('firebase-only') ? 'Firebase Only' : 
                         (txHash.length > 14 ? `${txHash.slice(0, 8)}...${txHash.slice(-6)}` : txHash);
    
    // Extract file details
    const fileName = doc.fileDetails?.fileName || 'Unknown file';
    
    // Construct card HTML
    card.innerHTML = `
        <div class="document-header">
            <span class="document-status ${statusClass}">${doc.status || 'Pending'}</span>
            <span class="document-date">${formattedDate}</span>
        </div>
        
        <div class="user-info">
            <div class="flex justify-between items-center">
                <h3>${userName}</h3>
                <button class="push-btn" data-action="push">
                    <i class="fas fa-paper-plane"></i> Push to User
                </button>
            </div>
            <p><i class="fas fa-calendar"></i> DOB: ${userDob}</p>
            <p><i class="fas fa-file-alt"></i> Service: ${doc.service || 'N/A'}</p>
            <p><i class="fas fa-id-card"></i> PAN: ${doc.panNumber || 'N/A'}</p>
            <p><i class="fas fa-wallet"></i> ${doc.walletAddress ? `${doc.walletAddress.slice(0, 6)}...${doc.walletAddress.slice(-4)}` : 'No wallet'}</p>
        </div>
        
        <div class="document-details">
            <div class="meta-item">
                <i class="fas fa-file"></i>
                <span>${fileName}</span>
            </div>
            <div class="meta-item">
                <i class="fas fa-clock"></i>
                <span>${doc.createdAt ? new Date(doc.createdAt).toLocaleString() : 'N/A'}</span>
            </div>
            <div class="meta-item transaction-hash">
                <i class="fas fa-receipt"></i>
                <span>Tx: </span>
                ${txHash.startsWith('firebase-only') ? 
                    `<span class="firebase-only">Firebase-only (No Blockchain)</span>` :
                    (txHash.includes('https') ?
                        `<a href="${txHash}" target="_blank" class="tx-hash-link" title="View on Etherscan">${txHashDisplay}</a>` :
                        `<a href="https://sepolia.etherscan.io/tx/${txHash}" target="_blank" class="tx-hash-link" title="View on Etherscan">${txHashDisplay}</a>`
                    )
                }
            </div>
        </div>
        
        <div class="document-actions-footer">
            <button class="view-btn" data-action="view">
                <i class="fas fa-eye"></i> View
            </button>
            <button class="ipfs-btn" data-action="ipfs" ${doc.ipfsHash ? 'disabled' : ''}>
                <i class="fas fa-cloud-upload-alt"></i> IPFS
            </button>
            <button class="approve-btn" data-action="approve" ${doc.status === 'Approved' ? 'disabled' : ''}>
                <i class="fas fa-check"></i> Approve
            </button>
            <button class="reject-btn" data-action="reject" ${doc.status === 'Rejected' ? 'disabled' : ''}>
                <i class="fas fa-times"></i> Reject
            </button>
        </div>
        
        ${doc.status === 'Approved' && doc.ipfsHash ? `
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

async function uploadToIPFS(index) {
    // Get the document card based on the document index
    const documentCards = document.querySelectorAll('.document-card');
    let card = null;
    
    // Find the card with the matching data-document-index attribute
    for (const docCard of documentCards) {
        if (parseInt(docCard.dataset.documentIndex) === index) {
            card = docCard;
            break;
        }
    }
    
    // If we can't find the card by data attribute, fall back to nth-child
    if (!card) {
        // This might not be accurate with pagination, but keeping as fallback
        const displayedIndex = index % documentsPerPage;
        card = document.querySelector(`.documents-grid .document-card:nth-child(${displayedIndex + 1})`);
    }
    
    // If we still don't have a card, try to find the IPFS button itself
    if (!card) {
        const buttons = document.querySelectorAll('.ipfs-btn');
        buttons.forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes(`uploadToIPFS(${index})`)) {
                card = btn.closest('.document-card');
            }
        });
    }
    
    if (!card) {
        console.error('Could not find document card for index:', index);
        showToast('Error: Could not find document card', 'error');
        return;
    }
    
    const button = card.querySelector('.ipfs-btn');
    if (!button) {
        console.error('Could not find IPFS button in card:', card);
        showToast('Error: Could not find IPFS button', 'error');
        return;
    }
    
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

        // Get the documents from memory or localStorage
        const documents = window.adminDocuments || JSON.parse(localStorage.getItem('adminDocuments') || '[]');
        const doc = documents[index];

        if (!doc) {
            throw new Error('Document not found');
        }
        
        // If document already has IPFS hash, show it
        if (doc.ipfsHash) {
            progressContainer.querySelector('.progress-text').textContent = 'Already on IPFS!';
            progressContainer.querySelector('.progress-fill').style.width = '100%';
            
            // Just update UI to show IPFS hash
            setTimeout(() => {
                showToast(`Document already on IPFS: ${doc.ipfsHash}`, 'info');
                const newCard = createDocumentCard(doc, index);
                card.replaceWith(newCard);
                // Reattach event listeners for the new card
                attachDocumentCardListeners();
            }, 1000);
            
            return;
        }

        // Check Firebase first - maybe the document has an IPFS hash there
        if (doc.id && firebase) {
            try {
                const snapshot = await firebase.database().ref(`userDocuments/${doc.id}`).once('value');
                const firebaseDoc = snapshot.val();
                
                if (firebaseDoc && firebaseDoc.ipfsHash) {
                    // Document already has IPFS hash in Firebase
                    doc.ipfsHash = firebaseDoc.ipfsHash;
                    
                    // Update in memory
                    if (window.adminDocuments && window.adminDocuments[index]) {
                        window.adminDocuments[index].ipfsHash = doc.ipfsHash;
                    }
                    
                    // Update localStorage
                    try {
                        const lightDocuments = JSON.parse(localStorage.getItem('adminDocuments') || '[]');
                        if (lightDocuments[index]) {
                            lightDocuments[index].ipfsHash = doc.ipfsHash;
                            localStorage.setItem('adminDocuments', JSON.stringify(lightDocuments));
                        }
                    } catch (storageError) {
                        console.warn('Could not update localStorage:', storageError);
                    }
                    
                    progressContainer.querySelector('.progress-text').textContent = 'Already on IPFS!';
                    progressContainer.querySelector('.progress-fill').style.width = '100%';
                    
                    // Update UI
                    setTimeout(() => {
                        showToast(`Document already on IPFS: ${doc.ipfsHash}`, 'info');
                        const newCard = createDocumentCard(doc, index);
                        card.replaceWith(newCard);
                        // Reattach event listeners for the new card
                        attachDocumentCardListeners();
                    }, 1000);
                    
                    return;
                }
            } catch (firebaseError) {
                console.warn('Error checking Firebase for IPFS hash:', firebaseError);
                // Continue with upload, don't throw
            }
        }

        // Get file details from correct location
        const fileName = doc.fileDetails?.fileName || doc.fileName || 'document';
        const fileData = doc.fileDetails?.fileContent || doc.fileData;
        
        if (!fileData) {
            throw new Error('No file data available to upload');
        }

        // Determine file type from the file name or default to application/octet-stream
        const fileType = fileName.includes('.') ? 
            `application/${fileName.split('.').pop().toLowerCase()}` : 
            'application/octet-stream';

        // Optimize file size before upload (if it's an image)
        let file;
        if (fileName.match(/\.(jpg|jpeg|png)$/i)) {
            const optimizedBlob = await optimizeImage(fileData);
            file = new File([optimizedBlob], fileName);
        } else {
            const response = await fetch(fileData);
            const blob = await response.blob();
            file = new File([blob], fileName, { type: fileType });
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
                'pinata_api_key': window.appConfig?.pinata?.apiKey || 'f06e5fd1f9bd46842319',
                'pinata_secret_api_key': window.appConfig?.pinata?.secretKey || '8860a2b0c4cc09b36797ebf7f1b05026705ce60c97d65687eba30ef2651517cd'
            },
            timeout: 30000, // 30 second timeout
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 70) / progressEvent.total + 30);
                progressContainer.querySelector('.progress-fill').style.width = `${percentCompleted}%`;
                progressContainer.querySelector('.progress-text').textContent = `Uploading: ${percentCompleted}%`;
            }
        });

        console.log('IPFS upload result:', result.data);

        // Update the document with IPFS hash
        doc.ipfsHash = result.data.IpfsHash;
        
        // Update in memory
        if (window.adminDocuments && window.adminDocuments[index]) {
            window.adminDocuments[index].ipfsHash = doc.ipfsHash;
        }
        
        // Update Firebase if we have an ID
        if (doc.id && window.firebase) {
            try {
                const firebaseDb = firebase.database();
                if (firebaseDb) {
                    // Get the document reference
                    const docRef = doc.id.includes('/') ? doc.id : 'userDocuments/' + doc.id;
                    
                    // Get existing document to merge updates correctly
                    const snapshot = await firebaseDb.ref(docRef).once('value');
                    const existingDoc = snapshot.val() || {};
                    
                    // Create updated fileDetails object properly
                    const fileDetails = existingDoc.fileDetails || {};
                    fileDetails.ipfsHash = result.data.IpfsHash;
                    fileDetails.ipfsUrl = `https://ipfs.io/ipfs/${result.data.IpfsHash}`;
                    
                    // Update the document with IPFS hash at both levels
                    await firebaseDb.ref(docRef).update({
                        ipfsHash: result.data.IpfsHash, // Root level hash
                        ipfsUrl: `https://ipfs.io/ipfs/${result.data.IpfsHash}`, // Root level URL
                        fileDetails: fileDetails // Updated fileDetails object with IPFS info
                    });
                    
                    console.log('Updated Firebase with IPFS hash:', result.data.IpfsHash);
                }
            } catch (firebaseError) {
                console.error('Failed to update Firebase:', firebaseError);
            }
        }
        
        // Save updated documents back to localStorage
        try {
            const lightDocuments = JSON.parse(localStorage.getItem('adminDocuments') || '[]');
            if (lightDocuments[index]) {
                lightDocuments[index].ipfsHash = doc.ipfsHash;
                localStorage.setItem('adminDocuments', JSON.stringify(lightDocuments));
            }
        } catch (storageError) {
            console.warn('Could not update localStorage:', storageError);
        }

        // Show 100% completion
        progressContainer.querySelector('.progress-fill').style.width = '100%';
        progressContainer.querySelector('.progress-text').textContent = 'Upload Complete!';

        // Refresh the card display after a short delay
        setTimeout(() => {
            const newCard = createDocumentCard(doc, index);
            card.replaceWith(newCard);
            
            // Reattach event listeners for the new card
            attachDocumentCardListeners();
            
            // Add the IPFS view link to the card if it doesn't exist
            const addedCard = Array.from(document.querySelectorAll('.document-card'))
                .find(c => parseInt(c.dataset.documentIndex) === index);
                
            if (addedCard && !addedCard.querySelector('.ipfs-hash-container')) {
                const ipfsContainer = document.createElement('div');
                ipfsContainer.className = 'ipfs-hash-container';
                ipfsContainer.innerHTML = `
                    <p class="ipfs-label">IPFS Hash:</p>
                    <a href="https://ipfs.io/ipfs/${doc.ipfsHash}" target="_blank" class="ipfs-hash-link">
                        <i class="fas fa-external-link-alt"></i>
                        ${doc.ipfsHash.slice(0, 20)}...${doc.ipfsHash.slice(-8)}
                    </a>
                `;
                addedCard.appendChild(ipfsContainer);
            }
            
            showToast('Document uploaded to IPFS successfully!', 'success');
            
            // If the document is already approved, make sure it shows the IPFS hash
            if (doc.status === 'Approved') {
                showToast('Document is approved and now has IPFS link', 'success');
            }
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

async function approveDocument(index) {
    // Get documents from memory first, fall back to localStorage
    const documents = window.adminDocuments || JSON.parse(localStorage.getItem('adminDocuments') || '[]');
    const doc = documents[index];
    
    if (!doc) {
        showToast('Document not found', 'error');
        return;
    }
    
    // Update the document status
    doc.status = 'Approved';
    doc.approvedAt = new Date().toISOString();
    
    try {
        // If there's no IPFS hash yet, try to upload it first
        if (!doc.ipfsHash) {
            showToast('Document needs to be uploaded to IPFS first. Starting upload...', 'info');
            
            try {
                // We need to call uploadToIPFS but we can't directly await it
                // Instead, mark the document as pending upload and let the user know
                showToast('Please click the IPFS button to upload this document first', 'warning');
                
                // Update UI to highlight IPFS button - find by data attribute for better accuracy
                const documentCard = Array.from(document.querySelectorAll('.document-card'))
                    .find(card => parseInt(card.dataset.documentIndex) === index);
                    
                if (documentCard) {
                    const ipfsBtn = documentCard.querySelector('.ipfs-btn');
                    if (ipfsBtn) {
                        ipfsBtn.style.animation = 'pulse 1.5s infinite';
                        ipfsBtn.style.backgroundColor = '#f59e0b';
                    }
                }
                
                // Still proceed with approval
            } catch (ipfsError) {
                console.error('Error during IPFS upload:', ipfsError);
                // Continue with approval process even if IPFS upload fails
            }
        }
        
        // Update in Firebase
        await firebase.database().ref(`userDocuments/${doc.id}`).update({
            status: doc.status,
            approvedAt: doc.approvedAt
        });
        
        showToast('Document approved successfully', 'success');
        
        // Update document in memory
        if (window.adminDocuments) {
            window.adminDocuments[index] = doc;
        }
        
        // Try to update in localStorage (simplified version)
        try {
            const lightDocuments = JSON.parse(localStorage.getItem('adminDocuments') || '[]');
            if (lightDocuments[index]) {
                lightDocuments[index].status = doc.status;
                lightDocuments[index].approvedAt = doc.approvedAt;
                localStorage.setItem('adminDocuments', JSON.stringify(lightDocuments));
            }
        } catch (storageError) {
            console.warn('Could not update localStorage:', storageError);
        }
        
        // Update the UI by finding the card using data attribute
        const documentCard = Array.from(document.querySelectorAll('.document-card'))
            .find(card => parseInt(card.dataset.documentIndex) === index);
            
        if (documentCard) {
            // Create a new card with updated data
            const newCard = createDocumentCard(doc, index);
            documentCard.replaceWith(newCard);
            
            // Reattach event listeners for the new card
            attachDocumentCardListeners();
        } else {
            // If we can't find the card, refresh the whole document display
            displayDocuments(window.adminDocuments);
        }
    } catch (error) {
        console.error('Error approving document:', error);
        showToast('Error approving document: ' + error.message, 'error');
    }
}

function rejectDocument(index) {
    const documents = window.adminDocuments || JSON.parse(localStorage.getItem('adminDocuments') || '[]');
    const doc = documents[index];
    
    if (!doc) {
        showToast('Document not found', 'error');
        return;
    }
    
    try {
        // Update status in memory and localStorage
        doc.status = 'Rejected';
        doc.rejectedAt = new Date().toISOString();
        
        // Update in memory
        if (window.adminDocuments && window.adminDocuments[index]) {
            window.adminDocuments[index].status = 'Rejected';
            window.adminDocuments[index].rejectedAt = doc.rejectedAt;
        }
        
        // Try to update in localStorage
        try {
            const lightDocuments = JSON.parse(localStorage.getItem('adminDocuments') || '[]');
            if (lightDocuments[index]) {
                lightDocuments[index].status = 'Rejected';
                lightDocuments[index].rejectedAt = doc.rejectedAt;
                localStorage.setItem('adminDocuments', JSON.stringify(lightDocuments));
            }
        } catch (storageError) {
            console.warn('Could not update localStorage:', storageError);
        }
        
        // Update status in Firebase
        const firebaseDb = firebase.database();
        if (firebaseDb && doc.id) {
            firebaseDb.ref('userDocuments/' + doc.id).update({
                status: 'Rejected',
                rejectedAt: doc.rejectedAt,
                lastUpdated: new Date().getTime()
            }).then(() => {
                showToast('Document rejected successfully!', 'success');
                
                // Update the UI by finding the card using data attribute
                const documentCard = Array.from(document.querySelectorAll('.document-card'))
                    .find(card => parseInt(card.dataset.documentIndex) === index);
                
                if (documentCard) {
                    // Create a new card with updated data
                    const newCard = createDocumentCard(doc, index);
                    documentCard.replaceWith(newCard);
                    
                    // Reattach event listeners for the new card
                    attachDocumentCardListeners();
                } else {
                    // If we can't find the card, refresh the whole document display
                    displayDocuments(window.adminDocuments);
                }
            }).catch(error => {
                console.error('Error updating Firebase:', error);
                showToast('Error updating Firebase: ' + error.message, 'error');
            });
        } else {
            // Update UI without Firebase
            const documentCard = Array.from(document.querySelectorAll('.document-card'))
                .find(card => parseInt(card.dataset.documentIndex) === index);
            
            if (documentCard) {
                // Create a new card with updated data
                const newCard = createDocumentCard(doc, index);
                documentCard.replaceWith(newCard);
                
                // Reattach event listeners for the new card
                attachDocumentCardListeners();
            } else {
                // If we can't find the card, refresh the whole document display
                displayDocuments(window.adminDocuments);
            }
        }
    } catch (error) {
        console.error('Error rejecting document:', error);
        showToast('Error rejecting document: ' + error.message, 'error');
    }
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
        <span style="color: black !important;">${message}</span>
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

// Add the pushToUser function
async function pushToUser(index) {
    try {
        // Get documents from memory first, fall back to localStorage
        const documents = window.adminDocuments || JSON.parse(localStorage.getItem('adminDocuments') || '[]');
        const doc = documents[index];
        
        if (!doc) {
            showToast('Document not found', 'error');
            return;
        }
        
        if (!doc.status || doc.status === 'Pending') {
            showToast('Please approve or reject the document first', 'error');
            return;
        }
        
        // Get Firebase reference
        const firebaseDb = firebase.database();
        if (!firebaseDb) {
            showToast('Firebase database not available', 'error');
            return;
        }
        
        // Check if we have the document ID
        if (!doc.id) {
            showToast('Document ID not found, cannot push update', 'error');
            return;
        }
        
        // Generate IPFS hash if approved but missing
        if (doc.status === 'Approved' && !doc.ipfsHash) {
            showToast('Generating IPFS hash before pushing...', 'info');
            
            // Find and highlight the IPFS button
            const documentCard = Array.from(document.querySelectorAll('.document-card'))
                .find(card => parseInt(card.dataset.documentIndex) === index);
                
            if (documentCard) {
                const ipfsBtn = documentCard.querySelector('.ipfs-btn');
                if (ipfsBtn) {
                    ipfsBtn.style.animation = 'pulse 1.5s infinite';
                    ipfsBtn.style.backgroundColor = '#f59e0b';
                    showToast('Please click the highlighted IPFS button first', 'warning');
                    return;
                }
            }
        }
        
        // Get reference to the document
        const docRef = firebaseDb.ref('userDocuments/' + doc.id);
        
        // Show loading
        showToast('Pushing update to user...', 'info');
        
        // First get the current document to update fileDetails properly
        const snapshot = await docRef.once('value');
        const existingDoc = snapshot.val();
        
        // Prepare basic update data
        const updateData = {
            status: doc.status,
            lastUpdated: new Date().getTime(),
            adminComment: `Document ${doc.status.toLowerCase()} by admin on ${new Date().toLocaleString()}`
        };
        
        // Add IPFS hash to root level if available
        if (doc.ipfsHash) {
            // Update at the root level - this is essential for the user dashboard display
            updateData.ipfsHash = doc.ipfsHash;
            updateData.ipfsUrl = `https://ipfs.io/ipfs/${doc.ipfsHash}`;
            
            // Get existing fileDetails or create new object
            let fileDetails = existingDoc && existingDoc.fileDetails ? 
                {...existingDoc.fileDetails} : // Create a copy of the existing fileDetails
                {}; // Create new empty object if no fileDetails exists
            
            // Update fileDetails with IPFS hash - both of these properties must exist
            fileDetails.ipfsHash = doc.ipfsHash;
            fileDetails.ipfsUrl = `https://ipfs.io/ipfs/${doc.ipfsHash}`;
            
            // Add updated fileDetails to the update
            updateData.fileDetails = fileDetails;
            
            console.log('Pushing IPFS hash update to user:', {
                docId: doc.id,
                ipfsHash: doc.ipfsHash,
                updateData: JSON.stringify(updateData)
            });
        }
        
        // Update the document
        await docRef.update(updateData);
        
        showToast(`Document status "${doc.status}" pushed to user successfully!`, 'success');
        
        // Update the UI by finding the card using data attribute
        const documentCard = Array.from(document.querySelectorAll('.document-card'))
            .find(card => parseInt(card.dataset.documentIndex) === index);
        
        if (documentCard) {
            // Update the card to show pushed status
            const statusSpan = documentCard.querySelector('.document-status');
            if (statusSpan) {
                statusSpan.textContent = `${doc.status} (Pushed)`;
            }
            
            // Add a brief highlight effect
            documentCard.style.transition = 'background-color 0.5s ease';
            documentCard.style.backgroundColor = '#d1fae5';
            setTimeout(() => {
                documentCard.style.backgroundColor = '';
            }, 1500);
        }
        
    } catch (error) {
        console.error('Error pushing to user:', error);
        showToast('Failed to push document to user: ' + error.message, 'error');
    }
}

function makeButtonsClickable() {
    console.log('Making buttons clickable');
    
    // Make all buttons explicitly clickable
    const buttons = document.querySelectorAll('button, .btn, [role="button"], .document-action-btn');
    buttons.forEach(button => {
        button.style.pointerEvents = 'auto';
        button.style.cursor = 'pointer';
    });
    
    // Make document cards and filenames clickable
    const documentCards = document.querySelectorAll('.document-card');
    documentCards.forEach(card => {
        card.style.pointerEvents = 'auto';
        
        const filename = card.querySelector('.document-filename');
        if (filename) {
            filename.style.cursor = 'pointer';
            filename.style.pointerEvents = 'auto';
        }
    });
}

// Function to add pagination controls
function addDocumentPagination(totalDocuments) {
    const documentsSection = document.getElementById('documents');
    let paginationContainer = documentsSection.querySelector('.documents-pagination');
    
    // Create pagination container if it doesn't exist
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.className = 'documents-pagination';
        documentsSection.appendChild(paginationContainer);
    }
    
    // Clear existing pagination
    paginationContainer.innerHTML = '';
    
    // Only show pagination if we have more than one page
    if (totalDocumentPages <= 1) {
        return;
    }
    
    // Create pagination info
    const paginationInfo = document.createElement('div');
    paginationInfo.className = 'pagination-info';
    paginationInfo.textContent = `Page ${currentPage} of ${totalDocumentPages} (${totalDocuments} documents)`;
    paginationContainer.appendChild(paginationInfo);
    
    // Create pagination buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'pagination-buttons';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = 'pagination-btn prev';
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i> Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayDocuments(window.adminDocuments);
        }
    });
    buttonContainer.appendChild(prevButton);
    
    // Page number buttons
    const maxButtons = 5; // Maximum number of page buttons to show
    const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalDocumentPages, startPage + maxButtons - 1);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `pagination-btn page ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            displayDocuments(window.adminDocuments);
        });
        buttonContainer.appendChild(pageButton);
    }
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = 'pagination-btn next';
    nextButton.innerHTML = 'Next <i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalDocumentPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalDocumentPages) {
            currentPage++;
            displayDocuments(window.adminDocuments);
        }
    });
    buttonContainer.appendChild(nextButton);
    
    paginationContainer.appendChild(buttonContainer);
    
    // Add some CSS for pagination
    if (!document.getElementById('pagination-styles')) {
        const style = document.createElement('style');
        style.id = 'pagination-styles';
        style.textContent = `
            .documents-pagination {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-top: 20px;
                gap: 10px;
            }
            
            .pagination-info {
                color: white;
                font-size: 14px;
            }
            
            .pagination-buttons {
                display: flex;
                gap: 5px;
            }
            
            .pagination-btn {
                background-color: #333;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            
            .pagination-btn:hover:not(:disabled) {
                background-color: #444;
            }
            
            .pagination-btn.active {
                background-color: #3b82f6;
            }
            
            .pagination-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);
    }
}

function viewDocument(index) {
    // First try to get document from memory
    const documents = window.adminDocuments || [];
    let doc = documents[index];
    
    // If not in memory or missing content, check if we need to fetch from Firebase
    if (!doc || (doc.fileDetails && !doc.fileDetails.fileContent && (doc.fileDetails.hasContent || doc.hasDetails))) {
        // Need to fetch from Firebase
        const firebaseDb = firebase.database();
        const docId = doc?.id;
        
        if (firebaseDb && docId) {
            showToast('Loading document content...', 'info');
            
            firebaseDb.ref(`userDocuments/${docId}`).once('value')
                .then((snapshot) => {
                    const fullDoc = snapshot.val();
                    if (fullDoc && fullDoc.fileDetails && fullDoc.fileDetails.fileContent) {
                        // Open file content in new tab
                        openDocumentInNewTab(fullDoc.fileDetails.fileContent);
                    } else {
                        showToast('File content not available in database', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error fetching document content:', error);
                    showToast('Error loading file content: ' + error.message, 'error');
                });
        } else {
            showToast('Cannot load document - missing ID', 'error');
        }
        return;
    }
    
    // Check if we have file content to display
    if (doc.fileDetails && doc.fileDetails.fileContent) {
        openDocumentInNewTab(doc.fileDetails.fileContent);
    } else if (doc.fileDetails && doc.fileDetails.storageIssue) {
        // Show storage issue message
        showToast('Cannot display file: ' + doc.fileDetails.storageIssue, 'error');
    } else {
        // No file content available
        showToast('File content not available. File may be too large or not properly stored.', 'error');
    }
}

// Helper function to open document in new tab
function openDocumentInNewTab(fileContent) {
    const win = window.open();
    win.document.write(`
        <iframe src="${fileContent}" frameborder="0" 
        style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" 
        allowfullscreen></iframe>
    `);
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