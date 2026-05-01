document.addEventListener('DOMContentLoaded', function() {
    // جلب بيانات المستخدم من localStorage
    const userDataStr = localStorage.getItem('currentUserSession');
    let userData = null;
    try {
        userData = JSON.parse(userDataStr);
    } catch(e) {
        console.error("Failed to parse user data", e);
    }

    // عناصر الصفحة
    const nameDisplay = document.querySelector('.user-name');
    const emailDisplay = document.querySelector('.user-email');
    const badgeSpan = document.querySelector('.donor-badge span');
    const avatarContainer = document.querySelector('.avatar-inner');

    // تحديث الاسم
    if (nameDisplay && userData && userData.userName) {
        nameDisplay.innerText = userData.userName;
    } else if (nameDisplay) {
        nameDisplay.innerText = "User";
    }

    // تحديث البريد الإلكتروني
    if (emailDisplay && userData && userData.userEmail) {
        emailDisplay.innerText = userData.userEmail;
    } else if (emailDisplay) {
        emailDisplay.innerText = "No email provided";
    }

    // تحديث شارة فصيلة الدم
    if (badgeSpan && userData && userData.userBlood) {
        badgeSpan.innerText = `${userData.userBlood} Donor`;
    } else if (badgeSpan) {
        badgeSpan.innerText = "Donor";
    }

    // تحديث الصورة (إذا كانت موجودة) أو الأحرف الأولى
    if (avatarContainer) {
        // إذا كانت الصورة موجودة في localStorage (وليست الصورة الافتراضية)
        if (userData && userData.userPic && !userData.userPic.includes('Ellipse')) {
            avatarContainer.innerHTML = `<img src="${userData.userPic}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" alt="Profile">`;
        } else if (userData && userData.userName) {
            // استخراج الأحرف الأولى
            const initials = userData.userName
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
            avatarContainer.innerText = initials;
            avatarContainer.style.display = 'flex';
            avatarContainer.style.alignItems = 'center';
            avatarContainer.style.justifyContent = 'center';
            avatarContainer.style.fontSize = '24px';
            avatarContainer.style.fontWeight = 'bold';
        } else {
            avatarContainer.innerText = '?';
        }
    }
});

// زر تسجيل الخروج وزر الإلغاء
document.addEventListener('DOMContentLoaded', function () {
    const logoutBtn = document.querySelector(".btn-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("currentUserSession");
            alert("Logged out successfully");
            window.location.href = "home.html";
        });
    }

    const cancelBtn = document.querySelector(".btn-cancel1");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            window.history.back();
        });
    }
});
