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
        

    } catch (error) {
        console.error("Error loading donor:", error);
alert("Failed to load profile data. Please make sure the server is running.");    }
}

let donationHistory = []; 

function showDonations() {
    const container = document.getElementById("historyList");
    if (!container) return;
    
    if (donationHistory.length === 0) {
        container.innerHTML = `<div class="history-item" style="justify-content: center;">
            <div class="history-text">
                <span>No donations yet</span>
                <p>Your donation history will appear here</p>
            </div>
        </div>`;
        return;
    }
    
    let html = "";
    for (let i = 0; i < donationHistory.length; i++) {
        let item = donationHistory[i];
        html += 
            `<div class="history-item">
                <img src="${item.icon}" class="icon-blood">
                <div class="history-text">
                    <span>${item.date}</span>
                    <p>${item.hospital}</p>
                </div>
            </div>`;
    }
    container.innerHTML = html;
}

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

function resetBloodContainer() {
    const bloodContainer = document.querySelector('.value');
    const dropdown = document.getElementById('bloodDropdown');
    
    if (dropdown) dropdown.style.display = 'none';
    
    if (bloodContainer) {
        bloodContainer.style.border = "none";
        bloodContainer.style.borderRadius = "0";
        bloodContainer.style.backgroundColor = "transparent";
        bloodContainer.style.zIndex = "";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const penIcon = document.querySelector('.pen-icon');
    const bloodContainer = document.getElementById('bloodValueContainer'); // تأكد من إضافة هذا الـ ID في الـ HTML

    if (penIcon && bloodContainer) {
        // إنشاء القائمة مرة واحدة فقط عند تحميل الصفحة
        let bloodDropdown = document.createElement('div');
        bloodDropdown.id = 'bloodDropdown';
        bloodDropdown.style.cssText = `
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: white;
            border: 2px solid #D97775;
            border-radius: 0 0 10px 10px;
            box-shadow: 0px 8px 16px rgba(0,0,0,0.1);
            z-index: 9999;
        `;

        const types = [['O+', 'O-'], ['A+', 'A-'], ['B+', 'B-'], ['AB+', 'AB-']];
        
        let tableHTML = `<table style="width:100%; border-collapse: collapse;">`;
        types.forEach(row => {
            tableHTML += `<tr>`;
            row.forEach(type => {
                tableHTML += `
                    <td onclick="selectBloodType('${type}')" 
                        style="padding: 15px; text-align: center; color: #D97775; font-weight: bold; border: 1px solid #eee; cursor: pointer;"
                        onmouseover="this.style.backgroundColor='#D97775'; this.style.color='white'"
                        onmouseout="this.style.backgroundColor='white'; this.style.color='#D97775'">
                        ${type}
                    </td>`;
            });
            tableHTML += `</tr>`;
        });
        tableHTML += `</table>`;
        
        bloodDropdown.innerHTML = tableHTML;
        bloodContainer.appendChild(bloodDropdown);

        // عند الضغط على أيقونة القلم
        penIcon.onclick = function(e) {
            e.stopPropagation();
            const isOpen = bloodDropdown.style.display === 'block';
            bloodDropdown.style.display = isOpen ? 'none' : 'block';
        };

        document.addEventListener('click', () => {
            bloodDropdown.style.display = 'none';
        });
    }
});

function selectBloodType(type) {
    const bloodDisplay = document.querySelector('.value strong');
    const topBadge = document.querySelector('.blood-badge');
    const bloodContainer = document.querySelector('.value');

    // تغيير النص المعروض
    if (bloodDisplay) bloodDisplay.innerText = type;
    if (topBadge) topBadge.innerText = type;

    // ✅ نفس الوظيفة اللي تستخدمها عند الضغط على القلم مرة ثانية
    closeBloodDropdown();
    
    console.log("Selected Blood Type:", type);
}
function closeBloodDropdown() {
    const bloodDropdown = document.getElementById('bloodDropdown');
    const bloodContainer = document.querySelector('.value');
    
    if (bloodDropdown && bloodDropdown.style.display === 'block') {
        bloodDropdown.style.display = 'none';
        
        if (bloodContainer) {
            // ✅ يرجع التصميم كيما كان قبل ما نضغط على القلم
            bloodContainer.style.border = "none";
            bloodContainer.style.borderRadius = "0";
            bloodContainer.style.backgroundColor = "transparent";
            bloodContainer.style.zIndex = "";
        }
    }
}

function setupDonorInfoEdit() {
    const editBtn = document.querySelector('.edit-btn-small');
    const personalCard = document.getElementById('personalCard');
    const topName = document.getElementById('topName');
    const topLocationSpan = document.getElementById('topLocation');

    if (!editBtn || !personalCard) {
        console.error("Edit button or personal card not found");
        return;
    }

    let isEditing = false;

    editBtn.onclick = async function() {
        const rows = personalCard.querySelectorAll('.data-row');
        
        if (!isEditing) {
            // EDIT MODE: تحويل النصوص إلى حقول إدخال
            rows.forEach(row => {
                const valueSpan = row.querySelector('span:last-child');
                const label = row.querySelector('span:first-child').innerText.toLowerCase();
                
                // 👉 التحقق من أن هذا هو حقل الموقع
                if (label.includes("location")) {
                    // الحصول على رقم الولاية المخزن في data-wilaya-id
                    const wilayaId = document.getElementById("location").getAttribute("data-wilaya-id");
                    // التأكد من وجود الرقم وعرضه بدلاً من الاسم
                    if (wilayaId && wilayaId !== "Unknown") {
                        valueSpan.innerHTML = `<input type="text" value="${wilayaId}" style="border:1px solid #ddd; width:100%; padding: 5px;">`;
                    } else {
                        // إذا لم يكن هناك رقم نعرض النص الحالي كحل بديل
                        const currentText = valueSpan.innerText;
                        valueSpan.innerHTML = `<input type="text" value="${currentText.replace(/"/g, '&quot;')}" style="border:1px solid #ddd; width:100%; padding: 5px;">`;
                    }
                } else {
                    // باقي الحقول تبقى كما هي
                    const currentText = valueSpan.innerText;
                    valueSpan.innerHTML = `<input type="text" value="${currentText.replace(/"/g, '&quot;')}" style="border:1px solid #ddd; width:100%; padding: 5px;">`;
                }
            });
            this.innerHTML = "Save";
            isEditing = true;
        } else {
            
            const updatedData = {};
            let locationInputValue = "";
            
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
                    if (label.includes("birth")) {
                        updatedData.date_of_birth = newValue;
                    }
                    if (label.includes("phone")) {
                        updatedData.telephon = newValue;
                    }
                    if (label.includes("email")) {
                        updatedData.email = newValue;
                    }
                    if (label.includes("location")) {
                        locationInputValue = newValue;
                    }
                }
            });
            
            // تحويل قيمة الموقع إلى رقم (1-58)
            let wilayaNumber = null;
            if (locationInputValue) {
                const asNumber = parseInt(locationInputValue, 10);
                if (!isNaN(asNumber) && asNumber >= 1 && asNumber <= 58) {
                    wilayaNumber = asNumber;
                } else {
                    const index = wilayas.findIndex(w => w.toLowerCase() === locationInputValue.toLowerCase());
                    if (index !== -1) {
                        wilayaNumber = index + 1;
                    } else {
                        alert("Invalid location. Please enter a valid wilaya number (1-58) or name.");
                        return;
                    }
                }
                updatedData.location = wilayaNumber;
            }
            
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


// Add this to your donor-profile.js
// Inside donor-profile.js
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
        
        const sessionData = {
            userId: id,
            userName: name,
            userEmail: email,
            userBlood: bloodType,
            userPic: profilePic
        };
        localStorage.setItem('currentUserSession', JSON.stringify(sessionData));
        window.location.href = 'log-out.html';
    });
}

async function saveBloodType(newType) {
    const session = JSON.parse(localStorage.getItem("currentUserSession"));
    const userId = session?.userId;
    if (!userId) {
        console.error("No userId found");
        return;
    }
    try {
        const response = await fetch(`http://localhost:3000/donors/update/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blood_type: newType })
        });
        if (response.ok) {
            console.log("Blood type saved:", newType);
        } else {
            const errText = await response.text();
            console.error("Failed to save blood type:", errText);
        }
    } catch (err) {
        console.error("Error saving blood type:", err);
    }
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

document.addEventListener('DOMContentLoaded', function() {
    const penIcon = document.querySelector('.pen-icon');
    const bloodContainer = penIcon ? penIcon.closest('.value') : null;

    if (penIcon && bloodContainer) {
        bloodContainer.style.position = 'relative';

        let bloodDropdown = document.createElement('div');
        bloodDropdown.id = 'bloodDropdown';
        bloodDropdown.style.cssText = `
            display: none;
            position: absolute;
            top: 100%; 
            left: -1px; 
            width: calc(100% + 2px); 
            background: white;
            border: 1px solid black; 
            border-radius: 0 0 10px 10px;
            box-shadow: 0px 4px 10px rgba(0,0,0,0.1);
            z-index: 10000;
            overflow: hidden;
            box-sizing: border-box;
        `;

        bloodDropdown.innerHTML = `
            <table style="width:100%; border-collapse: collapse; table-layout: fixed; border-style: hidden;">
                <tr style="cursor: pointer;">
                    <td class="blood-item" onclick="selectBloodType('O+')" style="padding: 18px 10px; text-align: center; color: #D97775; font-weight: bold; border-right: 1px solid black; border-bottom: 1px solid black; transition: all 0.2s;">O+</td>
                    <td class="blood-item" onclick="selectBloodType('O-')" style="padding: 18px 10px; text-align: center; color: #D97775; font-weight: bold; border-bottom: 1px solid black; transition: all 0.2s;">O-</td>
                </tr>
                <tr style="cursor: pointer;">
                    <td class="blood-item" onclick="selectBloodType('A+')" style="padding: 18px 10px; text-align: center; color: #D97775; font-weight: bold; border-right: 1px solid black; border-bottom: 1px solid black; transition: all 0.2s;">A+</td>
                    <td class="blood-item" onclick="selectBloodType('A-')" style="padding: 18px 10px; text-align: center; color: #D97775; font-weight: bold; border-bottom: 1px solid black; transition: all 0.2s;">A-</td>
                </tr>
                <tr style="cursor: pointer;">
                    <td class="blood-item" onclick="selectBloodType('B+')" style="padding: 18px 10px; text-align: center; color: #D97775; font-weight: bold; border-right: 1px solid black; border-bottom: 1px solid black; transition: all 0.2s;">B+</td>
                    <td class="blood-item" onclick="selectBloodType('B-')" style="padding: 18px 10px; text-align: center; color: #D97775; font-weight: bold; border-bottom: 1px solid black; transition: all 0.2s;">B-</td>
                </tr>
                <tr style="cursor: pointer;">
                    <td class="blood-item" onclick="selectBloodType('AB+')" style="padding: 18px 10px; text-align: center; color: #D97775; font-weight: bold; border-right: 1px solid black; transition: all 0.2s;">AB+</td>
                    <td class="blood-item" onclick="selectBloodType('AB-')" style="padding: 18px 10px; text-align: center; color: #D97775; font-weight: bold; transition: all 0.2s;">AB-</td>
                </tr>
            </table>
        `;
        bloodContainer.appendChild(bloodDropdown);

        const items = bloodDropdown.querySelectorAll('.blood-item');
        items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#D97775';
                item.style.color = 'white';
            });
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'white';
                item.style.color = '#D97775';
            });
        });

        penIcon.onclick = function(e) {
            e.stopPropagation();
            const isVisible = bloodDropdown.style.display === 'block';

            if (!isVisible) {
                bloodDropdown.style.display = 'block';
                bloodContainer.style.border = "1px solid black";
                bloodContainer.style.borderBottom = "none";
                bloodContainer.style.borderRadius = "10px 10px 0 0";
                bloodContainer.style.backgroundColor = "white";
                bloodContainer.style.zIndex = "10001";
            } else {
                closeBloodDropdown();
            }
        };

        document.addEventListener('click', function(e) {
            if (!bloodContainer.contains(e.target)) {
                closeBloodDropdown();
            }
        });
    }

    function closeBloodDropdown() {
        if (bloodDropdown && bloodDropdown.style.display === 'block') {
            bloodDropdown.style.display = 'none';
            bloodContainer.style.border = "none";
            bloodContainer.style.borderRadius = "0";
            bloodContainer.style.backgroundColor = "transparent";
            bloodContainer.style.zIndex = "";
        }
    }
});


function resetBloodContainer() {
    const bloodContainer = document.querySelector('.value');
    const dropdown = document.getElementById('bloodDropdown');
    
    if (dropdown) dropdown.style.display = 'none';
    
    if (bloodContainer) {
        bloodContainer.style.border = "none";
        bloodContainer.style.borderRadius = "0";
        bloodContainer.style.backgroundColor = "transparent";
        bloodContainer.style.zIndex = "";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const penIcon = document.querySelector('.pen-icon');
    const bloodContainer = document.getElementById('bloodValueContainer'); // تأكد من إضافة هذا الـ ID في الـ HTML

    if (penIcon && bloodContainer) {
        // إنشاء القائمة مرة واحدة فقط عند تحميل الصفحة
        let bloodDropdown = document.createElement('div');
        bloodDropdown.id = 'bloodDropdown';
        bloodDropdown.style.cssText = `
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: white;
            border: 2px solid #D97775;
            border-radius: 0 0 10px 10px;
            box-shadow: 0px 8px 16px rgba(0,0,0,0.1);
            z-index: 9999;
            overflow: hidden;
        `;

        const types = [['O+', 'O-'], ['A+', 'A-'], ['B+', 'B-'], ['AB+', 'AB-']];
        
        let tableHTML = `<table style="width:100%; border-collapse: collapse;">`;
        types.forEach(row => {
            tableHTML += `<tr>`;
            row.forEach(type => {
                tableHTML += `
                    <td onclick="selectBloodType('${type}')" 
                        style="padding: 15px; text-align: center; color: #D97775; font-weight: bold; border: 1px solid #eee; cursor: pointer;"
                        onmouseover="this.style.backgroundColor='#D97775'; this.style.color='white'"
                        onmouseout="this.style.backgroundColor='white'; this.style.color='#D97775'">
                        ${type}
                    </td>`;
            });
            tableHTML += `</tr>`;
        });
        tableHTML += `</table>`;
        
        bloodDropdown.innerHTML = tableHTML;
        bloodContainer.appendChild(bloodDropdown);

        // عند الضغط على أيقونة القلم
        penIcon.onclick = function(e) {
            e.stopPropagation();
            const isOpen = bloodDropdown.style.display === 'block';
            bloodDropdown.style.display = isOpen ? 'none' : 'block';
        };

        // إغلاق القائمة عند الضغط في أي مكان خارجها
        document.addEventListener('click', () => {
            bloodDropdown.style.display = 'none';
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    showDonations();
    setupPhotoEdit();
    setupDonorInfoEdit();   // دالة تعديل المعلومات الشخصية
    setupFooterHover();
    setupLogout();
    loadDonorData();  
});