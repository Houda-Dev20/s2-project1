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
// verificationCode.js - يدعم التسجيل الجديد وتغيير البريد الإلكتروني

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");           // "donor", "searcher", or "email-change"
    const email = params.get("email");
    const userId = params.get("userId");
    const role = params.get("role");           // "donor" or "searcher" when type=email-change

    let displayText = "";
    let isEmailChange = false;
    let actualUserId = null;
    let actualRole = null;

    if (type === "email-change" && userId && role) {
        // حالة تغيير البريد
        isEmailChange = true;
        actualUserId = userId;
        actualRole = role;   // "donor" أو "searcher"
        displayText = `Account ID: ${userId}`;
    } else if ((type === "donor" || type === "searcher") && email) {
        // حالة التسجيل الجديد
        isEmailChange = false;
        displayText = email;
    } else {
        // معاملات غير صالحة
        document.getElementById("user-email").innerText = "Invalid request";
        console.error("Invalid parameters:", { type, email, userId, role });
        return;
    }

    document.getElementById("user-email").innerText = displayText;

    // تخزين المتغيرات العامة
    window.verifyType = type;
    window.verifyEmail = email;
    window.isEmailChange = isEmailChange;
    window.emailChangeUserId = actualUserId;
    window.emailChangeRole = actualRole;
});

const inputs = document.querySelectorAll('.otp-input');
const verifyBtn = document.getElementById('verify-btn');
const resendBtn = document.getElementById('resend-btn');
const formView = document.getElementById('form-view');
const successView = document.getElementById('success-view');

let isResendTimerRunning = false;

// التنقل بين حقول OTP
inputs.forEach((inp, i) => {
    inp.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !inp.value && i > 0) {
            inputs[i - 1].focus();
            inputs[i - 1].value = '';
            inputs[i - 1].classList.remove('filled');
            updateBtn();
        }
    });

    inp.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 1) val = val[0];
        inp.value = val;
        inp.classList.toggle('filled', !!val);
        if (val && i < inputs.length - 1) inputs[i + 1].focus();
        updateBtn();
    });

    inp.addEventListener('paste', e => {
        e.preventDefault();
        const data = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        [...data].slice(0, 6).forEach((ch, j) => {
            if (inputs[i + j]) {
                inputs[i + j].value = ch;
                inputs[i + j].classList.add('filled');
            }
        });
        const next = Math.min(i + data.length, 5);
        inputs[next].focus();
        updateBtn();
    });

    inp.addEventListener('focus', () => inp.select());
});

function updateBtn() {
    const full = [...inputs].every(i => i.value);
    verifyBtn.disabled = !full;
}

// ── زر التحقق ──
verifyBtn.addEventListener('click', async function(e) {
    addRipple(e, this);
    const code = [...inputs].map(i => i.value).join('');

    verifyBtn.textContent = 'Verifying...';
    verifyBtn.disabled = true;

    try {
        const isEmailChange = window.isEmailChange;
        const userId = window.emailChangeUserId;
        const role = window.emailChangeRole;
        const email = window.verifyEmail;
        const type = window.verifyType;

        let url, body, response;

        if (isEmailChange && userId && role) {
            // حالة تغيير البريد
            url = `http://localhost:3000/${role}s/confirm-email-change/${userId}`;
            body = { verification_code: code };
            response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        } else if ((type === "donor" || type === "searcher") && email) {
            // حالة التسجيل الجديد
            url = `http://localhost:3000/${type}s/verify`;
            body = { email: email, verification_code: code };
            response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        } else {
            throw new Error("Invalid verification request. Please go back and try again.");
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Verification failed");
        }

        if (isEmailChange) {
            // نجاح تغيير البريد
showToast("✓ Email updated successfully! You will be redirected to your profile.", 'success');
            // تحديث البريد في localStorage إذا وجد
            const session = JSON.parse(localStorage.getItem("currentUserSession"));
            if (session && data.email) {
                session.userEmail = data.email;
                localStorage.setItem("currentUserSession", JSON.stringify(session));
            }
            setTimeout(() => {
                if (role === "donor") window.location.href = "donor-profile.html";
                else window.location.href = "patient-profile.html";
            }, 1500);
        } else {
            // نجاح التسجيل الجديد
            let userId, userName;
            if (type === "searcher") {
                userId = data.searcherId;
                userName = data.searcher.full_name;
            } else {
                userId = data.donorId;
                userName = data.donor.full_name;
            }

            localStorage.setItem("currentUserSession", JSON.stringify({
                userId: userId,
                userName: userName,
                userType: type,
                userEmail: email
            }));

            formView.style.display = 'none';
            successView.classList.add('show');

            setTimeout(() => {
                const redirect = (type === "searcher") ? "patient-profile.html" : "donor-profile.html";
                window.location.href = redirect;
            }, 2000);
        }
    } catch (err) {
showToast(err.message, 'error');
        verifyBtn.textContent = 'Verify';
        verifyBtn.disabled = false;
    }
});

function addRipple(e, btn) {
    const r = document.createElement('span');
    r.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
    btn.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
}

// ── إعادة إرسال الكود (للتسجيل فقط، لتغيير البريد نطلب من المستخدم العودة) ──
resendBtn.addEventListener('click', async () => {
    if (isResendTimerRunning) {
showToast(`Please wait ${resendBtn.textContent} before resending`, 'error');
        return;
    }

    const isEmailChange = window.isEmailChange;
    if (isEmailChange) {
showToast("For email change, please go back to your profile and request a new code again.", 'error');
        return;
    }

    const email = window.verifyEmail;
    const type = window.verifyType;

    if (!email || !type) {
showToast('Email not found. Please go back and try again.', 'error');
        return;
    }

    try {
        resendBtn.disabled = true;
        resendBtn.textContent = 'Sending...';

        const url = `http://localhost:3000/${type}s/resend-code`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();

        if (response.ok) {
showToast('✓ New verification code sent to your email', 'success');
            inputs.forEach(i => {
                i.value = '';
                i.classList.remove('filled');
            });
            inputs[0].focus();
            updateBtn();

            isResendTimerRunning = true;
            let sec = 60;
            resendBtn.textContent = `Resend (${sec}s)`;
            const timer = setInterval(() => {
                sec--;
                if (sec > 0) {
                    resendBtn.textContent = `Resend (${sec}s)`;
                } else {
                    clearInterval(timer);
                    resendBtn.textContent = 'Resend code';
                    resendBtn.disabled = false;
                    isResendTimerRunning = false;
                }
            }, 1000);
        } else {
showToast(data.message || 'Failed to resend code', 'error');
            resendBtn.textContent = 'Resend code';
            resendBtn.disabled = false;
        }
    } catch (error) {
        console.error('Resend error:', error);
showToast('Network error. Please try again.', 'error');
        resendBtn.textContent = 'Resend code';
        resendBtn.disabled = false;
    }
});

inputs[0].focus();