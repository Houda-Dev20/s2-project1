document.addEventListener('DOMContentLoaded', () => {
    const notifBtn = document.getElementById('notifBtn');
    const notifDropdown = document.getElementById('notifDropdown');
    const modal = document.getElementById('notifModal');
    const closeModal = document.getElementById('closeModal');

    // Toggle Notification Dropdown
    notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    window.addEventListener('click', () => {
        notifDropdown.classList.remove('active');
    });

    // Mockup trigger for the Donor Match Modal 
    // (In production, this would be triggered by a real-time event/socket)
    const triggerModalSample = () => {
        modal.style.display = 'flex';
    };

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Mark as Read functionality
    const markReadBtn = document.getElementById('markReadBtn');
    const badge = document.getElementById('notifBadge');
    
    markReadBtn.addEventListener('click', () => {
        badge.style.display = 'none';
        document.getElementById('notifList').innerHTML = '';
        document.getElementById('emptyState').style.display = 'block';
    });
});