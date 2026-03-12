document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.querySelector('input[type="password"]');
    const toggleEye = document.getElementById('toggleEye');

    const eyeOpen = "images/Group.svg";    
    const eyeClosed = "images/basil_eye-closed-outline.svg"; 
    if (toggleEye && passwordInput) {
        toggleEye.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleEye.src = eyeOpen;    
            } else {
                passwordInput.type = 'password';
                toggleEye.src = eyeClosed;    
            }
        });
    }
});

function toggleDropdown() {
    const dropdown = document.getElementById('dropdown');
    const arrow = document.querySelector('#arrow-icon');
    
    const isOpen = dropdown.style.display === "block";
    
    if (isOpen) {
        dropdown.style.display = "none";
        if (arrow) arrow.style.transform = "rotate(0deg)";
    } else {
        dropdown.style.display = "block";
        if (arrow) arrow.style.transform = "rotate(180deg)";
    }
}
 
 
function selectBlood(element, value) {
    const input = document.getElementById('bloodInput');
    const dropdown = document.getElementById('dropdown');
    const arrow = document.querySelector('#arrow-icon');
    
    if (input) {
        input.value = value;
    }

    const allCells = document.querySelectorAll('.dropdown td');
    allCells.forEach(td => td.classList.remove('selected'));
    element.classList.add('selected');

    if (dropdown) dropdown.style.display = "none";
    if (arrow) arrow.style.transform = "rotate(0deg)";
}


window.onclick = function(event) {
    const dropdown = document.getElementById('dropdown');
    const arrow = document.querySelector('#arrow-icon');
    const container = document.querySelector('.container-dropdown-simple');

    if (container && !container.contains(event.target)) {
        if (dropdown) {
            dropdown.style.display = "none";
        }
        if (arrow) {
            arrow.style.transform = "rotate(0deg)";
        }
    }
};

//api

document.getElementById("signupForm").addEventListener("submit", async function(e){

e.preventDefault();

const donor = {
full_name: document.getElementById("full_name").value,
date_of_birth: document.getElementById("date_of_birth").value,
location: document.getElementById("location").value,
blood_type: document.getElementById("bloodInput").value,
telephon: document.getElementById("telephon").value,
email: document.getElementById("email").value,
password: document.getElementById("password").value,
available: true
};

const response = await fetch("http://localhost:3000/donors/add",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(donor)
});

const data = await response.json();

alert(data.message);

});