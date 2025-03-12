// Authentication check for superuser dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is logged in
    function checkAdminAuth() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        
        if (!isLoggedIn) {
            // Not logged in, redirect to admin login page
            window.location.href = '../login/admin-login.html';
            return;
        }
        
        // Admin is logged in, update UI if needed
        const adminEmail = localStorage.getItem('adminEmail');
        updateAdminUI(adminEmail);
    }
    
    // Update UI with admin information
    function updateAdminUI(email) {
        // Update admin name in the UI if needed
        const userProfile = document.querySelector('.user-profile span');
        if (userProfile) {
            userProfile.textContent = email || 'Admin';
        }
    }
    
    // Setup logout functionality
    function setupLogout() {
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Clear admin session
                localStorage.removeItem('adminLoggedIn');
                localStorage.removeItem('adminEmail');
                localStorage.removeItem('adminLoginTime');
                
                // Redirect to login page
                window.location.href = '../login/admin-login.html';
            });
        }
    }
    
    // Check authentication on page load
    checkAdminAuth();
    
    // Setup logout functionality
    setupLogout();
}); 