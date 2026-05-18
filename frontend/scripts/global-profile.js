// frontend/js/global-profile.js

async function loadGlobalProfilePicture() {
    const user = JSON.parse(localStorage.getItem("currentUserSession"));
    
    if (!user?.userId) {
        console.log('No user logged in');
        return;
    }
    
    // Wait a bit for the DOM to be fully ready
    setTimeout(async () => {
        // Find profile image - try multiple selectors
        let profileImg = document.querySelector('.profile-img');
        
        // If not found, try to find it in the right section
        if (!profileImg) {
            const rightSection = document.querySelector('.right-section');
            if (rightSection) {
                profileImg = rightSection.querySelector('img');
            }
        }
        
        if (!profileImg) {
            console.log('Profile image not found on this page');
            return;
        }
        
        try {
            const userType = user.userType || 'donor';
            const response = await fetch(`http://localhost:3000/get-profile-picture/${user.userId}/${userType}`);
            
            if (!response.ok) return;
            
            const data = await response.json();
            
            if (data.pictureUrl) {
                const newSrc = 'http://localhost:3000' + data.pictureUrl + '?t=' + Date.now();
                profileImg.src = newSrc;
                console.log('Profile picture updated on:', window.location.pathname);
            }
        } catch (error) {
            console.error('Failed to load profile picture:', error);
        }
    }, 100);
}

// Also listen for when the profile button is clicked and picture changes
function watchForProfilePictureChange() {
    // Listen for storage changes (when picture updates in another tab)
    window.addEventListener('storage', (e) => {
        if (e.key === 'currentUserSession' && e.newValue) {
            console.log('Session updated, reloading profile picture');
            loadGlobalProfilePicture();
        }
    });
    
    // Also check periodically for picture changes (for same tab)
    let lastPictureUrl = null;
    setInterval(() => {
        const user = JSON.parse(localStorage.getItem("currentUserSession"));
        if (user && user.profilePicture && user.profilePicture !== lastPictureUrl) {
            lastPictureUrl = user.profilePicture;
            loadGlobalProfilePicture();
        }
    }, 2000);
}

// Run when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadGlobalProfilePicture();
    watchForProfilePictureChange();
});