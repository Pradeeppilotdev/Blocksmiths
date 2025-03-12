// Document Management Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Search functionality
    const searchInput = document.querySelector('.search-filter input');
    const statusFilter = document.querySelector('.search-filter select');
    const documentsGrid = document.querySelector('.documents-grid');
    const documentCards = document.querySelectorAll('.document-card');

    // Search and filter documents
    function filterDocuments() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedStatus = statusFilter.value;

        documentCards.forEach(card => {
            const userName = card.querySelector('.user-info h3').textContent.toLowerCase();
            const userEmail = card.querySelector('.user-email').textContent.toLowerCase();
            const walletAddress = card.querySelector('.wallet-address').textContent.toLowerCase();
            const documentName = card.querySelector('.document-details .meta-item span').textContent.toLowerCase();
            const status = card.querySelector('.document-status').textContent.toLowerCase();

            const matchesSearch = userName.includes(searchTerm) || 
                                userEmail.includes(searchTerm) || 
                                walletAddress.includes(searchTerm) || 
                                documentName.includes(searchTerm);

            const matchesStatus = selectedStatus === 'all' || status.includes(selectedStatus.toLowerCase());

            card.style.display = matchesSearch && matchesStatus ? 'block' : 'none';
        });
    }

    searchInput.addEventListener('input', filterDocuments);
    statusFilter.addEventListener('change', filterDocuments);

    // Document Actions
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Prevent event from bubbling up
            e.stopPropagation();
            
            // Create dropdown menu
            const menu = document.createElement('div');
            menu.className = 'action-menu';
            menu.innerHTML = `
                <div class="action-menu-item">Download</div>
                <div class="action-menu-item">Share</div>
                <div class="action-menu-item delete">Delete</div>
            `;
            
            // Position the menu
            const rect = btn.getBoundingClientRect();
            menu.style.position = 'absolute';
            menu.style.top = rect.bottom + 5 + 'px';
            menu.style.left = rect.left + 'px';
            
            // Add menu to body
            document.body.appendChild(menu);
            
            // Close menu when clicking outside
            function closeMenu(e) {
                if (!menu.contains(e.target) && !btn.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            }
            
            document.addEventListener('click', closeMenu);
        });
    });

    // Approval/Rejection functionality
    document.querySelectorAll('.approve-btn, .reject-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = btn.closest('.document-card');
            const statusElement = card.querySelector('.document-status');
            const approvalButtons = card.querySelector('.approval-buttons');
            
            // Remove active class from all buttons
            approvalButtons.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            
            if (btn.classList.contains('approve-btn')) {
                statusElement.textContent = 'Approved';
                statusElement.className = 'document-status approved';
                btn.classList.add('active');
            } else {
                statusElement.textContent = 'Rejected';
                statusElement.className = 'document-status rejected';
                btn.classList.add('active');
            }
        });
    });

    // Upload Document functionality
    const uploadBtn = document.querySelector('.primary-btn');
    uploadBtn.addEventListener('click', function() {
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
        
        fileInput.click();
        
        fileInput.addEventListener('change', function() {
            if (fileInput.files.length > 0) {
                // Here you would typically handle the file upload to your server
                // For demonstration, we'll just show an alert
                alert(`File "${fileInput.files[0].name}" selected for upload. In a real application, this would be uploaded to the server.`);
            }
        });
    });

    // View Document functionality
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = btn.closest('.document-card');
            const documentName = card.querySelector('.document-details .meta-item span').textContent;
            
            // Here you would typically open the document in a viewer or new tab
            // For demonstration, we'll just show an alert
            alert(`Opening document: ${documentName}`);
        });
    });
});

// Add custom styles for action menu
const style = document.createElement('style');
style.textContent = `
    .action-menu {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 1000;
    }

    .action-menu-item {
        padding: 8px 15px;
        cursor: pointer;
        font-size: 14px;
    }

    .action-menu-item:hover {
        background: #f5f5f5;
    }

    .action-menu-item.delete {
        color: #dc3545;
    }

    .action-menu-item.delete:hover {
        background: #ffebee;
    }
`;
document.head.appendChild(style);
