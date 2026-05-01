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
            alert('Please login first');
            modal.style.display = 'none';
            return;
        }

        const enteredPassword = passwordInput.value.trim();

        if (!enteredPassword) {
            alert('Please enter your password to confirm');
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
                alert('Incorrect password. Please try again.');
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
                alert('Account deactivated successfully');
                localStorage.clear();
                window.location.href = 'home.html'; // ✅ يروح لـ home فقط إذا نجح
            } else {
                alert(data.message || 'Failed to deactivate account');
                modal.style.display = 'none';
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Network error. Please try again.');
            modal.style.display = 'none';
        }
    });
});
