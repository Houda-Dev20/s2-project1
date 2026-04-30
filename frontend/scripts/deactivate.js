document.addEventListener('DOMContentLoaded', () => {
    const checkbox = document.getElementById('consent');
    const passwordInput = document.getElementById('passwordInput');
    const deactivateBtn = document.getElementById('deactivateBtn');
    const modal = document.getElementById('confirmationModal');
    const cancelModalBtn = document.getElementById('cancelModal');
    const confirmDeleteBtn = document.querySelector('.btn-confirm-delete');

    function validateForm() {
        const isPasswordTyped = passwordInput.value.trim().length >=8;
        const isCheckboxChecked = checkbox.checked;

        if (isPasswordTyped && isCheckboxChecked) {
            deactivateBtn.disabled = false;
            deactivateBtn.classList.add('active');
        } else {
            deactivateBtn.disabled = true;
            deactivateBtn.classList.remove('active');
        }
    }

    passwordInput.addEventListener('input', validateForm);
    checkbox.addEventListener('change', validateForm);

    deactivateBtn.addEventListener('click', () => {
        if (!deactivateBtn.disabled) {
            modal.style.display = 'flex';
        }
    });

    cancelModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        let donorId = localStorage.getItem('donorId');
        
        if (!donorId) {
            const session = JSON.parse(localStorage.getItem('currentUserSession') || '{}');
            donorId = session.userId;
        }
        
        if (!donorId) {
            alert('Please login first');
            modal.style.display = 'none';
            return;
        }
        
        const enteredPassword = passwordInput.value.trim();
        
        if (!enteredPassword) {
            alert('Please enter your password to confirm');
            modal.style.display = 'none';
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:3000/donors/deactivate/${donorId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Account deactivated successfully');
                localStorage.clear();
                window.location.href = 'login.html';
            } else {
                alert(data.message || 'Failed to deactivate account');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Network error. Please try again.');
        }
        
        modal.style.display = 'none';
    });
});