
document.addEventListener("DOMContentLoaded", () => {
    const email = new URLSearchParams(window.location.search).get("email");
    if (email) {
        document.getElementById("displayEmail").innerText = email;
    }
});

const otpInputs = document.querySelectorAll('.otp-input');
const verifyBtn = document.querySelector('#step2 .btn-main');
const resendBtn = document.getElementById('resend-timer');
const API_BASE = 'http://localhost:3000';

let isTimerRunning = false;
let currentEmail = '';
let currentOtp = '';

function showStep(step) {
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step' + step).classList.add('active');
    if(step === 2) {
        updateVerifyButtonState();
        setTimeout(() => otpInputs[0].focus(), 100);
    }
}

function applyShake(id) {
    const el = document.getElementById(id);
    if(el) {
        el.classList.add('error-shake');
        setTimeout(() => el.classList.remove('error-shake'), 400);
    }
}

function updateVerifyButtonState() {
    const isComplete = Array.from(otpInputs).every(input => input.value.length === 1);
    if (verifyBtn) verifyBtn.disabled = !isComplete;
}

// OTP Inputs
otpInputs.forEach((inp, i) => {
    inp.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !inp.value && i > 0) {
            otpInputs[i - 1].focus();
            otpInputs[i - 1].value = '';
            updateVerifyButtonState();
        }
    });

    inp.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 1) val = val[0];
        inp.value = val;
        if (val && i < otpInputs.length - 1) otpInputs[i + 1].focus();
        updateVerifyButtonState();
    });

    inp.addEventListener('paste', e => {
        e.preventDefault();
        const data = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        [...data].slice(0, 6).forEach((ch, j) => {
            if (otpInputs[i + j]) otpInputs[i + j].value = ch;
        });
        const nextIndex = Math.min(i + data.length, 5);
        otpInputs[nextIndex].focus();
        updateVerifyButtonState();
    });

    inp.addEventListener('focus', () => inp.select());
});

async function validateStep1() {
    const emailInput = document.getElementById('emailInput');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailInput.value)) {
        applyShake('input-wrapper');
        return;
    }

    const btn = document.querySelector('#step1 .btn-main');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
        const response = await fetch(`${API_BASE}/donors/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailInput.value })
        });

        const data = await response.json();

        if (response.ok) {
            currentEmail = emailInput.value;
            document.getElementById('displayEmail').innerText = emailInput.value;
            showStep(2);
            startTimer();
        } else {
            alert(data.message || 'Email not found');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Send Reset Code';
    }
}

async function validateStep2() {
    let code = "";
    let complete = true;

    otpInputs.forEach(input => {
        code += input.value;
        if (!input.value) complete = false;
    });

    if (!complete || code.length !== 6) {
        alert('Please enter the 6-digit code');
        return;
    }

    const btn = document.querySelector('#step2 .btn-main');
    btn.disabled = true;
    btn.textContent = 'Verifying...';

    try {
        const response = await fetch(`${API_BASE}/donors/verify-reset-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentEmail, otp: code })
        });

        if (response.ok) {
            currentOtp = code;
            showStep(3);
        } else {
            const data = await response.json();
            alert(data.message || 'Invalid code');
            otpInputs.forEach(i => i.value = '');
            otpInputs[0].focus();
            updateVerifyButtonState();
        }
    } catch (error) {
        alert('Network error. Please try again.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Verify code';
    }
}

async function validateStep3() {
    const pass = document.getElementById('newPass');
    const confirm = document.getElementById('confirmPass');

    if (pass.value.length < 8) {
        applyShake('input-wrapper1');
        return;
    }
    if (confirm.value !== pass.value || confirm.value === "") {
        applyShake('input-wrapper2');
        return;
    }

    const btn = document.querySelector('#step3 .btn-main');
    btn.disabled = true;
    btn.textContent = 'Resetting...';

    try {
        const response = await fetch(`${API_BASE}/donors/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentEmail, otp: currentOtp, newPassword: pass.value })
        });

        if (response.ok) {
            alert('Password reset successfully! You can now login.');
            window.location.href = 'logIn.html';
        } else {
            const data = await response.json();
            alert(data.message || 'Something went wrong');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Reset password';
    }
}

function startTimer() {
    if (isTimerRunning) return;
    
    otpInputs.forEach(i => i.value = '');
    updateVerifyButtonState();
    otpInputs[0].focus();

    isTimerRunning = true;
    let sec = 60;
    resendBtn.classList.add('disabled');

    const timer = setInterval(() => {
        sec--;
        if (sec > 0) {
            let minutes = Math.floor(sec / 60);
            let seconds = sec % 60;
            resendBtn.innerHTML = `Resend code in <span>${minutes}:${seconds < 10 ? '0' : ''}${seconds}</span>`;
        } else {
            clearInterval(timer);
            resendBtn.innerHTML = "Resend code";
            resendBtn.classList.remove('disabled');
            isTimerRunning = false;
        }
    }, 1000);
}


resendBtn.addEventListener('click', async function() {
    if (isTimerRunning) return;
    
    if (!currentEmail) {
        alert('Please enter your email first');
        return;
    }
    
    try {
        resendBtn.textContent = 'Sending...';
        
        const response = await fetch(`${API_BASE}/donors/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentEmail })
        });
        
        const data = await response.json();

        if (response.ok) {
            alert('✓ New code sent to your email');
            
            otpInputs.forEach(i => i.value = '');
            updateVerifyButtonState();
            otpInputs[0].focus();

            isTimerRunning = true;
            let sec = 60;
            resendBtn.classList.add('disabled');

            const timer = setInterval(() => {
                sec--;
                if (sec > 0) {
                    let minutes = Math.floor(sec / 60);
                    let seconds = sec % 60;
                    resendBtn.innerHTML = `Resend code in <span>${minutes}:${seconds < 10 ? '0' : ''}${seconds}</span>`;
                } else {
                    clearInterval(timer);
                    resendBtn.innerHTML = "Resend code";
                    resendBtn.classList.remove('disabled');
                    isTimerRunning = false;
                }
            }, 1000);
        } else {
            alert(data.message || 'Failed to resend code');
            resendBtn.innerHTML = "Resend code";
        }

    } catch (error) {
        alert('Network error. Please try again.');
        resendBtn.innerHTML = "Resend code";
    }
});

otpInputs[0].focus();