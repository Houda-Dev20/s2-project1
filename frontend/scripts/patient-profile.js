let currentProfileData = {};

const wilayas = [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Bejaia", "Biskra", "Bechar",
    "Blida", "Bouira", "Tamanrasset", "Tebessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers",
    "Djelfa", "Jijel", "Setif", "Saida", "Skikda", "Sidi Bel Abbes", "Annaba", "Guelma",
    "Constantine", "Medea", "Mostaganem", "Msila", "Mascara", "Ouargla", "Oran", "El Bayadh",
    "Illizi", "Bordj Bou Arreridj", "Boumerdes", "El Tarf", "Tindouf", "Tissemsilt",
    "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Ain Defla", "Naama",
    "Ain Temouchent", "Ghardaia", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal",
    "Beni Abbes", "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"
];

function getWilayaNameById(id) {
    if (!id) return "Unknown";
    const index = parseInt(id) - 1;
    return (index >= 0 && index < wilayas.length) ? wilayas[index] : "Unknown";
}

async function loadSearcherProfile() {
    const user = JSON.parse(localStorage.getItem("currentUserSession"));
    if (!user?.userId) {
        console.error("No user session");
        alert("Please log in again.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/searchers/profile/${user.userId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                console.error("User not found");
                alert("User not found. Please log in again.");
                localStorage.removeItem("currentUserSession");
                window.location.href = "login.html";
                return;
            }
            throw new Error(`HTTP ${response.status}`);
        }
        
        const text = await response.text();
        if (!text || text.trim() === "") {
            console.error("Empty response from server");
            alert("Server returned empty response. Please try again later.");
            return;
        }
        
        const data = JSON.parse(text);
        currentProfileData = data;
        console.log("Profile data:", data);
        
        if (!data || !data.full_name) {
            throw new Error("Invalid profile data");
        }

        const locationName = getWilayaNameById(data.location);

        const nameElem = document.querySelector('.name');
        const bloodTypeElem = document.querySelector('.bloodtype-text');
        const locationSpan = document.querySelector('.position span');
        const memberSpan = document.querySelector('.member-since span');
        
        if (nameElem) nameElem.innerText = data.full_name;
        if (bloodTypeElem) bloodTypeElem.innerText = data.blood_type_research;
        if (locationSpan) locationSpan.innerText = locationName;
        if (memberSpan) memberSpan.innerText = "Member since " + (data.created_at ? new Date(data.created_at).getFullYear() : "2026");

        const ddItems = document.querySelectorAll('.dd-wrapper .dd-item');
        if (ddItems.length >= 5) {
            ddItems[0].innerText = data.full_name;
            ddItems[1].innerText = data.date_of_birth || "";
            ddItems[2].innerText = data.telephon || "";
            ddItems[3].innerText = data.email || "";
            ddItems[4].innerText = locationName;
        }

        const bloodBox = document.getElementById('arrow-icon');
        if (bloodBox && data.blood_type_research) {
            if (bloodBox.childNodes[0]) bloodBox.childNodes[0].nodeValue = data.blood_type_research;
            else bloodBox.innerText = data.blood_type_research;
        }

        const stateBox = document.getElementById('state-icon');
        if (stateBox) {
            const isUrgent = data.is_urgent === 1 || data.is_urgent === true;
            const stateText = isUrgent ? "Urgent" : "Stable";
            if (stateBox.childNodes[0]) stateBox.childNodes[0].nodeValue = stateText;
            else stateBox.innerText = stateText;
            stateBox.style.color = isUrgent ? "#E33E3E" : "#EA9A60";
        }

    } catch (error) {
        console.error("Error loading profile:", error);
        alert("Failed to load profile data. Please make sure the server is running.");
    }
}
// Data
let requests = [
    
];

// Show list dynamically
function showList() {
    let container = document.getElementById("historyList");
    let html = "";
    
    for (let i = 0; i < requests.length; i++) {
        let item = requests[i];
        let statusClass = item.status === "pending" ? "status-Pending" : "status-Fulfilled";
        let statusText = item.status === "pending" ? "Pending" : "Fulfilled";
        let isChecked = item.status === "fulfilled" ? "checked" : "";
        
        html += `
            <div class="history-item">
                <div class="drop-div">
                    <img class="drop-pic" src="images/Blur2.svg" alt="drop">
                </div>
                <div class="hos-date-div">
                    <div class="history-date">${item.date}</div>
                    <div class="history-hospital"> ${item.hospital}</div>
                </div>
                <div class="checkbox-div">
                    <input class="checkbox-status" type="checkbox" ${isChecked}>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
            </div>
        `;
    }
    
    if (html === "") {
        html = "<div class='empty-state'>No requests found</div>";
    }
    
    container.innerHTML = html;
    setupCheckboxes();
}

// Handle checkbox change - FIXED (only change text and color, not className)
function setupCheckboxes() {
    // Get all checkboxes
    let checkboxes = document.querySelectorAll('.checkbox-status');
    
    // Go through each checkbox
    for (let i = 0; i < checkboxes.length; i++) {
        let checkbox = checkboxes[i];
        
        // When checkbox is clicked
        checkbox.onclick = function() {
            // Find the status text next to this checkbox
            let status = this.parentElement.querySelector('.status-badge');
            
            // If checked, show "Fulfilled"
            if (this.checked) {
                status.innerHTML = "Fulfilled";
                status.classList.remove('status-Pending');
                status.classList.add('status-Fulfilled');
            } 
            // If not checked, show "Pending"
            else {
                status.innerHTML = "Pending";
                status.classList.remove('status-Fulfilled');
                status.classList.add('status-Pending');
            }
        };
    }
}

// Start
showList();
//crete the two tables
document.addEventListener('DOMContentLoaded', function() {
    // Create blood type dropdown
    const bloodDropdown = document.createElement('div');
    bloodDropdown.id = 'dropdown';
    bloodDropdown.className = 'dropdown';
    bloodDropdown.innerHTML = `
        <table>
            <tr><td onclick="selectBlood(this,'O+')">O+</td><td onclick="selectBlood(this,'O-')">O-</td></tr>
            <tr><td onclick="selectBlood(this,'A+')">A+</td><td onclick="selectBlood(this,'A-')">A-</td></tr>
            <tr><td onclick="selectBlood(this,'B+')">B+</td><td onclick="selectBlood(this,'B-')">B-</td></tr>
            <tr><td onclick="selectBlood(this,'AB+')">AB+</td><td onclick="selectBlood(this,'AB-')">AB-</td></tr>
         </table>
    `;
    document.body.appendChild(bloodDropdown);
    
    // Create state dropdown
    const stateDropdown = document.createElement('div');
    stateDropdown.id = 'stateDropdown';
    stateDropdown.className = 'state-dropdown';
     stateDropdown.style.display = 'none';
    stateDropdown.innerHTML = `
        <table>
            <tr>
                <td class="urgent-option" onclick="selectState(this,'Urgent')" style="color: #E33E3E;">Urgent</td>
                <td class="stable-option" onclick="selectState(this,'Stable')" style="color: #EA9A60;">Stable</td>
            </tr>
        </table>
    `;
    document.body.appendChild(stateDropdown);
});
function getZoomLevel() {
    // This checks the actual rendered width vs the body's offsetWidth
    // It works whether you use zoom or transform: scale
    return document.body.getBoundingClientRect().width / document.body.offsetWidth || 1;
}
function toggleDropdown() {
    const dropdown = document.getElementById('dropdown');
    const arrow = document.getElementById('arrow-icon');
    const stateDropdown = document.getElementById('stateDropdown');

    if (stateDropdown) stateDropdown.style.display = "none";
    
    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
        document.body.classList.remove('dropdown-open'); // remove active style
    } else {
        const rect = arrow.getBoundingClientRect();
        const currentZoom = getZoomLevel();
      dropdown.style.top = (rect.bottom + window.scrollY) / currentZoom - 1 + 'px';
        dropdown.style.left = (rect.left + window.scrollX) / currentZoom + 'px';
        dropdown.style.display = "block";

        document.body.classList.add('dropdown-open'); // apply active style
    }
}

function toggleStateDropdown() {
    const dropdown = document.getElementById('stateDropdown');
    const stateIcon = document.getElementById('state-icon');
    const bloodDropdown = document.getElementById('dropdown');
    
    if (bloodDropdown) bloodDropdown.style.display = "none";
    
    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
    } else {
        const rect = stateIcon.getBoundingClientRect();
        const currentZoom = getZoomLevel();
        dropdown.style.position = 'absolute';
       dropdown.style.top = (rect.bottom + window.scrollY) / currentZoom + 'px';
        dropdown.style.left = (rect.left + window.scrollX) / currentZoom + 'px';
        dropdown.style.display = "block";
    }
}

function selectBlood(element, value) {
    const bloodDiv = document.getElementById('arrow-icon');
    const dropdown = document.getElementById('dropdown');
    if (bloodDiv.childNodes[0]) bloodDiv.childNodes[0].nodeValue = value;
    else bloodDiv.innerText = value;
    const bloodTypeText = document.querySelector('.bloodtype-text');
    if (bloodTypeText) bloodTypeText.innerText = value;
    dropdown.style.display = "none";
    document.body.classList.remove('dropdown-open');
    
    saveBloodType(value);
}

function selectState(element, value) {
    const stateDiv = document.getElementById('state-icon');
    const dropdown = document.getElementById('stateDropdown');
    if (stateDiv.childNodes[0]) stateDiv.childNodes[0].nodeValue = value;
    else stateDiv.innerText = value;
    if (value === 'Urgent') {
        stateDiv.style.color = '#E33E3E';
    } else {
        stateDiv.style.color = '#EA9A60';
    }
    dropdown.style.display = "none";
    
    saveState(value);
}

// Close dropdowns when clicking outside
// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    const bloodDropdown = document.getElementById('dropdown');
    const stateDropdown = document.getElementById('stateDropdown');
    const bloodIcon = document.getElementById('arrow-icon');
    const stateIcon = document.getElementById('state-icon');

    // Blood dropdown
    if (bloodDropdown && bloodIcon && !bloodDropdown.contains(e.target) && !bloodIcon.contains(e.target)) {
        bloodDropdown.style.display = "none";
        document.body.classList.remove('dropdown-open'); // Remove border style
    }

    // State dropdown
    if (stateDropdown && stateIcon && !stateDropdown.contains(e.target) && !stateIcon.contains(e.target)) {
        stateDropdown.style.display = "none";
        // For state dropdown, you probably don't need dropdown-open, 
        // but if you did use it, remove it here too
    }
});
// For edit button
const wrapper = document.querySelector('.dd-wrapper'); // second-div info wrapper




// editbtn








document.addEventListener('DOMContentLoaded', function() {
    const sm1Img = document.querySelector('.sm1-img');
    const sm2Img = document.querySelector('.sm2-img');
    const sm3Img = document.querySelector('.sm3-img');
    const sm4Img = document.querySelector('.sm4-img');
    
    if (sm1Img) {// Check if the image exists on the page
        const originalSrc1 = sm1Img.src;
        sm1Img.addEventListener('mouseenter', () => {
            sm1Img.src = 'images/Vector23.svg';
            
        });
        
        sm1Img.addEventListener('mouseleave', () => {
            sm1Img.src = originalSrc1;
            
        });
    }
    
    if (sm2Img) {
        const originalSrc2 = sm2Img.src;
        sm2Img.addEventListener('mouseenter', () => {
            sm2Img.src = 'images/Vector20.svg';
        });
        
        sm2Img.addEventListener('mouseleave', () => {
            sm2Img.src = originalSrc2;
            
        });
    }
    
    if (sm3Img) {
        const originalSrc3 = sm3Img.src;
        sm3Img.addEventListener('mouseenter', () => {
            sm3Img.src = 'images/Vector22.svg';
        });
        
        sm3Img.addEventListener('mouseleave', () => {
            sm3Img.src = originalSrc3;
        });
    }
    if (sm4Img) {
        const originalSrc4 = sm4Img.src;
        sm4Img.addEventListener('mouseenter', () => {
            sm4Img.src = 'images/Vector21.svg';
            
        });
        
        sm4Img.addEventListener('mouseleave', () => {
            sm4Img.src = originalSrc4;
        });
    }
});
//to edit profile pic
    editPhotoBtn.onclick = function() {
         fileInput.click(); 
        };//when we click it the folder will open
    fileInput.onchange = function(e) {
         profileImage.src = URL.createObjectURL(e.target.files[0]);
         document.querySelector('.profile img').src = URL.createObjectURL(e.target.files[0]);
         };

//connect with log out
// Add this to your existing patient-profile.js
document.addEventListener('DOMContentLoaded', function() {
   // Inside patient-profile.js
const logoutBtn = document.querySelector('[data-action="logout"]');

if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        const name = document.querySelector('.name').innerText;
        // Specifically grab the text updated by selectBlood()
        const bloodType = document.querySelector('.bloodtype-text').innerText;
        const profilePic = document.getElementById('profileImage').src;
        const email = document.querySelectorAll('.dd-wrapper .dd-item')[3].innerText;

        const sessionData = {
            userName: name,
            userEmail: email,
            userBlood: bloodType,
            userPic: profilePic
        };

        localStorage.setItem('currentUserSession', JSON.stringify(sessionData));
        window.location.href = 'log-out.html';
    });
}
});    

async function saveBloodType(newType) {
    const session = JSON.parse(localStorage.getItem("currentUserSession"));
    const userId = session?.userId;
    if (!userId) {
        console.error("No userId found");
        return;
    }
    try {
        const response = await fetch(`http://localhost:3000/searchers/update/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blood_type_research: newType })
        });
        if (response.ok) {
            console.log("Blood type saved:", newType);
        } else {
            console.error("Failed to save blood type");
        }
    } catch (err) {
        console.error("Error saving blood type:", err);
    }
}

//(Urgent/Stable)
async function saveState(newState) {
    const session = JSON.parse(localStorage.getItem("currentUserSession"));
    const userId = session?.userId;
    if (!userId) {
        console.error("No userId found");
        return;
    }
    const isUrgent = (newState === "Urgent") ? 1 : 0;
    try {
        const response = await fetch(`http://localhost:3000/searchers/update/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_urgent: isUrgent })
        });
        if (response.ok) {
            console.log("State saved:", newState);
        } else {
            console.error("Failed to save state");
        }
    } catch (err) {
        console.error("Error saving state:", err);
    }
}


document.addEventListener("DOMContentLoaded", () => {

    const editBtn = document.querySelector('.edit2-div');
    let isEdited = false;

    if (!editBtn) {
        console.error("❌ edit button not found");
        return;
    }

    editBtn.addEventListener("click", async () => {

        console.log("CLICK 🔥");

        const fields = [
            "infoFullName",
            "infoDob",
            "infoPhone",
            "infoEmail",
            "infoLocation"
        ];

        const map = {
            infoFullName: "full_name",
            infoDob: "date_of_birth",
            infoPhone: "telephon",
            infoEmail: "email",
            infoLocation: "location"
        };

        if (!isEdited) {
            console.log("EDIT MODE");

            fields.forEach(id => {
                const el = document.getElementById(id);
                const key = map[id];
                const value = currentProfileData[key] || "";

                el.innerHTML = `<input value="${value}" />`;
            });

            editBtn.querySelector('.edit2').innerText = "Save";
            isEdited = true;

        } else {
            console.log("SAVE MODE 🚀");

            const updatedData = {};

            fields.forEach(id => {
                const key = map[id];
                const input = document.querySelector(`#${id} input`);

                if (input && input.value.trim() !== "") {
                    updatedData[key] = input.value;
                } else {
                    updatedData[key] = currentProfileData[key];
                }
            });

const bloodTypeElem = document.querySelector('.bloodtype-text');
if (!bloodTypeElem) console.error("bloodtype-text not found");
updatedData.blood_type_research = bloodTypeElem ? bloodTypeElem.innerText.trim() : currentProfileData.blood_type_research;

const stateElem = document.getElementById('state-icon');
const stateText = stateElem ? stateElem.innerText.trim() : "Stable";
updatedData.is_urgent = (stateText === "Urgent") ? 1 : 0;

            console.log("SENDING DATA:", updatedData);

            const session = JSON.parse(localStorage.getItem("currentUserSession"));
            const userId = session?.userId;

console.log("📤 Sending update with userId:", userId);
console.log("📦 Payload:", updatedData);

            const response = await fetch(`http://localhost:3000/searchers/update/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Server error:", response.status, errorText);
    alert("Update failed: " + errorText);
} else {
    const result = await response.json();
    console.log("Update success:", result);
}

            console.log("STATUS:", response.status);

            await loadSearcherProfile();

            const btn = document.querySelector('.edit2-div');
console.log(btn);
btn.click();     

const newBlood = document.querySelector('.bloodtype-text').innerText;
const newState = document.getElementById('state-icon').innerText;
console.log("Reloaded profile: Blood =", newBlood, ", State =", newState);

            editBtn.querySelector('.edit2').innerText = "Edit";
            isEdited = false;
        }
    });
});


    loadSearcherProfile(); 
