document.addEventListener("DOMContentLoaded", () => {

    // عناصر DOM
    const eyeBtn = document.getElementById("eye-btn");
    const eyeIcon = document.getElementById("eye-icon");
    const passwordInput = document.getElementById("password-input");
    const form = document.getElementById("login-form");

    // إظهار/إخفاء كلمة المرور
    if (eyeBtn && eyeIcon && passwordInput) {
        eyeBtn.addEventListener("click", function () {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                eyeIcon.src = "images/Group.svg";
            } else {
                passwordInput.type = "password";
                eyeIcon.src = "images/basil_eye-closed-outline.svg";
            }
        });
    }

    // منطق النافذة المنبثقة (popup)
    const openBtn = document.getElementById("join");
    const donorBtn = document.getElementById("closeModal1");
    const searcherBtn = document.getElementById("closeModal2");
    const modal = document.getElementById("modal");
    const closeBtn = document.getElementById("closeModel");

    if (openBtn) {
        openBtn.addEventListener("click", () => modal.classList.add("open"));
    }
    if (donorBtn) {
        donorBtn.addEventListener("click", () => window.location.href = "donor-signup.html");
    }
    if (searcherBtn) {
        searcherBtn.addEventListener("click", () => window.location.href = "request-blood.html");
    }
    if (closeBtn) {
        closeBtn.addEventListener("click", () => modal.classList.remove("open"));
    }

    // ------------------- منطق تسجيل الدخول -------------------
    if (!form) return;

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = passwordInput?.value || "";

        // 1) محاولة تسجيل الدخول كمتبرع
        try {
            let response = await fetch("http://localhost:3000/donors/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            let data = await response.json();

            if (data.success) {
                localStorage.setItem("currentUserSession", JSON.stringify({
                    userId: data.donor.id,
                    userName: data.donor.full_name,
                    userType: "donor"
                }));
                alert("تم تسجيل الدخول كمتبرع بنجاح");
                window.location.href = "donor-profile.html";
                return;
            }
        } catch (err) { /* لا شيء، جرب المحتاج */ }

        // 2) محاولة تسجيل الدخول كمحتاج
        try {
            let response = await fetch("http://localhost:3000/searchers/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            let data = await response.json();

            if (data.success) {
                localStorage.setItem("currentUserSession", JSON.stringify({
                    userId: data.searcher.id,
                    userName: data.searcher.full_name,
                    userType: "searcher"
                }));
                alert("تم تسجيل الدخول كمحتاج بنجاح");
                window.location.href = "patient-profile.html";
                return;
            }
        } catch (err) { /* فشل */ }

        alert("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    });
});
