document.addEventListener("DOMContentLoaded", () => {

const google=document.getElementById("google");
google.addEventListener("click", () => {
     window.location.href = ""
});

const eyeBtn=document.getElementById("eye-btn");
const eyeIcon = document.getElementById("eye-icon");
const passwordInput = document.getElementById('password-input');
eyeBtn.addEventListener('click',function(){
     if(passwordInput.type === 'password'){
          passwordInput.type='text';//so the default eye won't appear and when it changes to text it will be visible
          eyeIcon.src='images/Group.svg'
     }else {
           passwordInput.type = 'password';
           eyeIcon.src ="images/basil_eye-closed-outline.svg"
     }
});
const openBtn =document.getElementById("join");//to get join btn in login page
const donor =document.getElementById("closeModal1");//to get donor btn in popup page
const searcher =document.getElementById("closeModal2");//to get searcher btn in popup page
const modal =document.getElementById("modal");//to get popup id in popup page
const closeBtn=document.getElementById("closeModel");//to get cross btn in popup

openBtn.addEventListener("click",()=>{
 modal.classList.add("open");
});
donor.addEventListener("click", () => {
    window.location.href = "http://127.0.0.1:5500/donor-signup.html"; 
});
searcher.addEventListener("click", () => {
    window.location.href = "http://127.0.0.1:5500/request-blood.html"; 
});
closeBtn.addEventListener("click",()=>{
 modal.classList.remove("open");
});

//api
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
            localStorage.setItem("user", JSON.stringify(data.donor));
            alert("Login successful (donor)");
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
            localStorage.setItem("user", JSON.stringify(data.searcher));
            alert("Login successful (searcher)");
        } else {
                    console.log(err);
            alert("Invalid email or password");
        }

    } catch (err) {
        console.log(err);
        alert("Server error");
    }
}); 

});