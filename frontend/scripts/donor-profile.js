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

async function uploadProfilePictureToServer(file) {
    const user = JSON.parse(localStorage.getItem("currentUserSession"));
    if (!user?.userId) return false;
    const formData = new FormData();
    formData.append('profilePicture', file);
    try {
        const response = await fetch(`http://localhost:3000/donors/upload-picture/${user.userId}`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }
        const data = await response.json();
        const avatarImg = document.querySelector('.main-avatar');
        const headerImg = document.querySelector('.profile-img');
        const newSrc = 'http://localhost:3000' + data.pictureUrl + '?t=' + Date.now();
        if (avatarImg) avatarImg.src = newSrc;
        if (headerImg) headerImg.src = newSrc;
        user.profilePicture = data.pictureUrl;
        localStorage.setItem('currentUserSession', JSON.stringify(user));
        broadcastProfilePictureUpdate(data.pictureUrl);
        console.log('Profile picture saved to server!');
        return true;
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Failed to upload picture: ' + error.message, 'error');
        return false;
    }
}

async function loadProfilePictureFromServer() {
    const user = JSON.parse(localStorage.getItem("currentUserSession"));
    const avatarImg = document.querySelector('.main-avatar');
    const headerImg = document.querySelector('.profile-img');
    if (!user?.userId || (!avatarImg && !headerImg)) return;
    try {
        const response = await fetch(`http://localhost:3000/get-profile-picture/${user.userId}/donor`);
        if (!response.ok) return;
        const data = await response.json();
        if (data.pictureUrl) {
            const newSrc = 'http://localhost:3000' + data.pictureUrl + '?t=' + Date.now();
            if (avatarImg) avatarImg.src = newSrc;
            if (headerImg) headerImg.src = newSrc;
            user.profilePicture = data.pictureUrl;
            localStorage.setItem('currentUserSession', JSON.stringify(user));
        }
    } catch (error) {
        console.error('Failed to load profile picture:', error);
    }
}

function broadcastProfilePictureUpdate(pictureUrl) {
    const user = JSON.parse(localStorage.getItem("currentUserSession"));
    if (user) {
        user.profilePicture = pictureUrl;
        localStorage.setItem('currentUserSession', JSON.stringify(user));
    }
    localStorage.setItem('profilePictureUpdated', Date.now().toString());
    setTimeout(() => localStorage.removeItem('profilePictureUpdated'), 100);
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
        allDonationsData = donations.map(d => {
            let formattedDate = "";
            if (d.donation_date) {
                const dateObj = new Date(d.donation_date);
                formattedDate = `${dateObj.getDate().toString().padStart(2,"0")}/${(dateObj.getMonth()+1).toString().padStart(2,"0")}/${dateObj.getFullYear()}`;
            }
            return {
                date: formattedDate,
                hospital: d.Hospital_name || "Hospital not specified",
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

async function loadDonorData() {
    const user = JSON.parse(localStorage.getItem("currentUserSession"));
    if (user && user.userType !== "donor") {
        showToast("This page is for donors only. Please log out and log in as a donor.", 'error');
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
        fetchDonationHistory(user.userId);
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
                                showToast('Account reactivated. Please log in again.', 'success');
                                setTimeout(() => {
                                    localStorage.removeItem('currentUserSession');
                                    window.location.href = 'login.html';
                                }, 1500);
                            } else {
                                showToast('Failed to reactivate account.', 'error');
                            }
                        }
                    };
                } else {
                    deactivateItem.setAttribute('href', 'deactivate.html');
                }
            }
        }
        if (data.profile_picture) {
            const avatarImg = document.querySelector('.main-avatar');
            const headerImg = document.querySelector('.profile-img');
            const newSrc = 'http://localhost:3000' + data.profile_picture + '?t=' + Date.now();
            if (avatarImg) avatarImg.src = newSrc;
            if (headerImg) headerImg.src = newSrc;
        }
    } catch (error) {
        console.error("Error loading donor:", error);
        showToast("Failed to load profile data. Please make sure the server is running.", 'error');
    }
}

function setupPhotoEdit() {
    const editBtn = document.querySelector('.btn-edit');
    const avatarImg = document.querySelector('.main-avatar');
    const headerImg = document.querySelector('.profile-img');
    if (!editBtn || !avatarImg) return;
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg,image/png,image/gif';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    editBtn.onclick = () => fileInput.click();
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            avatarImg.style.opacity = '0.5';
            if (headerImg) headerImg.style.opacity = '0.5';
            await uploadProfilePictureToServer(file);
            avatarImg.style.opacity = '1';
            if (headerImg) headerImg.style.opacity = '1';
            fileInput.value = '';
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
    if (!editBtn || !personalCard) return;
    let isEditing = false;
    editBtn.onclick = async function() {
        const rows = personalCard.querySelectorAll('.data-row');
        if (!isEditing) {
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
                    if (label.includes("name")) { updatedData.full_name = newValue; if (topName) topName.innerText = newValue; }
                    if (label.includes("birth")) updatedData.date_of_birth = newValue;
                    if (label.includes("phone")) updatedData.telephon = newValue;
                    if (label.includes("email") && newValue !== originalEmail) { emailChanged = true; newEmailValue = newValue; }
                    if (label.includes("location")) locationInputValue = newValue;
                }
            });
            if (emailChanged) {
                const session = JSON.parse(localStorage.getItem("currentUserSession"));
                const userId = session?.userId;
                if (!userId) { showToast("User not found", 'error'); return; }
                try {
                    const res = await fetch(`http://localhost:3000/donors/request-email-change/${userId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ new_email: newEmailValue })
                    });
                    if (!res.ok) throw new Error(await res.text());
                    showToast("Verification code sent to your new email.", 'success');
                    setTimeout(() => {
                        window.location.href = `verificationCode.html?email=${encodeURIComponent(newEmailValue)}&type=email-change&userId=${userId}&role=donor`;
                    }, 1500);
                    return;
                } catch(err) {
                    showToast("Error requesting email change: " + err.message, 'error');
                    return;
                }
            }
            let wilayaNumber = null;
            if (locationInputValue) {
                const asNumber = parseInt(locationInputValue, 10);
                if (!isNaN(asNumber) && asNumber >= 1 && asNumber <= 58) {
                    wilayaNumber = asNumber;
                } else {
                    const index = wilayas.findIndex(w => w.toLowerCase() === locationInputValue.toLowerCase());
                    if (index !== -1) wilayaNumber = index + 1;
                    else { showToast("Invalid location. Please enter a valid wilaya number (1-58) or name.", 'error'); return; }
                }
                updatedData.location = wilayaNumber;
            }
            delete updatedData.email;
            const session = JSON.parse(localStorage.getItem("currentUserSession"));
            const userId = session?.userId;
            if (!userId) { showToast("User not found, please login again.", 'error'); return; }
            try {
                const response = await fetch(`http://localhost:3000/donors/update/${userId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedData)
                });
                if (!response.ok) throw new Error(await response.text());
                await loadDonorData();
            } catch (err) {
                showToast("Failed to update profile: " + err.message, 'error');
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
        localStorage.setItem('currentUserSession', JSON.stringify({ userId: id, userName: name, userEmail: email, userBlood: bloodType, userPic: profilePic }));
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

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed; bottom: 30px; right: 30px;
        background: ${type === 'success' ? '#4CAF50' : '#E8433A'};
        color: white; padding: 14px 24px; border-radius: 10px;
        font-family: Inter, sans-serif; font-size: 15px;
        z-index: 99999; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

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

    const readyToggle = document.getElementById('readyToggle');
    const readySub = document.getElementById('readySubtext');
    if (readyToggle) {
        readyToggle.addEventListener('change', async () => {
            const isReady = readyToggle.checked;
            if (isReady) {
                const user = JSON.parse(localStorage.getItem("currentUserSession"));
                if (user?.userId) {
                    try {
                        const profileRes = await fetch(`http://localhost:3000/donors/profile/${user.userId}`);
                        const profileData = await profileRes.json();
                        if (profileData.last_donation_date) {
                            const lastDonation = new Date(profileData.last_donation_date);
                            const now = new Date();
                            const daysDiff = Math.floor((now - lastDonation) / (1000 * 60 * 60 * 24));
                            if (daysDiff < 90) {
                                const daysLeft = 90 - daysDiff;
                                readyToggle.checked = false;
                                showToast(`You cannot donate yet. ${daysLeft} days remaining until you can donate again.`, 'error');
                                return;
                            }
                        }
                    } catch (err) { console.error(err); }
                }
            }
            readySub.textContent = isReady ? 'You are visible to patients' : 'You are not visible to patients right now';
            const user = JSON.parse(localStorage.getItem("currentUserSession"));
            if (user?.userId) {
                try {
                    await fetch(`http://localhost:3000/donors/update-availability/${user.userId}`, {
                        method: "PUT",
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ available: isReady ? 1 : 0 })
                    });
                } catch(e) { console.error(e); }
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    await loadProfilePictureFromServer();
    setupPhotoEdit();
    setupDonorInfoEdit();
    setupFooterHover();
    setupLogout();
    loadDonorData();
});