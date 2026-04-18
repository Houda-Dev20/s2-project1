document.addEventListener('DOMContentLoaded', () => {
    const checkbox = document.getElementById('consent');
    const passwordInput = document.getElementById('passwordInput');
    const deactivateBtn = document.getElementById('deactivateBtn');

    function validateForm() {
        const isPasswordTyped = passwordInput.value.trim().length > 0;
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
