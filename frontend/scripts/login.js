document.addEventListener("DOMContentLoaded", () => {

    const eyeBtn = document.getElementById("eye-btn");
    const eyeIcon = document.getElementById("eye-icon");
    const passwordInput = document.getElementById("password-input");
    const emailInput = document.getElementById("email");
    const rememberCheckbox = document.querySelector(".remember-checkbox");
    const openBtn = document.getElementById("join");
    const donor = document.getElementById("closeModal1");
    const searcher = document.getElementById("closeModal2");
    const modal = document.getElementById("modal");
    const closeBtn = document.getElementById("closeModel");
    const form = document.getElementById("login-form");

    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberCheckbox.checked = true;
    }

    eyeBtn.addEventListener("click", function () {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            eyeIcon.src = "images/Group.svg";
        } else {
            passwordInput.type = "password";
            eyeIcon.src = "images/basil_eye-closed-outline.svg";
        }
    });

    openBtn.addEventListener("click", () => { modal.classList.add("open"); });
    donor.addEventListener("click", () => { window.location.href = "donor-signup.html"; });
    searcher.addEventListener("click", () => { window.location.href = "request-blood.html"; });
    closeBtn.addEventListener("click", () => { modal.classList.remove("open"); });

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;

    if (rememberCheckbox.checked) {
        localStorage.setItem("rememberedEmail", email);
    } else {
        localStorage.removeItem("rememberedEmail");
    }

    try {
        // جرب donor أولاً
        let response = await fetch("http://localhost:3000/donors/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        let data = await response.json();

        // إذا الإيميل موجود عند donor (سواء نجح أو فشل الباسوورد)
        if (response.status !== 404) {
            // هو donor — تعامل معه كـ donor فقط
            if (data.is_deactivated && data.userType === "donor") {
                showConfirm("Your account is deactivated. Would you like to reactivate it?", async () => {
                    const res = await fetch(`http://localhost:3000/donors/active/${data.userId}`, {
                        method: 'PUT', headers: { 'Content-Type': 'application/json' }
                    });
                    if (res.ok) {
                        const profileRes = await fetch(`http://localhost:3000/donors/profile/${data.userId}`);
                        if (profileRes.ok) {
                            const profileData = await profileRes.json();
                            localStorage.setItem("currentUserSession", JSON.stringify({
                                userId: data.userId, userName: profileData.full_name,
                                userEmail: profileData.email, userType: "donor", is_active: 1
                            }));
                        }
                        showToast('Account reactivated successfully!', 'success');
                        setTimeout(() => { window.location.href = "donor-profile.html"; }, 1500);
                    } else {
                        showToast('Failed to reactivate account.', 'error');
                    }
                });
                return;
            }
            if (data.success) {
                localStorage.setItem("currentUserSession", JSON.stringify({
                    userId: data.donor.id, userName: data.donor.full_name,
                    userEmail: data.donor.email, userType: "donor", is_active: 1
                }));
                window.location.href = "donor-profile.html";
                return;
            }
            // إيميل صح لكن باسوورد غلط
            showToast("Invalid email or password", 'error');
            return;
        }

        // إيميل مش موجود عند donor — جرب searcher
        response = await fetch("http://localhost:3000/searchers/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        data = await response.json();

        if (response.status !== 404) {
            // هو searcher
            if (data.is_deactivated && data.userType === "searcher") {
                showConfirm("Your account is deactivated. Would you like to reactivate it?", async () => {
                    const res = await fetch(`http://localhost:3000/searchers/activate-searcher/${data.userId}`, {
                        method: 'PUT', headers: { 'Content-Type': 'application/json' }
                    });
                    if (res.ok) {
                        const profileRes = await fetch(`http://localhost:3000/searchers/profile/${data.userId}`);
                        if (profileRes.ok) {
                            const profileData = await profileRes.json();
                            localStorage.setItem("currentUserSession", JSON.stringify({
                                userId: data.userId, userName: profileData.full_name,
                                userEmail: profileData.email, userType: "searcher", is_active: 1
                            }));
                        }
                        showToast('Account reactivated successfully!', 'success');
                        setTimeout(() => { window.location.href = "patient-profile.html"; }, 1500);
                    } else {
                        showToast('Failed to reactivate account.', 'error');
                    }
                });
                return;
            }
            if (data.success) {
                localStorage.setItem("currentUserSession", JSON.stringify({
                    userId: data.searcher.id, userName: data.searcher.full_name,
                    userEmail: data.searcher.email, userType: "searcher", is_active: 1
                }));
                window.location.href = "patient-profile.html";
                return;
            }
            showToast("Invalid email or password", 'error');
            return;
        }

        // مش موجود في أي جدول
        showToast("No account found with this email", 'error');

    } catch (err) {
        console.error(err);
        showToast("Server error", 'error');
    }
});
});

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed; bottom: 30px; right: 30px;
        background: ${type === 'success' ? '#4CAF50' : '#E8433A'};
        color: white; padding: 14px 24px; border-radius: 10px;
        font-family: Inter, sans-serif; font-size: 15px;
        z-index: 99999; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showConfirm(message, onConfirm) {
    const existing = document.getElementById('confirmOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'confirmOverlay';
    overlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.4);
        display: flex; align-items: center; justify-content: center;
        z-index: 999999;
    `;
    overlay.innerHTML = `
        <div style="background: white; border-radius: 16px; padding: 32px 28px;
            width: 320px; text-align: center; box-shadow: 0 8px 30px rgba(0,0,0,0.15);
            font-family: Inter, sans-serif;">
            <p style="font-size: 16px; color: #333; margin-bottom: 24px;">${message}</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button id="confirmNo" style="padding: 10px 28px; border-radius: 8px;
                    border: 1px solid #ddd; background: white; color: #555;
                    cursor: pointer; font-size: 14px;">Cancel</button>
                <button id="confirmYes" style="padding: 10px 28px; border-radius: 8px;
                    border: none; background: #E8433A; color: white;
                    cursor: pointer; font-size: 14px;">Confirm</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('confirmYes').onclick = () => { overlay.remove(); onConfirm(); };
    document.getElementById('confirmNo').onclick = () => { overlay.remove(); };
}