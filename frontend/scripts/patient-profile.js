let currentProfileData = {};

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

const wilayas = [
    "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Bejaia","Biskra","Bechar",
    "Blida","Bouira","Tamanrasset","Tebessa","Tlemcen","Tiaret","Tizi Ouzou","Algiers",
    "Djelfa","Jijel","Setif","Saida","Skikda","Sidi Bel Abbes","Annaba","Guelma",
    "Constantine","Medea","Mostaganem","Msila","Mascara","Ouargla","Oran","El Bayadh",
    "Illizi","Bordj Bou Arreridj","Boumerdes","El Tarf","Tindouf","Tissemsilt",
    "El Oued","Khenchela","Souk Ahras","Tipaza","Mila","Ain Defla","Naama",
    "Ain Temouchent","Ghardaia","Relizane","Timimoun","Bordj Badji Mokhtar","Ouled Djellal",
    "Beni Abbes","In Salah","In Guezzam","Touggourt","Djanet","El M'Ghair","El Meniaa"
];

//update
// ========== SEARCHER PROFILE PICTURE FUNCTIONS ==========
// Add this at the VERY TOP of your file, right after const wilayas

async function uploadSearcherProfilePicture(file) {
    const user = JSON.parse(localStorage.getItem("currentUserSession"));
    if (!user?.userId) return false;
    
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    try {
        const response = await fetch(`http://localhost:3000/searchers/upload-picture/${user.userId}`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }
        
        const data = await response.json();
        
        // Update profile image and header image
        const profileImg = document.getElementById('profileImage');
        const headerImg = document.querySelector('.profile-img');
        
        const newSrc = 'http://localhost:3000' + data.pictureUrl + '?t=' + Date.now();
        
        if (profileImg) profileImg.src = newSrc;
        if (headerImg) headerImg.src = newSrc;
        
        // Save to session storage
        user.profilePicture = data.pictureUrl;
        localStorage.setItem('currentUserSession', JSON.stringify(user));
        
        // Broadcast update to other pages
        window.dispatchEvent(new CustomEvent('profilePictureUpdated'));
        
showToast('Profile picture updated!', 'success');
        return true;
        
    } catch (error) {

        console.error('Upload error:', error);
showToast('Failed to upload picture: ' + error.message, 'error');
        return false;
    }
}
//update
async function loadSearcherProfilePictureFromServer() {
    const user = JSON.parse(localStorage.getItem("currentUserSession"));
    const profileImg = document.getElementById('profileImage');
    const headerImg = document.querySelector('.profile-img');
    
    if (!user?.userId || (!profileImg && !headerImg)) return;
    
    try {
        const response = await fetch(`http://localhost:3000/get-profile-picture/${user.userId}/searcher`);
        if (!response.ok) return;
        
        const data = await response.json();
        
        // FIX: Use pictureUrl instead of profile_picture
        if (data.pictureUrl) {
            const newSrc = 'http://localhost:3000' + data.pictureUrl + '?t=' + Date.now();
            if (profileImg) profileImg.src = newSrc;
            if (headerImg) headerImg.src = newSrc;
            
            user.profilePicture = data.pictureUrl;
            localStorage.setItem('currentUserSession', JSON.stringify(user));
            console.log('Searcher profile picture loaded from server');
        }
    } catch (error) {
        console.error('Failed to load profile picture:', error);
    }
}





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

// دالة لحساب فصائل الدم المتوافقة للتبرع للمحتاج
function getCompatibleBloodTypes(patientBloodType) {
    const compatibility = {
        'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
        'O+': ['O+', 'A+', 'B+', 'AB+'],
        'A-': ['A-', 'A+', 'AB-', 'AB+'],
        'A+': ['A+', 'AB+'],
        'B-': ['B-', 'B+', 'AB-', 'AB+'],
        'B+': ['B+', 'AB+'],
        'AB-': ['AB-', 'AB+'],
        'AB+': ['AB+']
    };
    return compatibility[patientBloodType] || [patientBloodType];
}

// جلب طلبات التبرع الخاصة بالمحتاج (المقبولة فقط)
async function fetchRequestHistory(searcherId) {
    try {
        const response = await fetch(`http://localhost:3000/donations/searcher/${searcherId}`);
        if (!response.ok) throw new Error("Failed to fetch request history");
        const donations = await response.json();
        window.requests = donations.map(d => ({
            date: new Date(d.donation_date).toLocaleDateString('en-GB'),
            hospital: d.Hospital_name || "Hospital"
        }));
        showList();
    } catch (err) {
        console.error("Error fetching request history:", err);
        window.requests = [];
        showList();
    }
}

async function loadSearcherProfile() {
    const user = JSON.parse(localStorage.getItem("currentUserSession"));
    if (user && user.userType !== "searcher") {
showToast("This page is for patients only. Please log out and log in as a patient.", 'error');
        window.location.href = "login.html";
        return;
    }

    if (!user?.userId) {
        console.error("No user session");
showToast("Please log in again.", 'error');
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/searchers/profile/${user.userId}`);
        if (!response.ok) {
            if (response.status === 404) {
                console.error("User not found");
showToast("User not found. Please log in again.", 'error');
                localStorage.removeItem("currentUserSession");
                window.location.href = "login.html";
                return;
            }
            throw new Error(`HTTP ${response.status}`);
        }
        const text = await response.text();
        if (!text || text.trim() === "") {
            console.error("Empty response from server");
showToast("Server returned empty response. Please try again later.", 'error');
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

        // ========== المعلومات الشخصية (القسم الأول) ==========
        const personalWrapper = document.querySelector('.second-div .dd-wrapper');
        if (personalWrapper) {
            const personalItems = personalWrapper.querySelectorAll('.dd-item');
            if (personalItems.length >= 6) {
                personalItems[0].innerText = data.full_name;           // Full Name
                personalItems[1].innerText = formatDate(data.date_of_birth) || "";
                personalItems[2].innerText = data.telephon || "";
                personalItems[3].innerText = data.email || "";
                personalItems[4].innerText = locationName;
                personalItems[5].innerText = data.Hospital_name || ""; // Hospital name
            }
        }

        // ========== معلومات الدم (القسم الثاني) ==========
        const bloodWrapper = document.querySelector('.third-div .dd-wrapper');
        if (bloodWrapper) {
            const bloodItems = bloodWrapper.querySelectorAll('.dd-item');
            if (bloodItems.length >= 3) {
                // العنصر الأول: فصيلة الدم (مع السهم)
                const bloodBox = bloodItems[0];
                if (bloodBox && data.blood_type_research) {
                    if (bloodBox.childNodes[0]) bloodBox.childNodes[0].nodeValue = data.blood_type_research;
                    else bloodBox.innerText = data.blood_type_research;
                }
                // العنصر الثاني: الحالة (Urgent/Stable)
                const stateBox = bloodItems[1];
                if (stateBox) {
                    const isUrgent = data.is_urgent === 1 || data.is_urgent === true;
                    const stateText = isUrgent ? "Urgent" : "Stable";
                    if (stateBox.childNodes[0]) stateBox.childNodes[0].nodeValue = stateText;
                    else stateBox.innerText = stateText;
                    stateBox.style.color = isUrgent ? "#E33E3E" : "#EA9A60";
                }
                // العنصر الثالث: Requested Types (فصائل الدم المتوافقة)
                const requestedTypesElem = bloodItems[2];
                if (requestedTypesElem && data.blood_type_research) {
                    const compatibleList = getCompatibleBloodTypes(data.blood_type_research);
                    requestedTypesElem.innerText = compatibleList.join(', ');
                }
            }
        }

        fetchRequestHistory(user.userId);

const toggleInput = document.querySelector('.toggle-input');
const toggleSubText = document.querySelector('.security-sub-p');

if (toggleInput) {
    // ضع الحالة الحالية من الـ data
    toggleInput.checked = data.available === 1;
    if (toggleSubText) {
        toggleSubText.textContent = data.available === 1 
            ? 'You are visible for donors right now' 
            : 'You are not visible for donors right now';
    }

    toggleInput.addEventListener('change', async () => {
        const isAvailable = toggleInput.checked ? 1 : 0;
        
        if (toggleSubText) {
            toggleSubText.textContent = isAvailable 
                ? 'You are visible for donors right now' 
                : 'You are not visible for donors right now';
        }

        const session = JSON.parse(localStorage.getItem('currentUserSession'));
        const userId = session?.userId;
        if (!userId) return;

        try {
await fetch(`http://localhost:3000/searchers/update-availability/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ available: isAvailable })
});
        } catch (err) {
            console.error('Failed to update availability:', err);
        }
    });
}

// تحقق من is_active وغير الزر
const currentSession = JSON.parse(localStorage.getItem('currentUserSession') || '{}');
const deactivateLink = document.querySelector('.security-btn1');
const securityP = deactivateLink?.querySelector('.security-p');

if (currentSession.is_active === 0 && deactivateLink && securityP) {
    // غير النص
    securityP.textContent = 'Reactivate Account';
    
    // امنع الانتقال لصفحة deactivate
    deactivateLink.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const res = await fetch(`http://localhost:3000/searchers/activate-searcher/${currentSession.userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (res.ok) {
            currentSession.is_active = 1;
            localStorage.setItem('currentUserSession', JSON.stringify(currentSession));
showToast('Account reactivated successfully', 'success');
            window.location.reload();
        } else {
showToast('Failed to reactivate account', 'error');
        }
    });
}
    } catch (error) {
        console.error("Error loading profile:", error);
showToast("Failed to load profile data. Please make sure the server is running.", 'error');
    }
}

function showList() {
    let container = document.getElementById("historyList");
    if (!container) return;
    let requests = window.requests || [];
    let html = "";
    for (let i = 0; i < requests.length; i++) {
        let item = requests[i];
        html += `<div class="history-item">
                    <div class="drop-div"><img class="drop-pic" src="images/Blur2.svg" alt="drop"></div>
                    <div class="hos-date-div">
                        <div class="history-date">${item.date}</div>
                        <div class="history-hospital">${item.hospital}</div>
                    </div>
                </div>`;
    }
    if (html === "") html = "<div class='empty-state'>No requests found</div>";
    container.innerHTML = html;
}

function setupCheckboxes() {
    // لا حاجة لـ checkbox بعد الآن
}

// ----- إعداد القوائم المنسدلة (لفصيلة الدم والحالة) -----
document.addEventListener('DOMContentLoaded', function() {
    // القائمة المنسدلة لفصيلة الدم
    const pencilIcon = document.getElementById('arrow-icon');
    const bloodContainer = pencilIcon ? pencilIcon.closest('.dd-item5-1') : null;
    if (pencilIcon && bloodContainer) {
        bloodContainer.style.position = 'relative';
        let bloodDropdown = document.createElement('div');
        bloodDropdown.id = 'bloodDropdown';
        bloodDropdown.className = 'bloodDropdown';
          bloodDropdown.innerHTML = `
        <table>
            <tr><td onclick="selectBlood(this,'O+')">O+</td><td onclick="selectBlood(this,'O-')">O-</td></tr>
            <tr><td onclick="selectBlood(this,'A+')">A+</td><td onclick="selectBlood(this,'A-')">A-</td></tr>
            <tr><td onclick="selectBlood(this,'B+')">B+</td><td onclick="selectBlood(this,'B-')">B-</td></tr>
            <tr><td onclick="selectBlood(this,'AB+')">AB+</td><td onclick="selectBlood(this,'AB-')">AB-</td></tr>
         </table>
    `;
        bloodContainer.appendChild(bloodDropdown);
        const items = bloodDropdown.querySelectorAll('.blood-item');
        items.forEach(item => {
            item.addEventListener('mouseenter', () => { item.style.backgroundColor = '#D97775'; item.style.color = 'white'; });
            item.addEventListener('mouseleave', () => { item.style.backgroundColor = 'white'; item.style.color = '#D97775'; });
            item.addEventListener('click', () => {
                const selectedType = item.innerText;
                const bloodDiv = document.getElementById('arrow-icon');
                if (bloodDiv.childNodes[0]) bloodDiv.childNodes[0].nodeValue = selectedType;
                else bloodDiv.innerText = selectedType;
                const bloodTypeText = document.querySelector('.bloodtype-text');
                if (bloodTypeText) bloodTypeText.innerText = selectedType;
                bloodDropdown.style.display = 'none';
                bloodContainer.style.border = "none";
                bloodContainer.style.borderRadius = "0";
                bloodContainer.style.backgroundColor = "transparent";
                document.body.classList.remove('dropdown-open');
                saveBloodType(selectedType);
            });
        });
        function closeBloodDropdown() {
            if (bloodDropdown.style.display === 'block') {
                bloodDropdown.style.display = 'none';
                bloodContainer.style.border = "none";
                bloodContainer.style.borderRadius = "0";
                bloodContainer.style.backgroundColor = "transparent";
                document.body.classList.remove('dropdown-open');
            }
        }
        // pencilIcon.onclick تم تعطيله لأن onclick في HTML أصبح يستخدم toggleBloodDropdown
        document.addEventListener('click', function(e) {
            if (!bloodContainer.contains(e.target)) closeBloodDropdown();
        });
    }

    // القائمة المنسدلة للحالة
    const stateDropdown = document.createElement('div');
    stateDropdown.id = 'stateDropdown';
    stateDropdown.className = 'state-dropdown';
    stateDropdown.style.display = 'none';
    stateDropdown.innerHTML =`
        <table>
            <tr>
                <td class="urgent-option" onclick="selectState(this,'Urgent')" style="color: #E33E3E;">Urgent</td>
                <td class="stable-option" onclick="selectState(this,'Stable')" style="color: #EA9A60;">Stable</td>
            </tr>
        </table>
    `;
    document.body.appendChild(stateDropdown);
});

function getZoomLevel() { return document.body.getBoundingClientRect().width / document.body.offsetWidth || 1; }
function toggleStateDropdown() {
    const dropdown = document.getElementById('stateDropdown');
    const stateIcon = document.getElementById('state-icon');
    const bloodDropdown = document.getElementById('bloodDropdown');
    if (bloodDropdown) bloodDropdown.style.display = "none";
    if (dropdown.style.display === "block") dropdown.style.display = "none";
    else {
        const rect = stateIcon.getBoundingClientRect();
        const zoom = getZoomLevel();
       
        dropdown.style.top = (rect.bottom + window.scrollY) / zoom-1 + 'px';
        dropdown.style.left = (rect.left + window.scrollX) / zoom + 'px';
        dropdown.style.display = "block";
    }
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
function selectBlood(element, value) {
    const bloodDiv = document.getElementById('arrow-icon');
    const dropdown = document.getElementById('bloodDropdown');
    if (bloodDiv.childNodes[0]) bloodDiv.childNodes[0].nodeValue = value;
    else bloodDiv.innerText = value;
    const bloodTypeText = document.querySelector('.bloodtype-text');
    if (bloodTypeText) bloodTypeText.innerText = value;
    if (dropdown) dropdown.style.display = "none";
    document.body.classList.remove('dropdown-open');
    saveBloodType(value);
}
async function saveBloodType(newType) {
    const session = JSON.parse(localStorage.getItem("currentUserSession"));
    const userId = session?.userId;
    if (!userId) return;
    try {
        await fetch(`http://localhost:3000/searchers/update/${userId}`, {
            method: "PUT", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ blood_type_research: newType })
        });
        // تحديث البيانات المحلية فوراً
        currentProfileData.blood_type_research = newType;
        // إعادة حساب فصائل الدم المتوافقة وتحديث الواجهة
        const compatibleList = getCompatibleBloodTypes(newType);
        const requestedTypesElem = document.querySelector('.third-div .dd-wrapper .dd-item:last-child');
        if (requestedTypesElem) {
            requestedTypesElem.innerText = compatibleList.join(', ');
        }
        // تحديث عنصر فصيلة الدم في القائمة العلوية (إذا كان موجوداً)
        const bloodTypeElem = document.querySelector('.bloodtype-text');
        if (bloodTypeElem) bloodTypeElem.innerText = newType;
        // تحديث عنصر #arrow-icon (العنصر الذي يعرض فصيلة الدم)
        const bloodDiv = document.getElementById('arrow-icon');
        if (bloodDiv) {
            if (bloodDiv.childNodes[0]) bloodDiv.childNodes[0].nodeValue = newType;
            else bloodDiv.innerText = newType;
        }
        console.log("Blood type updated to:", newType);
    } catch(err) { console.error("Error saving blood type:", err); }
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

document.addEventListener('click', function(e) {
    
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

// تأثيرات أيقونات التواصل الاجتماعي
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
//update
// ========== SETUP PHOTO EDIT FOR SEARCHER ==========
function setupSearcherPhotoEdit() {
    const editPhotoBtn = document.getElementById('editPhotoBtn');
    const fileInput = document.getElementById('fileInput');
    const profileImg = document.getElementById('profileImage');
    const headerImg = document.querySelector('.profile-img');
    
    if (!editPhotoBtn || !fileInput || !profileImg) return;
    
    editPhotoBtn.onclick = () => fileInput.click();
    
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Show loading state
            profileImg.style.opacity = '0.5';
            if (headerImg) headerImg.style.opacity = '0.5';
            
            // Upload to server
            await uploadSearcherProfilePicture(file);
            
            // Reset opacity
            profileImg.style.opacity = '1';
            if (headerImg) headerImg.style.opacity = '1';
            
            fileInput.value = '';
        }
    };
}

// Call the setup function
setupSearcherPhotoEdit();

// تسجيل الخروج
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.querySelector('[data-action="logout"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            window.location.href = 'log-out.html';
        });
    }
});

// زر تعديل المعلومات الشخصية
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

        console.log("SAVE MODE");
        const originalEmail = editBtn.getAttribute('data-original-email');
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
            if (!userId) { showToast("User ID not found", 'error'); return; }
            const changeUrl = `http://localhost:3000/searchers/request-email-change/${userId}`;
            try {
                const res = await fetch(changeUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ new_email: newEmailValue })
                });
                if (!res.ok) {
                    const err = await res.text();
showToast("Error: " + err, 'error');
                    return;
                }
showToast("Verification code sent to your new email.", 'success');
                window.location.href = `verificationCode.html?email=${encodeURIComponent(newEmailValue)}&type=email-change&userId=${userId}&role=searcher`;
                return;
            } catch(err) {
showToast("Network error: " + err.message, 'error');
                return;
            }
        }

        console.log("Email unchanged, normal update");
        delete updatedData.email;
        updatedData.blood_type_research = document.querySelector('.bloodtype-text')?.innerText.trim() || currentProfileData.blood_type_research;
        const stateText = document.getElementById('state-icon')?.innerText.trim() || "Stable";
        updatedData.is_urgent = (stateText === "Urgent") ? 1 : 0;
        if (updatedData.date_of_birth && !isValidDate(updatedData.date_of_birth)) {
showToast("Invalid date format (YYYY-MM-DD)", 'error');
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
showToast("Update failed: " + txt, 'error');
        } else {
            console.log("Update success");
            await loadSearcherProfile();
        }
        editBtn.querySelector('.edit2').innerText = "Edit";
        isEdited = false;
    });
});


// دالة لفتح/إغلاق القائمة المنسدلة لفصيلة الدم (يتم استدعاؤها من onclick الجديد)
window.toggleBloodDropdown = function(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('bloodDropdown');
    const container = document.getElementById('arrow-icon')?.closest('.dd-item5-1');
    if (!dropdown || !container) return;
    const isVisible = dropdown.style.display === 'block';
    if (!isVisible) {
        dropdown.style.display = 'block';
       
       
        document.body.classList.add('dropdown-open');
    } else {
        dropdown.style.display = 'none';
        
       
       
        document.body.classList.remove('dropdown-open');
    }
};

// Load profile picture and data when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await loadSearcherProfilePictureFromServer();
    await loadSearcherProfile();
});
