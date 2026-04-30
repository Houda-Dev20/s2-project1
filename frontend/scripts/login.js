document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("login-form");

<<<<<<< HEAD
const eyeBtn=document.getElementById("eye-btn");
const eyeIcon = document.getElementById("eye-icon");
const passwordInput = document.getElementById('password-input');
eyeBtn.addEventListener('click',function(){
     if(passwordInput.type === 'password'){
          passwordInput.type='text';
          eyeIcon.src='images/Group.svg'
     }else {
           passwordInput.type = 'password';
           eyeIcon.src ="images/basil_eye-closed-outline.svg"
     }
});
const openBtn =document.getElementById("join");
const donor =document.getElementById("closeModal1");
const searcher =document.getElementById("closeModal2");
const modal =document.getElementById("modal");
const closeBtn=document.getElementById("closeModel");

openBtn.addEventListener("click",()=>{
 modal.classList.add("open");
});
donor.addEventListener("click", () => {
    window.location.href = "donor-signup.html"; 
});
searcher.addEventListener("click", () => {
    window.location.href = "request-blood.html"; 
});
closeBtn.addEventListener("click",()=>{
 modal.classList.remove("open");
});

const form = document.getElementById("login-form");

form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password-input").value;

    try {

        let response = await fetch("http://localhost:3000/donors/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        let data = await response.json();

        if (data.success) {
            localStorage.setItem("currentUserSession", JSON.stringify({
                userId: data.donor.id,
                userName: data.donor.full_name,
                userType: "donor"
            }));
            alert("Login successful (donor)");
            window.location.href = "donor-profile.html";
            return;
        }

        response = await fetch("http://localhost:3000/searchers/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        data = await response.json();

        if (data.success) {
            localStorage.setItem("currentUserSession", JSON.stringify({
                userId: data.searcher.id,
                userName: data.searcher.full_name,
                userType: "searcher"
            }));
            alert("Login successful (searcher)");
            window.location.href = "patient-profile.html";
        } else {
            alert("Invalid email or password");
=======
    const eyeBtn = document.getElementById("eye-btn");
    const eyeIcon = document.getElementById("eye-icon");
    const passwordInput = document.getElementById("password-input");

    // 👁 toggle password visibility
    eyeBtn.addEventListener("click", function () {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            eyeIcon.src = "images/Group.svg";
        } else {
            passwordInput.type = "password";
            eyeIcon.src = "images/basil_eye-closed-outline.svg";
>>>>>>> fec63f1219b24b90e943cda1ba90e2614902c1d0
        }
    });

    // popup logic
    const openBtn = document.getElementById("join");
    const donor = document.getElementById("closeModal1");
    const searcher = document.getElementById("closeModal2");
    const modal = document.getElementById("modal");
    const closeBtn = document.getElementById("closeModel");

    openBtn.addEventListener("click", () => {
        modal.classList.add("open");
    });

    donor.addEventListener("click", () => {
        window.location.href = "http://127.0.0.1:5500/donor-signup.html";
    });

    searcher.addEventListener("click", () => {
        window.location.href = "http://127.0.0.1:5500/request-blood.html";
    });

    closeBtn.addEventListener("click", () => {
        modal.classList.remove("open");
    });

    // =========================
    // LOGIN API (FIXED)
    // =========================
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = passwordInput.value;

        try {
            const response = await fetch("http://localhost:3000/searchers/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                // ✅ save token (ONLY if backend sends it)
                if (data.token) {
                    localStorage.setItem("token", data.token);
                }

                // save user
                localStorage.setItem("user", JSON.stringify(data.searcher));

                alert("Login successful");

                // optional redirect
                // window.location.href = "home.html";

            } else {
                alert(data.message || "Invalid email or password");
            }

        } catch (err) {
            console.error(err);
            alert("Server error");
        }
    });

});
