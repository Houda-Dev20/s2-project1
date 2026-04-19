const otpInputs = document.querySelectorAll('.otp-input');
const resendBtn = document.getElementById('resend-timer');
const verifyBtn = document.querySelector('#step2 .btn-main'); // زر التحقق في المرحلة 2


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
    if (verifyBtn) {
        verifyBtn.disabled = !isComplete;
    }
}

otpInputs.forEach((inp, i) => {
    inp.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !inp.value && i > 0) {
            otpInputs[i - 1].focus();
        }
    });

    inp.addEventListener('input', e => {
        const val = e.target.value.replace(/\D/g, '');
        inp.value = val ? val[val.length - 1] : '';
        
        if (inp.value && i < otpInputs.length - 1) {
            otpInputs[i + 1].focus();
        }
        
        updateVerifyButtonState(); 
    });

    inp.addEventListener('paste', e => {
        e.preventDefault();
        const data = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        
        [...data].slice(0, 6).forEach((ch, j) => {
            if (otpInputs[i + j]) {
                otpInputs[i + j].value = ch;
            }
        });
        updateVerifyButtonState();
        const nextIndex = Math.min(i + data.length, 5);
        otpInputs[nextIndex].focus();
    });

    inp.addEventListener('focus', () => inp.select());
});


function validateStep1() {
    const emailInput = document.getElementById('emailInput');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailInput.value)) {
        applyShake('input-wrapper'); 
    } else {
        document.getElementById('displayEmail').innerText = emailInput.value;
        showStep(2);
    }
}

function validateStep2() {
    let code = "";
    let complete = true;

    otpInputs.forEach(input => {
        code += input.value;
        if (!input.value) {
            complete = false;
            applyShake(input.id || 'otpBox'); 
        }
    });

    if (complete && code.length === 6) {
        showStep(3);
    }
}

function validateStep3() {
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
    alert("Done! Your password has been reset.");
}


let isTimerRunning = false;

function startTimer() {
    if (isTimerRunning) return;
    
    otpInputs.forEach(i => i.value = '');
    updateVerifyButtonState();
    otpInputs[0].focus();

    isTimerRunning = true;
    let sec = 60;
    const resendBtn = document.getElementById('resend-timer');
    resendBtn.classList.add('disabled');

    const timer = setInterval(() => {
        sec--;
        
        if (sec > 0) {
            let minutes = Math.floor(sec / 60);
            let seconds = sec % 60;
            let timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            
            resendBtn.innerHTML = `Resend code in <span>${timeFormatted}</span>`;
        } else {
            clearInterval(timer);
            resendBtn.innerHTML = "Resend code";
            resendBtn.classList.remove('disabled');
            isTimerRunning = false;
        }
    }, 1000);
}