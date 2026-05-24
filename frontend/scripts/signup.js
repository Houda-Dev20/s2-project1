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
 
 
function selectBlood(element, value, inputId ) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById('dropdown');
    const arrow = document.querySelector('#arrow-icon');
    
    if (input) {
        input.value = value;
        console.log("Selected:", value); 
    } else {
        console.log("Input not found:", inputId);
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
const wilayaSelectDonor = document.getElementById("location");
const wilayaSelectSearcher = document.getElementById("location_s");

const wilayas = [
"Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Bejaia","Biskra","Bechar",
"Blida","Bouira","Tamanrasset","Tebessa","Tlemcen","Tiaret","Tizi Ouzou","Algiers",
"Djelfa","Jijel","Setif","Saida","Skikda","Sidi Bel Abbes","Annaba","Guelma",
"Constantine","Medea","Mostaganem","Msila","Mascara","Ouargla","Oran","El Bayadh",
"Illizi","Bordj Bou Arreridj","Boumerdes","El Tarf","Tindouf","Tissemsilt",
"El Oued","Khenchela","Souk Ahras","Tipaza","Mila","Ain Defla","Naama",
"Ain Temouchent","Ghardaia","Relizane",
"Timimoun","Bordj Badji Mokhtar","Ouled Djellal","Beni Abbes",
"In Salah","In Guezzam","Touggourt","Djanet","El M'Ghair","El Meniaa"
];


wilayas.forEach((w, index) => {
    let option1 = document.createElement("option");
    option1.value = index + 1;
    option1.textContent = w;

    let option2 = option1.cloneNode(true);

    if (wilayaSelectDonor) wilayaSelectDonor.appendChild(option1);
    if (wilayaSelectSearcher) wilayaSelectSearcher.appendChild(option2);
});

//api

const donorForm = document.getElementById("signupForm");
if (donorForm) {
    donorForm.addEventListener("submit", async function(e) {
        e.preventDefault();

    if (!document.getElementById("location").value) {
 showToast("Please select a location", 'error');
         return;
    }

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

        await sendData("http://localhost:3000/donors/register", donorData);
    });
}

const searcherForm = document.getElementById("signupFormSearcher");
if (searcherForm) {
    searcherForm.addEventListener("submit", async function(e) {
        e.preventDefault();

const loc = document.getElementById("location_s");

if (!loc || !loc.value) {
            showToast("Please select a location", 'error');
    return;
}

        const searcherData = {
            full_name: document.getElementById("full_name_s").value,
            date_of_birth: document.getElementById("date_of_birth_s").value,
            location: document.getElementById("location_s").value,
            blood_type_research: document.getElementById("bloodInput_s").value,
            telephon: document.getElementById("telephon_s").value,
            email: document.getElementById("email_s").value,
            password: document.getElementById("password_s").value
        };

        await sendData("http://localhost:3000/searchers/register", searcherData);
    });
}

async function sendData(url, dataObject) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataObject)
        });

        const text = await response.text(); 
        console.log("Server response:", text);

        const result = JSON.parse(text); 

        if (!response.ok) {
            throw new Error(result.message || `Server error: ${response.status}`);
        }

          showToast(result.message, 'success');

        if (result.id) {
        localStorage.setItem("currentUserSession", JSON.stringify({

        userId: result.id,
        userName: dataObject.full_name
    }));
}


        const type = url.includes("donors") ? "donor" : "searcher";

        setTimeout(() => {
            window.location.href = `verificationCode.html?email=${encodeURIComponent(dataObject.email)}&type=${type}`;
        }, 1500);
    } catch (error) {
        console.error("Error:", error);
 showToast(error.message || "Error connecting to server", 'error');
    }
}
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