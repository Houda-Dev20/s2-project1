function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: ${type === 'success' ? '#4CAF50' : '#E8433A'};
        color: white;
        padding: 14px 24px;
        border-radius: 10px;
        font-family: Inter, sans-serif;
        font-size: 15px;
        z-index: 99999;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

const session = JSON.parse(localStorage.getItem('currentUserSession') || '{}');
const userId = session.userId;
const userType = session.userType;
const userEmail = session.userEmail;

document.addEventListener('DOMContentLoaded', () => {
    const checkbox = document.getElementById('consent');
    const passwordInput = document.getElementById('passwordInput');
    const deactivateBtn = document.getElementById('deactivateBtn');
    const modal = document.getElementById('confirmationModal');
    const cancelModalBtn = document.getElementById('cancelModal');
    const confirmDeleteBtn = document.querySelector('.btn-confirm-delete');

    function validateForm() {
        const isPasswordTyped = passwordInput.value.trim().length >= 8;
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
        const session = JSON.parse(localStorage.getItem('currentUserSession') || '{}');
        const userId = session.userId;
        const userType = session.userType;
        const userEmail = session.userEmail;

        if (!userId) {
showToast('Please login first', 'error');

modal.style.display = 'none';
            return;
        }

        const enteredPassword = passwordInput.value.trim();

        if (!enteredPassword) {
showToast('Please enter your password to confirm', 'error');
            return;
        }

        try {
            // 1. تحقق من الباسوورد
            const verifyUrl = userType === 'searcher'
                ? 'http://localhost:3000/searchers/login'
                : 'http://localhost:3000/donors/login';

            const verifyRes = await fetch(verifyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, password: enteredPassword })
            });

            const verifyData = await verifyRes.json();

            // ❌ باسوورد غلط — ابقى في الصفحة
            if (!verifyData.success) {
showToast('Incorrect password. Please try again.', 'error');
modal.style.display = 'none';
                return;
            }

            // ✅ باسوورد صح — دير deactivate
            const deactivateUrl = userType === 'searcher'
                ? `http://localhost:3000/searchers/deactivate/${userId}`
                : `http://localhost:3000/donors/deactivate/${userId}`;

            const response = await fetch(deactivateUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

if (response.ok) {
localStorage.clear();
showToast('Account deactivated successfully', 'success');
setTimeout(() => window.location.href = 'home.html', 1500);
} else {
showToast(data.message || 'Failed to deactivate account', 'error');
                modal.style.display = 'none';
            }

        } catch (error) {
            console.error('Error:', error);
showToast('Network error. Please try again.', 'error');
            modal.style.display = 'none';
        }
    });
});
