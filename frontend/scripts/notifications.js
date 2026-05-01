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
    let filtered = notifications.filter(n => !n.is_read); 
    if (isDonor) {
        filtered = filtered.filter(n => n.type === 'request_accepted' || n.type === 'eligibility');    } else if (user?.userType === 'searcher') {
        filtered = filtered.filter(n => n.type === 'donation_request');
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
                <span class="notif-time">${new Date(notif.created_at).toLocaleString()}</span>
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
        const response = await fetch(`http://localhost:3000/notifications/read-all/${user.userId}`, { method: 'PUT' });
        console.log("Mark all response status:", response.status);
        const data = await response.json();
        console.log("Mark all response data:", data);
        if (response.ok) {
            fetchNotifications();
        } else {
            console.error("Failed to mark all as read:", data);
        }
    } catch(e) {
        console.error("Error in markAllAsRead:", e);
    }
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
            elements.modal.style.display = 'flex';
            if (elements.acceptBtn) {
                const newAcceptBtn = elements.acceptBtn.cloneNode(true);
                elements.acceptBtn.parentNode.replaceChild(newAcceptBtn, elements.acceptBtn);
                elements.acceptBtn = newAcceptBtn;
                elements.acceptBtn.onclick = async () => {
                    if (donationId) {
                        try {
                            const res = await fetch(`http://localhost:3000/donations/accept/${donationId}`, { method: 'POST' });
                            if (res.ok) alert("Donation accepted! The donor has been notified.");
                            else alert("Failed to accept donation.");
                        } catch(e) { alert("Error"); }
                    } else {
                        alert("Donation ID missing.");
                    }
                    elements.modal.style.display = 'none';
                };
            }
        }
        else if (notifType === 'eligibility') {
    if (confirm("90 days have passed. Do you want to reactivate your account?")) {
        const user = getCurrentUser();
        if (user?.userId) {
            const res = await fetch(`http://localhost:3000/donors/active/${user.userId}`, { method: 'POST' });
            if (res.ok) {
                alert("Account reactivated. You can now donate again.");
                fetchNotifications();
            } else {
                alert("Failed to reactivate.");
            }
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




