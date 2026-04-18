document.addEventListener('DOMContentLoaded', function() {
    // 1. Get the unified data from localStorage
    const dataString = localStorage.getItem('currentUserSession');
    
   

    const userData = JSON.parse(dataString);

    // 2. Select the UI elements on the Log Out page
    const nameDisplay = document.querySelector('.user-name');
    const emailDisplay = document.querySelector('.user-email');
    const badgeDisplay = document.querySelector('.donor-badge span');
    const avatarContainer = document.querySelector('.avatar-inner');

    // 3. Update Text Content
    if (nameDisplay) nameDisplay.innerText = userData.userName || "User";
    if (emailDisplay) emailDisplay.innerText = userData.userEmail || "No email provided";
    
    // Update Badge (e.g., "O+ Donor")
    if (badgeDisplay && userData.userBlood) {
        badgeDisplay.innerText = `${userData.userBlood} Donor`;
    }

    // 4. Handle Avatar (Image vs. Initials)
    if (avatarContainer) {
        // Check if the picture is a custom upload (not the default Ellipse image)
        const hasCustomPhoto = userData.userPic && 
                               !userData.userPic.includes('Ellipse') && 
                               userData.userPic.startsWith('blob:'); // blob indicates a recent upload

        if (hasCustomPhoto) {
            avatarContainer.innerHTML = `
                <img src="${userData.userPic}" 
                     style="width:100%; height:100%; border-radius:50%; object-fit:cover;" 
                     alt="Profile">`;
        } else if (userData.userName) {
            // Fallback: Generate Initials
            const initials = userData.userName
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase();
            avatarContainer.innerText = initials;
            avatarContainer.style.display = 'flex';
            avatarContainer.style.alignItems = 'center';
            avatarContainer.style.justifyContent = 'center';
        }
    }
});
