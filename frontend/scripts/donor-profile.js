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

// ---------- سجل التبرعات (آخر 3 فقط) ----------
let allDonationsData = [];

function renderDonations() {
    const container = document.getElementById("historyList");
    if (!container) return;

    if (allDonationsData.length === 0) {
        container.innerHTML = `<div class="history-item" style="justify-content: center;">
            <div class="history-text">
                <span>No donations yet</span>
                <p>Your donation history will appear here</p>
            </div>
        </div>`;
        return;
    }

    // عرض جميع التبرعات (بدون اقتصاص)
    let html = '';
    for (let i = 0; i < allDonationsData.length; i++) {
        let item = allDonationsData[i];
        html += `
            <div class="history-item">
                <img src="${item.icon}" class="icon-blood">
                <div class="history-text">
                    <span style="font-weight: 500;">${item.date}</span>
                    <p style="margin: 0; font-size: 12px; color: #555;">${item.hospital}</p>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
}

async function fetchDonationHistory(donorId) {
    try {
        const response = await fetch(`http://localhost:3000/donations/donor/${donorId}`);
        if (!response.ok) throw new Error("Failed to fetch donation history");
        const donations = await response.json();
        console.log("Donations received:", donations);
        allDonationsData = donations.map(d => {
            let formattedDate = "";
            if (d.donation_date) {
                const dateObj = new Date(d.donation_date);
                formattedDate = `${dateObj.getDate().toString().padStart(2,"0")}/${(dateObj.getMonth()+1).toString().padStart(2,"0")}/${dateObj.getFullYear()}`;
            }
            let hospitalName = d.Hospital_name || "Hospital not specified";
            return {
                date: formattedDate,
                hospital: hospitalName,
                icon: "images/Blur.svg"
            };
        });
        renderDonations();
    } catch (err) {
        console.error("Error fetching donation history:", err);
        allDonationsData = [];
        renderDonations();
    }
}

// ---------- دالة تحميل بيانات المتبرع ----------
async function loadDonorData() {
    console.log("Loading donor data...");
    const user = JSON.parse(localStorage.getItem("currentUserSession"));

    if (user && user.userType !== "donor") {
        alert("This page is for donors only. Please log out and log in as a donor.");
        window.location.href = "login.html";
        return;
    }
    if (!user || !user.userId) {
        console.error("No user session found or missing userId");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/donors/profile/${user.userId}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        console.log("Donor Data:", data);

        const locationName = getWilayaNameById(data.location);

        document.getElementById("topName").innerText = data.full_name;
        document.querySelector(".blood-badge").innerText = data.blood_type;
        document.getElementById("topLocation").innerText = locationName;

        document.getElementById("fullName").innerText = data.full_name;
        document.getElementById("birthDate").innerText = formatDate(data.date_of_birth);
        document.getElementById("phone").innerText = data.telephon;
        document.getElementById("email").innerText = data.email;
        document.getElementById("location").innerText = locationName;
        document.getElementById("location").setAttribute("data-wilaya-id", data.location);

        const bloodStrong = document.querySelector('.value strong');
        if (bloodStrong) bloodStrong.innerText = data.blood_type;

        // جلب آخر 3 تبرعات
        fetchDonationHistory(user.userId);

        // تحديث آخر تبرع والتبرع القادم
        const lastDonationElem = document.querySelector('.data-row:nth-child(2) .value strong');
        const nextDonationElem = document.querySelector('.data-row:nth-child(3) .value strong');
        if (data.last_donation_date) {
            const lastDate = new Date(data.last_donation_date);
            lastDonationElem.innerText = lastDate.toISOString().split('T')[0];
            const nextDate = new Date(lastDate);
            nextDate.setDate(nextDate.getDate() + 90);
            nextDonationElem.innerText = nextDate.toISOString().split('T')[0];
        } else {
            lastDonationElem.innerText = "No donation yet";
            nextDonationElem.innerText = "After first donation";
        }

        // تحديث زر التفعيل/إلغاء التفعيل
        const donorActive = data.is_active;
        const securityLinks = document.querySelector('.security-list');
        if (securityLinks) {
            const deactivateItem = securityLinks.querySelector('.security-item[href="deactivate.html"]');
            if (deactivateItem) {
                if (donorActive == 0) {
                    deactivateItem.removeAttribute('href');
                    deactivateItem.style.cursor = 'pointer';
                    const spanElem = deactivateItem.querySelector('span');
                    if (spanElem) spanElem.innerText = 'Reactivate Account';
                    deactivateItem.onclick = async (e) => {
                        e.preventDefault();
                        const user = JSON.parse(localStorage.getItem('currentUserSession'));
                        if (user && user.userId) {
                            const res = await fetch(`http://localhost:3000/donors/active/${user.userId}`, { method: 'POST' });
                            if (res.ok) {
                                alert('Account reactivated. Please log in again.');
                                localStorage.removeItem('currentUserSession');
                                window.location.href = 'login.html';
                            } else {
                                alert('Failed to reactivate account.');
                            }
                        }
                    };
                } else {
                    deactivateItem.setAttribute('href', 'deactivate.html');
                }
            }
        }
    } catch (error) {
        console.error("Error loading donor:", error);
        alert("Failed to load profile data. Please make sure the server is running.");
    }
}

// ---------- باقي الدوال (تعديل الصورة، تسجيل الخروج، إلخ) ----------
function setupPhotoEdit() {
    const editBtn = document.querySelector('.btn-edit');
    const avatarImg = document.querySelector('.main-avatar');
    if (!editBtn || !avatarImg) return;
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    editBtn.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => { avatarImg.src = ev.target.result; };
            reader.readAsDataURL(file);
        }
    };
}

function setupFooterHover() {
    const socialIcons = [
        { class: '.sm1-img', hover: 'images/hoverX.svg' },
        { class: '.sm2-img', hover: 'images/hoverInst.svg' },
        { class: '.sm3-img', hover: 'images/hoverFace.svg' },
        { class: '.sm4-img', hover: 'images/hoverIn.svg' }
    ];
    socialIcons.forEach(icon => {
        const img = document.querySelector(icon.class);
        if (img) {
            const original = img.src;
            img.onmouseenter = () => img.src = icon.hover;
            img.onmouseleave = () => img.src = original;
        }
    });
}

function setupDonorInfoEdit() {
    const editBtn = document.querySelector('.edit-btn-small');
    const personalCard = document.getElementById('personalCard');
    const topName = document.getElementById('topName');
    const topLocationSpan = document.getElementById('topLocation');
    if (!editBtn || !personalCard) return;
    let isEditing = false;
    editBtn.onclick = async function() {
        const rows = personalCard.querySelectorAll('.data-row');
        if (!isEditing) {
            // EDIT MODE: تخزين البريد الأصلي
            const originalEmailSpan = document.getElementById('email');
            const originalEmail = originalEmailSpan ? originalEmailSpan.innerText : "";
            editBtn.setAttribute('data-original-email', originalEmail);
            
            rows.forEach(row => {
                const valueSpan = row.querySelector('span:last-child');
                const label = row.querySelector('span:first-child').innerText.toLowerCase();
                if (label.includes("location")) {
                    const wilayaId = document.getElementById("location").getAttribute("data-wilaya-id");
                    if (wilayaId && wilayaId !== "Unknown") {
                        valueSpan.innerHTML = `<input type="text" value="${wilayaId}" style="border:1px solid #ddd; width:100%; padding: 5px;">`;
                    } else {
                        const currentText = valueSpan.innerText;
                        valueSpan.innerHTML = `<input type="text" value="${currentText.replace(/"/g, '&quot;')}" style="border:1px solid #ddd; width:100%; padding: 5px;">`;
                    }
                } else {
                    const currentText = valueSpan.innerText;
                    valueSpan.innerHTML = `<input type="text" value="${currentText.replace(/"/g, '&quot;')}" style="border:1px solid #ddd; width:100%; padding: 5px;">`;
                }
            });
            this.innerHTML = "Save";
            isEditing = true;
        } else {
            // SAVE MODE: جمع البيانات
            const updatedData = {};
            let locationInputValue = "";
            let emailChanged = false;
            let newEmailValue = "";
            const originalEmail = editBtn.getAttribute('data-original-email');
            
            rows.forEach(row => {
                const input = row.querySelector('input');
                const valueSpan = row.querySelector('span:last-child');
                const label = row.querySelector('span:first-child').innerText.toLowerCase();
                if (input) {
                    const newValue = input.value.trim();
                    valueSpan.innerText = newValue;
                    if (label.includes("name")) {
                        updatedData.full_name = newValue;
                        if (topName) topName.innerText = newValue;
                    }
                    if (label.includes("birth")) updatedData.date_of_birth = newValue;
                    if (label.includes("phone")) updatedData.telephon = newValue;
                    if (label.includes("email")) {
                        if (newValue !== originalEmail) {
                            emailChanged = true;
                            newEmailValue = newValue;
                        }
                    }
                    if (label.includes("location")) locationInputValue = newValue;
                }
            });
            
            // إذا تغير البريد
            if (emailChanged) {
                const session = JSON.parse(localStorage.getItem("currentUserSession"));
                const userId = session?.userId;
                if (!userId) { alert("User not found"); return; }
                const changeUrl = `http://localhost:3000/donors/request-email-change/${userId}`;
                try {
                    const res = await fetch(changeUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ new_email: newEmailValue })
                    });
                    if (!res.ok) throw new Error(await res.text());
                    alert("Verification code sent to your new email. Please check your inbox.");
                    window.location.href = `verificationCode.html?email=${encodeURIComponent(newEmailValue)}&type=email-change&userId=${userId}&role=donor`;
                    return;
                } catch(err) {
                    alert("Error requesting email change: " + err.message);
                    return;
                }
            }
            
            // تحويل اسم الولاية إلى رقم
            let wilayaNumber = null;
            if (locationInputValue) {
                const asNumber = parseInt(locationInputValue, 10);
                if (!isNaN(asNumber) && asNumber >= 1 && asNumber <= 58) {
                    wilayaNumber = asNumber;
                } else {
                    const index = wilayas.findIndex(w => w.toLowerCase() === locationInputValue.toLowerCase());
                    if (index !== -1) wilayaNumber = index + 1;
                    else {
                        alert("Invalid location. Please enter a valid wilaya number (1-58) or name.");
                        return;
                    }
                }
                updatedData.location = wilayaNumber;
            }
            
            // إزالة البريد من البيانات (لأنه لم يتغير أو تمت معالجته)
            delete updatedData.email;
            
            const session = JSON.parse(localStorage.getItem("currentUserSession"));
            const userId = session?.userId;
            if (!userId) {
                alert("User not found, please login again.");
                return;
            }
            try {
                const response = await fetch(`http://localhost:3000/donors/update/${userId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedData)
                });
                if (!response.ok) {
                    const errDetails = await response.text();
                    console.error("Server error:", errDetails);
                    throw new Error(errDetails);
                }
                console.log("Profile updated successfully");
                await loadDonorData();
            } catch (err) {
                console.error("Update error:", err);
                alert("Failed to update profile: " + err.message);
                await loadDonorData();
            }
            this.innerHTML = `<img src="images/VectorPen.svg" class="icon-small"> Edit`;
            isEditing = false;
        }
    };
}

function setupLogout() {
    const logoutBtn = document.querySelector('.logout-item');
    if (!logoutBtn) return;
    logoutBtn.addEventListener('click', function() {
        const user = JSON.parse(localStorage.getItem("currentUserSession"));
        const id = user ? user.userId : null;
        const name = document.getElementById('topName').innerText;
        const bloodType = document.querySelector('.blood-badge').innerText;
        const profilePic = document.querySelector('.main-avatar').src;
        let email = "";
        const rows = document.querySelectorAll('.data-row');
        rows.forEach(row => {
            if(row.innerText.toLowerCase().includes('email')) {
                const emailSpan = row.querySelector('span:last-child');
                if(emailSpan) email = emailSpan.innerText;
            }
        });
        const sessionData = { userId: id, userName: name, userEmail: email, userBlood: bloodType, userPic: profilePic };
        localStorage.setItem('currentUserSession', JSON.stringify(sessionData));
        window.location.href = 'log-out.html';
    });
}

async function saveBloodType(newType) {
    const session = JSON.parse(localStorage.getItem("currentUserSession"));
    const userId = session?.userId;
    if (!userId) return;
    try {
        const response = await fetch(`http://localhost:3000/donors/update/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blood_type: newType })
        });
        if (response.ok) console.log("Blood type saved:", newType);
        else console.error("Failed to save blood type:", await response.text());
    } catch (err) { console.error("Error saving blood type:", err); }
}

function selectBloodType(type) {
    const bloodDisplay = document.querySelector('.value strong');
    const topBadge = document.querySelector('.blood-badge');
    if (bloodDisplay) bloodDisplay.innerText = type;
    if (topBadge) topBadge.innerText = type;
    const dropdown = document.getElementById('bloodDropdown');
    if (dropdown) dropdown.style.display = 'none';
    saveBloodType(type);
}

// ---------- القائمة المنسدلة للدم ----------
document.addEventListener('DOMContentLoaded', function() {
    const penIcon = document.querySelector('.pen-icon');
    const bloodContainer = penIcon ? penIcon.closest('.value') : null;
    if (penIcon && bloodContainer) {
        bloodContainer.style.position = 'relative';
        let bloodDropdown = document.createElement('div');
        bloodDropdown.id = 'bloodDropdown';
        bloodDropdown.style.cssText = `display: none; position: absolute; top: 100%; left: -1px; width: calc(100% + 2px); background: white; border: 1px solid black; border-radius: 0 0 10px 10px; box-shadow: 0px 4px 10px rgba(0,0,0,0.1); z-index: 10000; overflow: hidden; box-sizing: border-box;`;
        bloodDropdown.innerHTML = `<table style="width:100%; border-collapse: collapse; border-style: hidden;">
                <tr style="cursor: pointer;"><td class="blood-item" style="padding: 18px 10px; text-align: center; color:#D97775; font-weight:bold; border-right:1px solid black; border-bottom:1px solid black;">O+</td><td class="blood-item" style="padding:18px 10px; text-align:center; color:#D97775; font-weight:bold; border-bottom:1px solid black;">O-</td></tr>
                <tr style="cursor: pointer;"><td class="blood-item" style="padding:18px 10px; text-align:center; color:#D97775; font-weight:bold; border-right:1px solid black; border-bottom:1px solid black;">A+</td><td class="blood-item" style="padding:18px 10px; text-align:center; color:#D97775; font-weight:bold; border-bottom:1px solid black;">A-</td></tr>
                <tr style="cursor: pointer;"><td class="blood-item" style="padding:18px 10px; text-align:center; color:#D97775; font-weight:bold; border-right:1px solid black; border-bottom:1px solid black;">B+</td><td class="blood-item" style="padding:18px 10px; text-align:center; color:#D97775; font-weight:bold; border-bottom:1px solid black;">B-</td></tr>
                <tr style="cursor: pointer;"><td class="blood-item" style="padding:18px 10px; text-align:center; color:#D97775; font-weight:bold; border-right:1px solid black;">AB+</td><td class="blood-item" style="padding:18px 10px; text-align:center; color:#D97775; font-weight:bold;">AB-</td></tr>
             </table>`;
        bloodContainer.appendChild(bloodDropdown);
        const items = bloodDropdown.querySelectorAll('.blood-item');
        items.forEach(item => {
            item.addEventListener('mouseenter', () => { item.style.backgroundColor = '#D97775'; item.style.color = 'white'; });
            item.addEventListener('mouseleave', () => { item.style.backgroundColor = 'white'; item.style.color = '#D97775'; });
            item.addEventListener('click', () => { selectBloodType(item.innerText); closeBloodDropdown(); });
        });
        function closeBloodDropdown() {
            if (bloodDropdown.style.display === 'block') {
                bloodDropdown.style.display = 'none';
                bloodContainer.style.border = "none";
                bloodContainer.style.borderRadius = "0";
                bloodContainer.style.backgroundColor = "transparent";
                bloodContainer.style.zIndex = "";
            }
        }
        penIcon.onclick = (e) => {
            e.stopPropagation();
            if (bloodDropdown.style.display === 'block') closeBloodDropdown();
            else {
                bloodDropdown.style.display = 'block';
                bloodContainer.style.border = "1px solid black";
                bloodContainer.style.borderBottom = "none";
                bloodContainer.style.borderRadius = "10px 10px 0 0";
                bloodContainer.style.backgroundColor = "white";
                bloodContainer.style.zIndex = "10001";
            }
        };
        document.addEventListener('click', (e) => { if (!bloodContainer.contains(e.target)) closeBloodDropdown(); });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    setupPhotoEdit();
    setupDonorInfoEdit();
    setupFooterHover();
    setupLogout();
    loadDonorData();
});




