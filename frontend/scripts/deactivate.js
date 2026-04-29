document.addEventListener('DOMContentLoaded', () => {
    const checkbox = document.getElementById('consent');
    const passwordInput = document.getElementById('passwordInput');
    const deactivateBtn = document.getElementById('deactivateBtn');

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

    // Listen for typing in the password field
    passwordInput.addEventListener('input', validateForm);

    // Listen for clicks on the checkbox
    checkbox.addEventListener('change', validateForm);
});
document.addEventListener('DOMContentLoaded', () => {
    const mainDeactivateBtn = document.getElementById('deactivateBtn');
    const modal = document.getElementById('confirmationModal');
    const cancelModalBtn = document.getElementById('cancelModal');
    const confirmDeleteBtn = document.querySelector('.btn-confirm-delete');

    // SHOW MODAL: Only works if button is enabled (checked & password typed)
    mainDeactivateBtn.addEventListener('click', () => {
        if (!mainDeactivateBtn.disabled) {
            modal.style.display = 'flex';
        }
    });

    // HIDE MODAL: When "Keep Account" is clicked
    cancelModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // CLOSE MODAL: When clicking outside the white card
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

  
   
});

//api
document.addEventListener('DOMContentLoaded', () => {
    // 1. تعريف العناصر من HTML
    const passwordInput = document.getElementById('passwordInput');
    const consentCheckbox = document.getElementById('consent');
    const deactivateBtn = document.getElementById('deactivateBtn');
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmDeleteBtn = document.querySelector('.btn-confirm-delete');
    const cancelModalBtn = document.getElementById('cancelModal');

    // 2. تفعيل زر التعطيل عند الموافقة على الشروط
    consentCheckbox.addEventListener('change', () => {
        deactivateBtn.disabled = !consentCheckbox.checked;
    });

    // 3. إظهار نافذة التأكيد (Modal)
    deactivateBtn.addEventListener('click', () => {
        if (!passwordInput.value) {
            alert("Please enter your password first.");
            return;
        }
        confirmationModal.style.display = 'flex';
    });

    // 4. إغلاق النافذة عند الإلغاء
    cancelModalBtn.addEventListener('click', () => {
        confirmationModal.style.display = 'none';
    });

    // 5. عملية الربط الفعلي باستخدام PUT
    confirmDeleteBtn.addEventListener('click', async () => {
        const userId = localStorage.getItem('userId'); 
        const token = localStorage.getItem('token');

        try {
            // الرابط المعتمد على PUT في ملف donorRoutes.js
            const apiUrl = `http://localhost:5000/api/donors/deactivate/${userId}`;

            const response = await fetch(apiUrl, {
                method: 'PUT', // تغيير الطريقة إلى PUT كما طلبتِ
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    password: passwordInput.value
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert("Account deactivated successfully.");
                localStorage.clear(); 
                window.location.href = "home.html"; 
            } else {
                alert(result.message || "Failed to deactivate account.");
            }
        } catch (error) {
            console.error("Connection Error:", error);
            alert("Could not connect to the server.");
        }
    });
});
