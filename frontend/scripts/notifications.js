// frontend/scripts/notifications.js

// عناصر DOM
const elements = {
    list: document.getElementById('notifList'),
    badge: document.getElementById('notifBadge'),
    dropdown: document.getElementById('notifDropdown'),
    empty: document.getElementById('emptyState'),
    markBtn: document.getElementById('markReadBtn'),
    modal: document.getElementById('notifModal'),
    modalName: document.getElementById('modalName'),
    notifBtn: document.getElementById('notifBtn')
};

// دالة للحصول على المستخدم الحالي من localStorage
function getCurrentUser() {
    const raw = localStorage.getItem("currentUserSession");
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch(e) {
        return null;
    }
}

// جلب الإشعارات من الخادم
async function fetchNotifications() {
    const user = getCurrentUser();
    if (!user || !user.userId) {
        console.warn("No user logged in, cannot fetch notifications.");
        return;
    }
    const userId = user.userId;
    try {
        const response = await fetch(`http://localhost:3000/notifications/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch notifications");
        const data = await response.json();
        renderNotifications(data);
        updateUnreadCount(data);
    } catch (err) {
        console.error("Error fetching notifications:", err);
    }
}

// تحديث عدد الإشعارات غير المقروءة
function updateUnreadCount(notificationsArray) {
    const count = notificationsArray.filter(n => !n.is_read).length;
    if (elements.badge) {
        if (count > 0) {
            elements.badge.style.display = 'block';
            elements.badge.textContent = count > 99 ? '99+' : count;
        } else {
            elements.badge.style.display = 'none';
        }
    }
}

// عرض الإشعارات في القائمة المنسدلة
function renderNotifications(notifications) {
    if (!elements.list) return;

    if (!notifications || notifications.length === 0) {
        elements.list.innerHTML = "";
        if (elements.empty) elements.empty.style.display = 'flex';
        if (elements.markBtn) elements.markBtn.style.display = 'none';
        return;
    }

    if (elements.empty) elements.empty.style.display = 'none';
    if (elements.markBtn) elements.markBtn.style.display = 'block';

    elements.list.innerHTML = notifications.map(notif => `
        <div class="notif-item" data-id="${notif.id}" data-read="${notif.is_read}">
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

// دالة بسيطة لمنع XSS (اختياري)
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// تحديد إشعار كمقروء
async function markAsRead(notifId) {
    try {
        const response = await fetch(`http://localhost:3000/notifications/read/${notifId}`, {
            method: 'PUT'
        });
        if (response.ok) {
            fetchNotifications(); // إعادة تحميل القائمة
        }
    } catch (err) {
        console.error(err);
    }
}

// تحديد كل الإشعارات كمقروءة
async function markAllAsRead() {
    const user = getCurrentUser();
    if (!user || !user.userId) return;
    try {
        const response = await fetch(`http://localhost:3000/notifications/read-all/${user.userId}`, {
            method: 'PUT'
        });
        if (response.ok) {
            fetchNotifications();
        }
    } catch (err) {
        console.error(err);
    }
}

// إظهار/إخفاء القائمة المنسدلة
function toggleDropdown(e) {
    e.stopPropagation();
    if (elements.dropdown) elements.dropdown.classList.toggle('active');
    // عند فتح القائمة، نجلب الإشعارات الجديدة
    if (elements.dropdown.classList.contains('active')) {
        fetchNotifications();
    }
}

// إغلاق القائمة عند النقر خارجها
document.addEventListener('click', (e) => {
    if (elements.dropdown && !elements.dropdown.contains(e.target) && e.target !== elements.notifBtn) {
        elements.dropdown.classList.remove('active');
    }
});

// معالج النقر على زر الجرس
if (elements.notifBtn) {
    elements.notifBtn.addEventListener('click', toggleDropdown);
}

// معالج النقر على زر "Mark all as read"
if (elements.markBtn) {
    elements.markBtn.addEventListener('click', markAllAsRead);
}

// تفعيل النقر على عنصر الإشعار لتحديده كمقروء
if (elements.list) {
    elements.list.addEventListener('click', async (e) => {
        const item = e.target.closest('.notif-item');
        if (item) {
            const notifId = item.getAttribute('data-id');
            const isRead = item.getAttribute('data-read') === '1';
            if (!isRead) {
                await markAsRead(notifId);
            }
        }
    });
}