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

    // ✅ إذا كان remember me مفعل، نملأ الإيميل تلقائياً
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberCheckbox.checked = true;
    }

    // 👁 toggle password visibility
    eyeBtn.addEventListener("click", function () {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            eyeIcon.src = "images/Group.svg";
        } else {
            passwordInput.type = "password";
            eyeIcon.src = "images/basil_eye-closed-outline.svg";
        }
    });

    // popup logic
    openBtn.addEventListener("click", () => {
        modal.classList.add("open");
    });

    donor.addEventListener("click", () => {
        window.location.href = "donor-signup.html";
    });

    searcher.addEventListener("click", () => {
        window.location.href = "request-blood.html";
    });

    closeBtn.addEventListener("click", () => {
        modal.classList.remove("open");
    });

    // LOGIN
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        // ✅ remember me
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

// للـ donor
if (data.is_deactivated && data.userType === "donor") {
    const confirmReactivate = confirm("Your account is deactivated. Would you like to reactivate it?");
    if (confirmReactivate) {
        const res = await fetch(`http://localhost:3000/donors/active/${data.userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
            // سجّل الدخول تلقائياً بعد إعادة التفعيل
            localStorage.setItem("currentUserSession", JSON.stringify({
                userId: data.userId,
                userType: "donor",
                is_active: 1
            }));
            // اجلب بيانات المستخدم الكاملة
            const profileRes = await fetch(`http://localhost:3000/donors/profile/${data.userId}`);
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                localStorage.setItem("currentUserSession", JSON.stringify({
                    userId: data.userId,
                    userName: profileData.full_name,
                    userEmail: profileData.email,
                    userType: "donor",
                    is_active: 1
                }));
            }
            alert('Account reactivated successfully!');
            window.location.href = "donor-profile.html";
        } else {
            alert('Failed to reactivate account.');
        }
    }
    return;
}

if (data.success) {
    localStorage.setItem("currentUserSession", JSON.stringify({
        userId: data.donor.id,
        userName: data.donor.full_name,
        userEmail: data.donor.email,
        userType: "donor",
        is_active: 1
    }));
    window.location.href = "donor-profile.html";
    return;
}

            // جرب searcher
            response = await fetch("http://localhost:3000/searchers/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            data = await response.json();

if (data.is_deactivated && data.userType === "searcher") {
    const confirmReactivate = confirm("Your account is deactivated. Would you like to reactivate it?");
    if (confirmReactivate) {
        const res = await fetch(`http://localhost:3000/searchers/activate-searcher/${data.userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
            const profileRes = await fetch(`http://localhost:3000/searchers/profile/${data.userId}`);
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                localStorage.setItem("currentUserSession", JSON.stringify({
                    userId: data.userId,
                    userName: profileData.full_name,
                    userEmail: profileData.email,
                    userType: "searcher",
                    is_active: 1
                }));
            }
            alert('Account reactivated successfully!');
            window.location.href = "patient-profile.html";
        } else {
            alert('Failed to reactivate account.');
        }
    }
    return;
}

if (data.success) {
    localStorage.setItem("currentUserSession", JSON.stringify({
        userId: data.searcher.id,
        userName: data.searcher.full_name,
        userEmail: data.searcher.email,
        userType: "searcher",
        is_active: 1
    }));
    window.location.href = "patient-profile.html";
    return;
}

            alert("Invalid email or password");

        } catch (err) {
            console.error(err);
            alert("Server error");
        }
    });

});
