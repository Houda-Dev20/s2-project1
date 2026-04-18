let donationHistory = [
    { date: "12 Feb 2026", hospital: "Al-Nafis Hospital", icon: "images/Blur.svg" },
    { date: "03 June 2025", hospital: "Mustafa Hospital", icon: "images/Blur.svg" },
    { date: "03 Mar 2025", hospital: "Maillot Hospital", icon: "images/Blur.svg" }
];

function showDonations() {
    const container = document.getElementById("historyList");
    if (!container) return;
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

function setupInfoEdit() {
    const editBtn = document.querySelector('.edit-btn-small');
    const personalCard = document.getElementById('personalCard');
    
    const topName = document.getElementById('topName');
    const topLocation = document.getElementById('topLocation');

    if (!editBtn || !personalCard) return;
    
    let isEditing = false;
    
    editBtn.onclick = function() {
        const rows = personalCard.querySelectorAll('.data-row');
        
        if (!isEditing) {
            rows.forEach(row => {
                const valueSpan = row.querySelector('span:last-child');
                const currentText = valueSpan.innerText;
                valueSpan.innerHTML = `<input type="text" value="${currentText}" style="border:1px solid #ddd; width:100%; padding: 2px;">`;
            });
            this.innerHTML = "Save";
            isEditing = true;
        } else {
            rows.forEach((row, index) => {
                const input = row.querySelector('input');
                const valueSpan = row.querySelector('span:last-child');
                const label = row.querySelector('span:first-child').innerText.toLowerCase();

                if (input) {
                    const newValue = input.value;
                    valueSpan.innerText = newValue;

                    if (label.includes("name") && topName) {
                        topName.innerText = newValue;
                    }
                    if (label.includes("location") && topLocation) {
                        topLocation.innerText = newValue;
                    }
                }
            });
            
            this.innerHTML = `<img src="images/VectorPen.svg" class="icon-small"> Edit`;
            isEditing = false;
        }
    };
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

document.addEventListener('DOMContentLoaded', function() {
    const bloodDropdown = document.createElement('div');
    bloodDropdown.id = 'bloodDropdown';
    bloodDropdown.style.cssText = `
        display: none;
        position: absolute;
        background: white;
        border: 0.25px solid black;
        border-top: none; 
        border-radius: 0 0 10px 10px; /* تم التعديل لـ 10px */
        box-shadow: 0px 4px 10px rgba(0,0,0,0.05);
        z-index: 1000;
        overflow: hidden;
   ` ;

    bloodDropdown.innerHTML = `
        <table style="width:100%; border-collapse: collapse; table-layout: fixed;">
            <tr>
                <td onclick="selectBloodType('O+')" style="padding: 8px 20px; text-align: left; color: #D97775; font-weight: bold; border-right: 0.25px solid black; border-bottom: 0.25px solid black; cursor: pointer;">O+</td>
                <td onclick="selectBloodType('O-')" style="padding: 8px 20px; text-align: left; color: #D97775; font-weight: bold; border-bottom: 0.25px solid black; cursor: pointer;">O-</td>
            </tr>
            <tr>
                <td onclick="selectBloodType('A+')" style="padding: 8px 20px; text-align: left; color: #D97775; font-weight: bold; border-right: 0.25px solid black; border-bottom: 0.25px solid black; cursor: pointer;">A+</td>
                <td onclick="selectBloodType('A-')" style="padding: 8px 20px; text-align: left; color: #D97775; font-weight: bold; border-bottom: 0.25px solid black; cursor: pointer;">A-</td>
            </tr>
            <tr>
                <td onclick="selectBloodType('B+')" style="padding: 8px 20px; text-align: left; color: #D97775; font-weight: bold; border-right: 0.25px solid black; border-bottom: 0.25px solid black; cursor: pointer;">B+</td>
                <td onclick="selectBloodType('B-')" style="padding: 8px 20px; text-align: left; color: #D97775; font-weight: bold; border-bottom: 0.25px solid black; cursor: pointer;">B-</td>
            </tr>
            <tr>
                <td onclick="selectBloodType('AB+')" style="padding: 8px 20px; text-align: left; color: #D97775; font-weight: bold; border-right: 0.25px solid black; cursor: pointer;">AB+</td>
                <td onclick="selectBloodType('AB-')" style="padding: 8px 20px; text-align: left; color: #D97775; font-weight: bold; cursor: pointer;">AB-</td>
            </tr>
        </table>
    `;
    document.body.appendChild(bloodDropdown);

    const penIcon = document.querySelector('.pen-icon');
    const bloodContainer = penIcon ? penIcon.closest('.value') : null;

    if (penIcon && bloodContainer) {
        penIcon.onclick = function(e) {
            e.stopPropagation();
            let rect = bloodContainer.getBoundingClientRect();
            
            bloodContainer.style.border = "0.25px solid black";
            bloodContainer.style.borderBottomLeftRadius = "0";
            bloodContainer.style.borderBottomRightRadius = "0";
            bloodContainer.style.borderTopLeftRadius = "10px";
            bloodContainer.style.borderTopRightRadius = "10px";

            bloodDropdown.style.width = rect.width + 'px';
            bloodDropdown.style.top = (rect.bottom + window.scrollY) + 'px';
            bloodDropdown.style.left = (rect.left + window.scrollX) + 'px';
            bloodDropdown.style.display = 'block';
        };
    }

    document.addEventListener('click', function() {
        const dropdown = document.getElementById('bloodDropdown');
        if (dropdown && dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
            resetBloodContainer();
        }
    });
});

function selectBloodType(type) {
    const bloodValueText = document.querySelector('.value strong');
    const topBadge = document.querySelector('.blood-badge');
if (bloodValueText) bloodValueText.innerText = type;
    if (topBadge) topBadge.innerText = type;

    document.getElementById('bloodDropdown').style.display = 'none';
    resetBloodContainer();
}

function resetBloodContainer() {
    const bloodContainer = document.querySelector('.value');
    if (bloodContainer) {
        bloodContainer.removeAttribute('style');
       
    }
}
document.addEventListener('DOMContentLoaded', () => {
    showDonations();
    setupPhotoEdit();
    setupInfoEdit();
    setupFooterHover();

});
// Add this to your donor-profile.js
// Inside donor-profile.js
const logoutBtn = document.querySelector('.logout-item'); // Matches your HTML class

if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        const name = document.getElementById('topName').innerText;
        // Specifically grab the badge updated by selectBloodType()
        const bloodType = document.querySelector('.blood-badge').innerText;
        const profilePic = document.querySelector('.main-avatar').src;
        
        // Find email by looking for the label
        let email = "";
        const rows = document.querySelectorAll('.data-row');
        rows.forEach(row => {
            if(row.innerText.toLowerCase().includes('email')) {
                email = row.querySelector('span:last-child').innerText;
            }
        });

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