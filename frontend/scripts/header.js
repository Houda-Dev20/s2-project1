// header.js - shared script for all pages
// Handles: 1) profile photo in header, 2) profile button navigation, 3) home page header switching

document.addEventListener('DOMContentLoaded', function () {
    const session = getSession();
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';

    // ======= HOME PAGE: switch header based on login status =======
    if (currentPage === 'home.html') {
        const rightSection = document.querySelector('.right-section');
        if (rightSection) {
            if (session) {
                // User is logged in — replace Login/Join with bell + profile photo
                rightSection.innerHTML = `
                    <div class="notif-wrapper">
                        <button class="notif-trigger" id="notifBtn">
                            <img class="bell-img" src="images/bell.svg" alt="notifications">
                            <div class="red-dot" id="notifBadge"></div>
                        </button>
                        <div class="dropdown-container" id="notifDropdown">
                            <div id="notifList"></div>
                            <button class="mark-read-btn" id="markReadBtn">Mark all as read</button>
                            <div class="empty-state" id="emptyState">
                                <div class="check-icon-large">
                                    <img class="large-notif-img" src="images/gg_check-o.svg" alt="caught-up">
                                </div>
                                <h3 class="empty-title">You're All Caught Up</h3>
                                <p class="empty-desc">No new notifications for now</p>
                            </div>
                        </div>
                    </div>
                    <button class="profile" id="profile">
                        <img class="profile-img" src="" alt="profile-picture">
                    </button>
                `;
            }
            // if not logged in, keep Login/Join as is
        }
    }

    // ======= ALL PAGES: load profile photo from session =======
    const profileImg = document.querySelector('.profile-img');
    if (profileImg && session) {
        if (session.userPic && session.userPic !== '' && !session.userPic.endsWith('undefined')) {
            profileImg.src = session.userPic;
        } else if (session.userName) {
            // fallback to generated avatar with initials
            profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(session.userName)}&background=FDECEA&color=E8433A&size=128`;
        }
    }

    // ======= ALL PAGES: profile button → navigate to profile page =======
    const profileBtn = document.getElementById('profile');
    if (profileBtn && session) {
        profileBtn.addEventListener('click', function () {
            if (session.userType === 'donor') {
                window.location.href = 'donor-profile.html';
            } else if (session.userType === 'searcher') {
                window.location.href = 'patient-profile.html';
            }
        });
        profileBtn.style.cursor = 'pointer';
    }
});

function getSession() {
    try {
        const raw = localStorage.getItem('currentUserSession');
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}
// داخل header.js
document.addEventListener('DOMContentLoaded', function () {
    const session = JSON.parse(localStorage.getItem('currentUserSession'));

    if (session) {
        const profileImg = document.querySelector('.profile-img');
        if (profileImg) {
            // جلب الصورة المحدثة من السيرفر أو استخدام الصورة المخزنة في الجلسة
            // نستخدم session.userPic الذي قمنا بتحديثه في الخطوة السابقة
            if (session.userPic) {
                profileImg.src = session.userPic;
            } else {
                // صورة افتراضية في حال عدم وجود صورة
                profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(session.userName)}&background=FDECEA&color=E8433A`;
            }
        }
    }
});