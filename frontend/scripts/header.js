// header.js - shared script for all pages
// Handles: 1) profile photo in header, 2) profile button navigation, 3) home page header switching

document.addEventListener('DOMContentLoaded', function () {
    const session = getSession();
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';

    // ======= HOME PAGE =======
    if (currentPage === 'home.html') {
        const rightSection = document.querySelector('.right-section');
        if (rightSection) {
            if (session) {
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
            // إذا لم يكن مسجلاً → يبقى Login/Join كما هو في HTML
        }
    }

if (currentPage !== 'home.html' && !session) {
    const rightSection = document.querySelector('.right-section');
    if (rightSection) {
        rightSection.style.width = '330px';
        rightSection.style.display = 'flex';
        rightSection.style.alignItems = 'center';
        rightSection.style.gap = '10px';
        rightSection.style.overflow = 'visible';
        rightSection.style.marginRight = '30px';
        rightSection.innerHTML = `
            <a href="login.html" style="
                border: 1px solid #C65C54;
                color: #C65C54;
                background: #FFF8F8;
                padding: 0 20px;
                width: 154px;
                height: 62px;
                border-radius: 227px;
                font-family: Arial, sans-serif;
                font-size: 23px;
                text-decoration: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            ">Log in</a>
<button onclick="document.getElementById('joinModal').classList.add('open')" style="
    background: #C65C54;
    color: white;
    padding: 0 20px;
    width: 154px;
    height: 62px;
    border-radius: 227px;
    font-family: Arial, sans-serif;
    font-size: 23px;
    border: none;
    cursor: pointer;
">Join</button>
        `;
    }

if (!document.getElementById('joinModal')) {
    const modalHtml = `
        <div id="joinModal" class="modal" style="z-index: 99999;">
            <div class="modal-inner" style="z-index: 100000; position: relative;">
                <div class="joindiv" style="position:relative; display:flex; justify-content:center; align-items:center;">
                   <p class="jointext">How would you like to join?</p>
                   <button onclick="document.getElementById('joinModal').classList.remove('open')" class="close-modal" style="position:absolute; top:12px; right:15px;">×</button>
                </div>
                <div class="donor">
                    <div class="heart">
                        <img class="heartpic" src="images/ri_heart-add-fill.svg" alt="heart">
                    </div>
                    <div class="donortxt">
                        <p class="request">I Want To Give</p>
                        <p class="help">help others by giving them blood</p>
                        <form action="donor-signup.html">
                            <button class="donorbtn">Become a Donor</button>
                        </form>
                    </div>
                </div>
                <div class="searcher">
                    <div class="hand">
                        <img class="handpic" src="images/solar_hand-heart-linear.svg" alt="need help">
                    </div>
                    <div class="searchertxt">
                        <p class="request">I Need help</p>
                        <p class="help">help others by giving them blood</p>
                        <form action="request-blood.html">
                            <button class="searcherbtn">Request Help</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // أضف CSS الخاص بالـ popup
    if (!document.querySelector('link[href*="popup.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'styles/popup.css';
        document.head.appendChild(link);
    }
}
}

const searchPages = ['search.html', 'search_donor.html'];
if (searchPages.includes(currentPage) && !session) {
    // أخفِ الفلاتر
    const filters = document.querySelector('.filters');
    if (filters) filters.style.display = 'none';

    // أظهر الرسالة في المنتصف
    const cardsGrid = document.querySelector('.cards-grid');
    if (cardsGrid) {
        cardsGrid.style.justifyContent = 'center';
        cardsGrid.style.alignItems = 'center';
        cardsGrid.style.height = '300px';
        cardsGrid.innerHTML = `
            <div style="text-align:center; font-family: Inter, sans-serif;">
                <p style="font-size:18px; color:#7A7A7A; margin-bottom:12px;">You must be logged in to search.</p>
                <a href="login.html" style="color:#E8433A; font-weight:600; font-size:16px;">Login here</a>
            </div>`;
    }
}

    // ======= ALL PAGES: load profile photo =======
    const profileImg = document.querySelector('.profile-img');
    if (profileImg && session) {
        if (session.userPic && session.userPic !== '' && !session.userPic.endsWith('undefined')) {
            profileImg.src = session.userPic;
        } else if (session.userName) {
            profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(session.userName)}&background=FDECEA&color=E8433A&size=128`;
        }
    }

    // ======= ALL PAGES: profile button =======
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