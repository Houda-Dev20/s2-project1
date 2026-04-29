let currentProfileData = {};

const wilayas = [
    "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Bejaia","Biskra","Bechar",
    "Blida","Bouira","Tamanrasset","Tebessa","Tlemcen","Tiaret","Tizi Ouzou","Algiers",
    "Djelfa","Jijel","Setif","Saida","Skikda","Sidi Bel Abbes","Annaba","Guelma",
    "Constantine","Medea","Mostaganem","Msila","Mascara","Ouargla","Oran","El Bayadh",
    "Illizi","Bordj Bou Arreridj","Boumerdes","El Tarf","Tindouf","Tissemsilt",
    "El Oued","Khenchela","Souk Ahras","Tipaza","Mila","Ain Defla","Naama",
    "Ain Temouchent","Ghardaia","Relizane", "Timimoun","Bordj Badji Mokhtar","Ouled Djellal",
    "Beni Abbes","In Salah","In Guezzam","Touggourt","Djanet","El M'Ghair","El Meniaa"
];

function getWilayaNameById(id) {
    if (!id) return "Unknown";
    const index = parseInt(id) - 1;
    return (index >= 0 && index < wilayas.length) ? wilayas[index] : "Unknown";
}

function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; 
}

function isValidDate(dateString) {
    if (!dateString) return false;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && dateString === date.toISOString().split('T')[0];
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
        if (!data || !data.full_name) throw new Error("Invalid profile data");

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
            ddItems[1].innerText =  formatDate(data.date_of_birth) || "";
            ddItems[2].innerText = data.telephon || "";
            ddItems[3].innerText = data.email || "";
            ddItems[4].innerText = locationName;
            if (ddItems[5]) ddItems[5].innerText = data.Hospital_name || "";
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

let requests = [];

function showList() {
    let container = document.getElementById("historyList");
    let html = "";
    for (let i = 0; i < requests.length; i++) {
        let item = requests[i];
        let statusClass = item.status === "pending" ? "status-Pending" : "status-Fulfilled";
        let statusText = item.status === "pending" ? "Pending" : "Fulfilled";
        let isChecked = item.status === "fulfilled" ? "checked" : "";
        html += `<div class="history-item">
                    <div class="drop-div"><img class="drop-pic" src="images/Blur2.svg" alt="drop"></div>
                    <div class="hos-date-div">
                        <div class="history-date">${item.date}</div>
                        <div class="history-hospital">${item.hospital}</div>
                    </div>
                    <div class="checkbox-div">
                        <input class="checkbox-status" type="checkbox" ${isChecked}>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                </div>`;
    }
    if (html === "") html = "<div class='empty-state'>No requests found</div>";
    container.innerHTML = html;
    setupCheckboxes();
}

function setupCheckboxes() {
    let checkboxes = document.querySelectorAll('.checkbox-status');
    for (let i = 0; i < checkboxes.length; i++) {
        let checkbox = checkboxes[i];
        checkbox.onclick = function() {
            let status = this.parentElement.querySelector('.status-badge');
            if (this.checked) {
                status.innerHTML = "Fulfilled";
                status.classList.remove('status-Pending');
                status.classList.add('status-Fulfilled');
            } else {
                status.innerHTML = "Pending";
                status.classList.remove('status-Fulfilled');
                status.classList.add('status-Pending');
            }
        };
    }
}

showList();

document.addEventListener('DOMContentLoaded', function() {
    const bloodDropdown = document.createElement('div');
    bloodDropdown.id = 'dropdown';
    bloodDropdown.className = 'dropdown';
    bloodDropdown.innerHTML = `<table><tr><td onclick="selectBlood(this,'O+')">O+</td><td onclick="selectBlood(this,'O-')">O-</td></tr>
        <tr><td onclick="selectBlood(this,'A+')">A+</td><td onclick="selectBlood(this,'A-')">A-</td></tr>
        <tr><td onclick="selectBlood(this,'B+')">B+</td><td onclick="selectBlood(this,'B-')">B-</td></tr>
        <tr><td onclick="selectBlood(this,'AB+')">AB+</td><td onclick="selectBlood(this,'AB-')">AB-</td></tr></table>`;
    document.body.appendChild(bloodDropdown);
    const stateDropdown = document.createElement('div');
    stateDropdown.id = 'stateDropdown';
    stateDropdown.className = 'state-dropdown';
    stateDropdown.style.display = 'none';
    stateDropdown.innerHTML = `<table><tr><td class="urgent-option" onclick="selectState(this,'Urgent')" style="color:#E33E3E;">Urgent</td>
        <td class="stable-option" onclick="selectState(this,'Stable')" style="color:#EA9A60;">Stable</td></tr></table>`;
    document.body.appendChild(stateDropdown);
});

function getZoomLevel() { return document.body.getBoundingClientRect().width / document.body.offsetWidth || 1; }
function toggleDropdown() {
    const dropdown = document.getElementById('dropdown');
    const arrow = document.getElementById('arrow-icon');
    const stateDropdown = document.getElementById('stateDropdown');
    if (stateDropdown) stateDropdown.style.display = "none";
    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
        document.body.classList.remove('dropdown-open');
    } else {
        const rect = arrow.getBoundingClientRect();
        const zoom = getZoomLevel();
        dropdown.style.top = (rect.bottom + window.scrollY) / zoom - 1 + 'px';
        dropdown.style.left = (rect.left + window.scrollX) / zoom + 'px';
        dropdown.style.display = "block";
        document.body.classList.add('dropdown-open');
    }
}
function toggleStateDropdown() {
    const dropdown = document.getElementById('stateDropdown');
    const stateIcon = document.getElementById('state-icon');
    const bloodDropdown = document.getElementById('dropdown');
    if (bloodDropdown) bloodDropdown.style.display = "none";
    if (dropdown.style.display === "block") dropdown.style.display = "none";
    else {
        const rect = stateIcon.getBoundingClientRect();
        const zoom = getZoomLevel();
        dropdown.style.position = 'absolute';
        dropdown.style.top = (rect.bottom + window.scrollY) / zoom + 'px';
        dropdown.style.left = (rect.left + window.scrollX) / zoom + 'px';
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
    if (value === 'Urgent') stateDiv.style.color = '#E33E3E';
    else stateDiv.style.color = '#EA9A60';
    dropdown.style.display = "none";
    saveState(value);
}
document.addEventListener('click', function(e) {
    const bloodDropdown = document.getElementById('dropdown');
    const stateDropdown = document.getElementById('stateDropdown');
    const bloodIcon = document.getElementById('arrow-icon');
    const stateIcon = document.getElementById('state-icon');
    if (bloodDropdown && bloodIcon && !bloodDropdown.contains(e.target) && !bloodIcon.contains(e.target)) {
        bloodDropdown.style.display = "none";
        document.body.classList.remove('dropdown-open');
    }
    if (stateDropdown && stateIcon && !stateDropdown.contains(e.target) && !stateIcon.contains(e.target)) {
        stateDropdown.style.display = "none";
    }
});

// Social hover
document.addEventListener('DOMContentLoaded', function() {
    const sm1 = document.querySelector('.sm1-img');
    const sm2 = document.querySelector('.sm2-img');
    const sm3 = document.querySelector('.sm3-img');
    const sm4 = document.querySelector('.sm4-img');
    if (sm1) { const orig = sm1.src; sm1.addEventListener('mouseenter',()=>sm1.src='images/Vector23.svg'); sm1.addEventListener('mouseleave',()=>sm1.src=orig); }
    if (sm2) { const orig = sm2.src; sm2.addEventListener('mouseenter',()=>sm2.src='images/Vector20.svg'); sm2.addEventListener('mouseleave',()=>sm2.src=orig); }
    if (sm3) { const orig = sm3.src; sm3.addEventListener('mouseenter',()=>sm3.src='images/Vector22.svg'); sm3.addEventListener('mouseleave',()=>sm3.src=orig); }
    if (sm4) { const orig = sm4.src; sm4.addEventListener('mouseenter',()=>sm4.src='images/Vector21.svg'); sm4.addEventListener('mouseleave',()=>sm4.src=orig); }
});

// Photo edit (mock for now)
const editPhotoBtn = document.getElementById('editPhotoBtn');
const fileInput = document.getElementById('fileInput');
const profileImage = document.getElementById('profileImage');
if (editPhotoBtn && fileInput && profileImage) {
    editPhotoBtn.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            profileImage.src = url;
            const headerImg = document.querySelector('.profile img');
            if (headerImg) headerImg.src = url;
        }
    };
}

// Logout
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.querySelector('[data-action="logout"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            const name = document.querySelector('.name').innerText;
            const bloodType = document.querySelector('.bloodtype-text').innerText;
            const profilePic = document.getElementById('profileImage').src;
            const email = document.querySelectorAll('.dd-wrapper .dd-item')[3]?.innerText || '';
            localStorage.setItem('currentUserSession', JSON.stringify({ userName: name, userEmail: email, userBlood: bloodType, userPic: profilePic }));
            window.location.href = 'log-out.html';
        });
    }
});

async function saveBloodType(newType) {
    const session = JSON.parse(localStorage.getItem("currentUserSession"));
    const userId = session?.userId;
    if (!userId) return;
    try {
        await fetch(`http://localhost:3000/searchers/update/${userId}`, {
            method: "PUT", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ blood_type_research: newType })
        });
    } catch(err) {}
}
async function saveState(newState) {
    const session = JSON.parse(localStorage.getItem("currentUserSession"));
    const userId = session?.userId;
    if (!userId) return;
    const isUrgent = (newState === "Urgent") ? 1 : 0;
    try {
        await fetch(`http://localhost:3000/searchers/update/${userId}`, {
            method: "PUT", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_urgent: isUrgent })
        });
    } catch(err) {}
}

// ----- EDIT BUTTON LOGIC -----
document.addEventListener('DOMContentLoaded', () => {
    const editBtn = document.querySelector('.edit2-div');
    let isEdited = false;
    if (!editBtn) {
        console.error("Edit button not found");
        return;
    }

    editBtn.addEventListener("click", async () => {
        const fields = ["infoFullName","infoDob","infoPhone","infoEmail","infoLocation","infoHospital"];
        const map = {
            infoFullName: "full_name",
            infoDob: "date_of_birth",
            infoPhone: "telephon",
            infoEmail: "email",
            infoLocation: "location",
            infoHospital: "Hospital_name"
        };

        if (!isEdited) {
            console.log("EDIT MODE");
            editBtn.setAttribute('data-original-email', currentProfileData.email || "");
            fields.forEach(id => {
                const el = document.getElementById(id);
                const key = map[id];
                let raw = currentProfileData[key];
                let value = (raw !== undefined && raw !== null) ? String(raw) : "";
                if (key === "date_of_birth") value = formatDate(value);
                if (el) el.innerHTML = `<input value="${value.replace(/"/g, '&quot;')}" />`;
            });
            editBtn.querySelector('.edit2').innerText = "Save";
            isEdited = true;
            return;
        }

        // SAVE MODE
        console.log("SAVE MODE");
        const originalEmail = editBtn.getAttribute('data-original-email');
        console.log("Original email:", originalEmail);
        let emailChanged = false;
        let newEmailValue = "";
        const updatedData = {};

        for (const id of fields) {
            const key = map[id];
            const input = document.querySelector(`#${id} input`);
            let value = input ? input.value.trim() : "";
            if (value === "") value = currentProfileData[key] || "";
            updatedData[key] = value;
            if (key === "email") {
                if (value !== originalEmail) {
                    emailChanged = true;
                    newEmailValue = value;
                    console.log("Email changed detected!");
                }
            }
        }

        if (emailChanged) {
            console.log("Requesting email change...");
            const session = JSON.parse(localStorage.getItem("currentUserSession"));
            const userId = session?.userId;
            if (!userId) { alert("User ID not found"); return; }
            const changeUrl = `http://localhost:3000/searchers/request-email-change/${userId}`;
            try {
                const res = await fetch(changeUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ new_email: newEmailValue })
                });
                if (!res.ok) {
                    const err = await res.text();
                    alert("Error: " + err);
                    return;
                }
                alert("Verification code sent to your new email.");
                window.location.href = `verificationCode.html?email=${encodeURIComponent(newEmailValue)}&type=email-change&userId=${userId}&role=searcher`;
                return;
            } catch(err) {
                alert("Network error: " + err.message);
                return;
            }
        }

        // If email unchanged, proceed with update (without email field)
        console.log("Email unchanged, normal update");
        delete updatedData.email;
        // Add blood type and state
        updatedData.blood_type_research = document.querySelector('.bloodtype-text')?.innerText.trim() || currentProfileData.blood_type_research;
        const stateText = document.getElementById('state-icon')?.innerText.trim() || "Stable";
        updatedData.is_urgent = (stateText === "Urgent") ? 1 : 0;
        // Validate date
        if (updatedData.date_of_birth && !isValidDate(updatedData.date_of_birth)) {
            alert("Invalid date format (YYYY-MM-DD)");
            return;
        }
        console.log("Sending data without email:", updatedData);
        const session = JSON.parse(localStorage.getItem("currentUserSession"));
        const userId = session?.userId;
        const response = await fetch(`http://localhost:3000/searchers/update/${userId}`, {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        if (!response.ok) {
            const txt = await response.text();
            alert("Update failed: " + txt);
        } else {
            console.log("Update success");
            await loadSearcherProfile();
        }
        editBtn.querySelector('.edit2').innerText = "Edit";
        isEdited = false;
    });
});

loadSearcherProfile();