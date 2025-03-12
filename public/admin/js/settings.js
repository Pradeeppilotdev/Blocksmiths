document.addEventListener('DOMContentLoaded', function() {
    // Settings Navigation
    const settingsNavLinks = document.querySelectorAll('.settings-nav a');
    const settingsPanels = document.querySelectorAll('.settings-panel');

    settingsNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and panels
            settingsNavLinks.forEach(link => link.parentElement.classList.remove('active'));
            settingsPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked link and corresponding panel
            this.parentElement.classList.add('active');
            const targetPanel = document.querySelector(this.getAttribute('href'));
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });

    // Theme Selection
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            themeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            const theme = this.querySelector('.theme-preview').classList[1];
            applyTheme(theme);
        });
    });

    // Profile Image Upload
    const changeImageBtn = document.querySelector('.change-image-btn');
    if (changeImageBtn) {
        changeImageBtn.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        document.querySelector('.profile-image img').src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            };
            
            input.click();
        });
    }

    // Password Strength Meter
    const passwordInput = document.getElementById('new-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    }

    // Two-Factor Authentication
    const twoFactorToggle = document.getElementById('enable-2fa');
    const qrContainer = document.querySelector('.qr-container');
    
    if (twoFactorToggle && qrContainer) {
        twoFactorToggle.addEventListener('change', function() {
            qrContainer.style.display = this.checked ? 'block' : 'none';
        });
    }

    // Session Management
    const revokeButtons = document.querySelectorAll('.revoke-btn');
    revokeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sessionItem = this.closest('.session-item');
            if (confirm('Are you sure you want to revoke this session?')) {
                sessionItem.style.opacity = '0';
                setTimeout(() => {
                    sessionItem.remove();
                }, 300);
            }
        });
    });

    // API Key Management
    const showKeyButtons = document.querySelectorAll('.api-key-show');
    showKeyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const keyMask = this.previousElementSibling;
            const isHidden = keyMask.classList.contains('masked');
            
            if (isHidden) {
                keyMask.textContent = generateRandomKey();
                keyMask.classList.remove('masked');
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                
                // Auto-hide after 30 seconds
                setTimeout(() => {
                    keyMask.textContent = '••••••••••••••••••••••••••••••';
                    keyMask.classList.add('masked');
                    this.innerHTML = '<i class="fas fa-eye"></i>';
                }, 30000);
            } else {
                keyMask.textContent = '••••••••••••••••••••••••••••••';
                keyMask.classList.add('masked');
                this.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    });

    // Network Connection Toggles
    const networkToggles = document.querySelectorAll('.network-toggle');
    networkToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const networkCard = this.closest('.network-card');
            const statusIndicator = networkCard.querySelector('.status-indicator');
            const statusText = networkCard.querySelector('.status-text');
            
            if (this.checked) {
                statusIndicator.classList.remove('disconnected');
                statusIndicator.classList.add('connected');
                statusText.textContent = 'Connected';
            } else {
                statusIndicator.classList.remove('connected');
                statusIndicator.classList.add('disconnected');
                statusText.textContent = 'Disconnected';
            }
        });
    });

    // Gas Price Refresh
    const refreshGasBtn = document.querySelector('.refresh-btn');
    if (refreshGasBtn) {
        refreshGasBtn.addEventListener('click', function() {
            updateGasPrices();
        });
    }

    // Form Submissions
    const forms = document.querySelectorAll('.settings-form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Changes saved successfully!');
        });
    });
});

// Helper Functions
function applyTheme(theme) {
    const body = document.body;
    switch(theme) {
        case 'dark':
            body.classList.add('dark-theme');
            body.classList.remove('light-theme');
            break;
        case 'light':
            body.classList.add('light-theme');
            body.classList.remove('dark-theme');
            break;
        case 'system':
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                body.classList.add('dark-theme');
                body.classList.remove('light-theme');
            } else {
                body.classList.add('light-theme');
                body.classList.remove('dark-theme');
            }
            break;
    }
    showNotification(`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme applied`);
}

function updatePasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
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
        const element = document.getElementById(`req-${req}`);
        if (element) {
            const icon = element.querySelector('i');
            if (requirements[req]) {
                icon.className = 'fas fa-check-circle';
                element.style.color = '#28a745';
            } else {
                icon.className = 'fas fa-times-circle';
                element.style.color = '#dc3545';
            }
        }
    });
    
    // Calculate strength percentage
    const metRequirements = Object.values(requirements).filter(Boolean).length;
    const strengthPercentage = (metRequirements / 5) * 100;
    
    // Update strength bar
    strengthBar.style.width = `${strengthPercentage}%`;
    
    // Update strength class and text
    if (strengthPercentage <= 40) {
        strengthBar.className = 'strength-bar weak';
        strengthText.textContent = 'Weak password';
    } else if (strengthPercentage <= 80) {
        strengthBar.className = 'strength-bar medium';
        strengthText.textContent = 'Medium password';
    } else {
        strengthBar.className = 'strength-bar strong';
        strengthText.textContent = 'Strong password';
    }
}

function generateRandomKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 32; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
}

function updateGasPrices() {
    const prices = {
        slow: document.getElementById('slow-gas-price'),
        average: document.getElementById('average-gas-price'),
        fast: document.getElementById('fast-gas-price')
    };
    
    // Show loading state
    Object.values(prices).forEach(element => {
        element.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    });
    
    // Simulate API call delay
    setTimeout(() => {
        prices.slow.textContent = Math.floor(Math.random() * 30) + 20;
        prices.average.textContent = Math.floor(Math.random() * 50) + 40;
        prices.fast.textContent = Math.floor(Math.random() * 70) + 60;
    }, 1000);
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
} 