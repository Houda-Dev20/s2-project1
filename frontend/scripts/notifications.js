// دالة تحويل التاريخ إلى "منذ X دقيقة/ساعة/يوم"
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
}

// قائمة الولايات لتحويل الرقم إلى اسم (للمودال)
function getWilayaNameById(id) {
    const wilayasList = [
        "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Bejaia","Biskra","Bechar",
        "Blida","Bouira","Tamanrasset","Tebessa","Tlemcen","Tiaret","Tizi Ouzou","Algiers",
        "Djelfa","Jijel","Setif","Saida","Skikda","Sidi Bel Abbes","Annaba","Guelma",
        "Constantine","Medea","Mostaganem","Msila","Mascara","Ouargla","Oran","El Bayadh",
        "Illizi","Bordj Bou Arreridj","Boumerdes","El Tarf","Tindouf","Tissemsilt",
        "El Oued","Khenchela","Souk Ahras","Tipaza","Mila","Ain Defla","Naama",
        "Ain Temouchent","Ghardaia","Relizane","Timimoun","Bordj Badji Mokhtar","Ouled Djellal",
        "Beni Abbes","In Salah","In Guezzam","Touggourt","Djanet","El M'Ghair","El Meniaa"
    ];
    const idx = parseInt(id) - 1;
    return (idx >= 0 && idx < wilayasList.length) ? wilayasList[idx] : "Unknown";
}

// frontend/scripts/notifications.js

const elements = {
    list: document.getElementById('notifList'),
    badge: document.getElementById('notifBadge'),
    dropdown: document.getElementById('notifDropdown'),
    empty: document.getElementById('emptyState'),
    markBtn: document.getElementById('markReadBtn'),
    modal: document.getElementById('notifModal'),
    modalName: document.getElementById('modalName'),
    modalLocation: document.getElementById('modalLocation'),
    modalMsg: document.querySelector('.modal-msg'),
    modalTitle: document.querySelector('.modal-title'),
    acceptBtn: document.querySelector('.btn-accept'),
    notifBtn: document.getElementById('notifBtn')
};

function getCurrentUser() {
    const raw = localStorage.getItem("currentUserSession");
    if (!raw) return null;
    try { return JSON.parse(raw); } catch(e) { return null; }
}

// تحديث روابط البحث
function updateSearchLinks() {
    const user = getCurrentUser();
    const searchNav = document.querySelector('.middle-section .taps[href="search.html"]');
    const searchFooter = document.querySelector('.elm-div .elm[href="search.html"]');
    if (user && user.userType === 'searcher') {
        if (searchNav) searchNav.href = 'search_donor.html';
        if (searchFooter) searchFooter.href = 'search_donor.html';
    } else {
        if (searchNav) searchNav.href = 'search.html';
        if (searchFooter) searchFooter.href = 'search.html';
    }
}

async function fetchNotifications() {
    const user = getCurrentUser();
    if (!user?.userId) return;
    try {
        const res = await fetch(`http://localhost:3000/notifications/${user.userId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        renderNotifications(data);
        updateUnreadCount(data);
    } catch (err) { console.error(err); }
}

function updateUnreadCount(notifications) {
    const count = notifications.filter(n => !n.is_read).length;
    if (elements.badge) {
        elements.badge.style.display = count > 0 ? 'block' : 'none';
        elements.badge.textContent = count > 99 ? '99+' : count;
    }
}

function renderNotifications(notifications) {
    if (!elements.list) return;
    const user = getCurrentUser();
    const isDonor = user?.userType === 'donor';
    let filtered = notifications; // عرض كل الإشعارات (المقروء وغير المقروء)
    if (isDonor) {
        filtered = filtered.filter(n => n.type === 'request_accepted' || n.type === 'eligibility' || n.type === 'donor_help_request');
    } else if (user?.userType === 'searcher') {
        filtered = filtered.filter(n => n.type === 'donation_request' || n.type === 'patient_accepted');
    }

    if (!filtered.length) {
        elements.list.innerHTML = "";
        if (elements.empty) elements.empty.style.display = 'flex';
        if (elements.markBtn) elements.markBtn.style.display = 'none';
        return;
    }
    elements.empty.style.display = 'none';
    elements.markBtn.style.display = 'block';
    elements.list.innerHTML = filtered.map(notif => `
        <div class="notif-item" data-id="${notif.id}" data-type="${notif.type}" data-donation-id="${notif.donation_id || ''}" data-read="${notif.is_read}">
            <div class="icon-circle ${notif.type === 'donation_request' ? 'red-bg' : 'green-bg'}">
                <img src="images/${notif.type === 'donation_request' ? 'Frame 170.svg' : 'Frame 171.svg'}" alt="icon">
            </div>
            <div class="notif-content">
                <span class="notif-title">${escapeHtml(notif.title)}</span>
                <p class="notif-desc">${escapeHtml(notif.message)}</p>
                <span class="notif-time">${getTimeAgo(notif.created_at)}</span>
            </div>
        </div>
    `).join('');
}

function escapeHtml(str) { return str?.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])) || ''; }

async function markAsRead(notifId) {
    try {
        await fetch(`http://localhost:3000/notifications/read/${notifId}`, { method: 'PUT' });
        fetchNotifications();
    } catch(e) {}
}

async function markAllAsRead() {
    const user = getCurrentUser();
    if (!user?.userId) return;
    try {
        await fetch(`http://localhost:3000/notifications/read-all/${user.userId}`, { method: 'PUT' });
        fetchNotifications();
    } catch(e) {}
}

function toggleDropdown(e) {
    e.stopPropagation();
    elements.dropdown?.classList.toggle('active');
    if (elements.dropdown?.classList.contains('active')) fetchNotifications();
}

if (elements.list) {
    elements.list.addEventListener('click', async (e) => {
        const item = e.target.closest('.notif-item');
        if (!item) return;
        const id = item.dataset.id;
        const isRead = item.dataset.read === '1';
        const notifType = item.dataset.type;
        const donationId = item.dataset.donationId;
        if (!isRead) await markAsRead(id);
        if (notifType === 'donation_request' && elements.modal) {
    // هذا الإشعار يصل للمحتاج (طلب من متبرع) -> المحتاج هو من سيقبل
    elements.modal.style.display = 'flex';
    if (elements.acceptBtn) {
        const newAcceptBtn = elements.acceptBtn.cloneNode(true);
        elements.acceptBtn.parentNode.replaceChild(newAcceptBtn, elements.acceptBtn);
        elements.acceptBtn = newAcceptBtn;
        elements.acceptBtn.onclick = async () => {
            if (donationId) {
                try {
                    // استخدم المسار الخاص بقبول المحتاج لطلب المتبرع
                    const res = await fetch(`http://localhost:3000/donations/accept-by-searcher/${donationId}`, { method: 'POST' });
                    if (res.ok) {
                        alert("Donation accepted! The donor has been notified with your phone number.");
                        elements.modal.style.display = 'none';
                        fetchNotifications(); // تحديث الإشعارات
                    } else {
                        alert("Failed to accept donation.");
                    }
                } catch(e) { alert("Error"); }
            } else alert("Donation ID missing.");
            elements.modal.style.display = 'none';
        };
    }
} else if (notifType === 'donor_help_request') {
    // هذا الإشعار يصل للمتبرع (طلب من محتاج) -> المتبرع هو من سيقبل
    let donationId = item.dataset.donationId;
    console.log("donationId from dataset:", donationId);
    if (!donationId) {
        console.warn("donationId missing, trying to fetch from notification details...");
        alert("Invalid donation request: missing donation ID. Please contact support.");
        return;
    }
    try {
        const donationRes = await fetch(`http://localhost:3000/donations/${donationId}`);
        if (!donationRes.ok) throw new Error("Failed to load donation details");
        const donation = await donationRes.json();
        const searcherId = donation.id_searcher;
        // جلب بيانات المحتاج
        const searcherRes = await fetch(`http://localhost:3000/searchers/profile/${searcherId}`);
        if (!searcherRes.ok) throw new Error("Failed to load searcher data");
        const searcher = await searcherRes.json();

        if (elements.modal) {
            elements.modal.style.display = 'flex';
            if (elements.modalTitle) elements.modalTitle.innerText = "PATIENT REQUEST";
            if (elements.modalName) elements.modalName.innerText = searcher.full_name;
            if (elements.modalLocation) elements.modalLocation.innerText = getWilayaNameById(searcher.location) || "Unknown";
            if (elements.modalMsg) elements.modalMsg.innerText = `Needs ${searcher.blood_type_research} blood. Hospital: ${searcher.Hospital_name || "Not specified"}. Urgent: ${searcher.is_urgent ? "Yes" : "No"}`;
            if (elements.acceptBtn) {
                const newAcceptBtn = elements.acceptBtn.cloneNode(true);
                elements.acceptBtn.parentNode.replaceChild(newAcceptBtn, elements.acceptBtn);
                elements.acceptBtn = newAcceptBtn;
                elements.acceptBtn.onclick = async () => {
                    try {
                        // استخدم المسار الخاص بقبول المتبرع لطلب المحتاج
                        const acceptRes = await fetch(`http://localhost:3000/donations/accept-by-donor/${donationId}`, { method: 'POST' });
                        if (acceptRes.ok) {
                            alert("Donation accepted. Patient has been notified with your phone number.");
                            elements.modal.style.display = 'none';
                            fetchNotifications(); // تحديث القائمة
                        } else {
                            alert("Failed to accept donation.");
                        }
                    } catch(e) { alert("Error accepting donation."); }
                };
            }
        }
    } catch (err) {
        console.error("Error loading patient details:", err);
        alert("Could not load patient details.");
    }


        } else if (notifType === 'eligibility') {
            if (confirm("90 days have passed. Do you want to reactivate your account?")) {
                const user = getCurrentUser();
                if (user?.userId) {
                    const res = await fetch(`http://localhost:3000/donors/active/${user.userId}`, { method: 'POST' });
                    if (res.ok) {
                        alert("Account reactivated. You can now donate again.");
                        fetchNotifications();
                    } else alert("Failed to reactivate.");
                }
            }
        }
    });
}

if (elements.notifBtn) elements.notifBtn.addEventListener('click', toggleDropdown);
if (elements.markBtn) elements.markBtn.addEventListener('click', markAllAsRead);
document.addEventListener('click', (e) => {
    if (elements.dropdown && !elements.dropdown.contains(e.target) && e.target !== elements.notifBtn) {
        elements.dropdown.classList.remove('active');
    }
});
if (document.getElementById('closeModal')) {
    document.getElementById('closeModal').onclick = () => { if (elements.modal) elements.modal.style.display = 'none'; };
}

// تحديث الروابط عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', updateSearchLinks);











