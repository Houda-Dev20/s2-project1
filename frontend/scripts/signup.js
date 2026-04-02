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
    const input = document.getElementById('bloodInput_s');
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

const donorForm = document.getElementById("signupForm");
if (donorForm) {
    donorForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        const donorData = {
            full_name: document.getElementById("full_name").value,
            date_of_birth: document.getElementById("date_of_birth").value,
            location: document.getElementById("location").value,
            blood_type: document.getElementById("bloodInput").value,
            telephon: document.getElementById("telephon").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            available: true
        };

        await sendData("http://localhost:3000/donors/add", donorData);
    });
}

const searcherForm = document.getElementById("signupFormSearcher");
if (searcherForm) {
    searcherForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        const searcherData = {
            full_name: document.getElementById("full_name_s").value,
            date_of_birth: document.getElementById("date_of_birth_s").value,
            location: document.getElementById("location_s").value,
            blood_type: document.getElementById("bloodInput_s").value,
            telephon: document.getElementById("telephon_s").value,
            email: document.getElementById("email_s").value,
            password: document.getElementById("password_s").value
        };

        await sendData("http://localhost:3000/searchers/add", searcherData);
    });
}

async function sendData(url, dataObject) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataObject)
        });

        const result = await response.json();
        alert(result.message);
        
    } catch (error) {
        console.error("Error:", error);
        alert("error connecting to server");
    }
}