<<<<<<< HEAD
﻿// frontend/scripts/notifications.js

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
=======
/**
 * 1. IDENTITY & CONFIGURATION
 */
const LOGGED_IN_USER = localStorage.getItem('userEmail') || "SaraBoussife06@gmail.com"; 

const defaultData = [
    {
        id: 1,
        type: "REQUEST",
        title: "NEW DONATION REQUEST",
        desc: "Sara Helmi requests to donate O+ for you.",
        time: "2 min ago",
        icon: "images/Frame 170.svg",
        colorClass: "red-bg",
        targetEmail: "SaraBoussife06@gmail.com"
    },
    {
        id: 2,
        type: "ACCEPT",
        title: "YOUR REQUEST WAS ACCEPTED",
        desc: "Abd El-Malek Zerarga accepted your donate request.",
        time: "2 hours ago",
        icon: "images/Frame 171.svg",
        colorClass: "green-bg",
        targetEmail: "donor@test.com"
    }
];

let notifications = JSON.parse(localStorage.getItem('myNotifications')) || defaultData;

/**
 * 2. DOM ELEMENTS
 */
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

/**
 * 3. DYNAMIC NOTIFICATION GENERATOR
 */

function addNotification(type, name = "", bloodType = "") {
    let config = {};

    // Determine state based on type
    switch (type) {
        case "REQUEST":
            config = {
                title: "NEW DONATION REQUEST",
                desc: `${name} requests to donate ${bloodType} for you.`,
                icon: "images/Frame 170.svg",
                colorClass: "red-bg",
                target: "SaraBoussife06@gmail.com" // Sent to Patient
            };
            break;
        case "ACCEPT":
            config = {
                title: "YOUR REQUEST WAS ACCEPTED",
                desc: `${name} accepted your donate request.`,
                icon: "images/Frame 171.svg",
                colorClass: "green-bg",
                target: "donor@test.com" // Sent to Donor
            };
            break;
        case "NEARBY":
            config = {
                title: "NEARBY PATIENT FOUND",
                desc: "Someone you can donate to is near you.",
                icon: "images/Frame 172.svg",
                colorClass: "yellow-bg",
                target: LOGGED_IN_USER
            };
            break;
        case "ELIGIBLE":
            config = {
                title: "YOU’RE ELIGIBLE TO DONATE",
                desc: "90 days have passed since your last donation.",
                icon: "images/Frame 173.svg",
                colorClass: "pink-bg",
                target: LOGGED_IN_USER
            };
            break;
    }

    const newNotif = {
        id: Date.now(),
        type: type,
        ...config,
        time: "Just now",
        targetEmail: config.target
    };

    notifications.unshift(newNotif);
    saveAndRender();
}

/**
 * 4. UI RENDERER
 */

function saveAndRender() {
    localStorage.setItem('myNotifications', JSON.stringify(notifications));
    renderNotifications();
}

function renderNotifications() {
    if (!elements.list) return;

    const myNotifs = notifications.filter(n => n.targetEmail === LOGGED_IN_USER);

    if (elements.badge) elements.badge.style.display = myNotifs.length > 0 ? 'block' : 'none';

    if (myNotifs.length === 0) {
        elements.list.innerHTML = "";
        if (elements.empty) elements.empty.style.display = 'flex';
        if (elements.markBtn) elements.markBtn.style.display = 'none';
        return;
    }

    if (elements.empty) elements.empty.style.display = 'none';
    if (elements.markBtn) elements.markBtn.style.display = 'block';
    
    elements.list.innerHTML = myNotifs.map(n => `
        <div class="notif-item" data-id="${n.id}" data-type="${n.type}">
            <div class="icon-circle ${n.colorClass}">
                <img src="${n.icon}" alt="icon">
            </div>
            <div class="notif-content">
                <span class="notif-title">${n.title}</span>
                <p class="notif-desc">${n.desc}</p>
                <span class="notif-time">${n.time}</span>
            </div>
        </div>
    `).join('');
}

/**
 * 5. EVENT LISTENERS
 */
document.addEventListener('DOMContentLoaded', () => {
    renderNotifications();

    // DONOR CLICK
    const donateBtn = document.querySelector('.btn-donate');
    if (donateBtn) {
        donateBtn.onclick = () => {
            const donorName = elements.modalName?.innerText || "Abd El-Malek Zerarga";
            addNotification("REQUEST", donorName, "A+");
            if (elements.dropdown) elements.dropdown.classList.add('active');
        };
    }

    // PATIENT ACCEPT
    const acceptBtn = document.getElementById('acceptBtn');
    if (acceptBtn) {
        acceptBtn.onclick = () => {
            addNotification("ACCEPT", "Sara Boussife");
            if (elements.modal) elements.modal.style.display = 'none';
        };
    }

    // LIST CLICK (Interaction based on state)
   // LIST CLICK (Zero HTML changes)
if (elements.list) {
    elements.list.addEventListener('click', (e) => {
        const item = e.target.closest('.notif-item');
        if (!item) return;

        const type = item.getAttribute('data-type');
        
        // Target existing classes since we aren't adding IDs
        const modalTitle = document.querySelector('.modal-title');
        const modalMsg = document.querySelector('.modal-msg');
        const acceptBtn = document.querySelector('.btn-accept');

        if (type === "REQUEST") {
            modalTitle.innerText = "DONOR MATCH FOUND!";
            modalMsg.innerText = "Hello, I am nearby and I can be at EPSP";
            acceptBtn.innerText = "Accept Request";
        } 
        else if (type === "ACCEPT") {
            modalTitle.innerText = "PATIENT WANTS YOUR HELP!!";
            modalMsg.innerText = "Hello, I am nearby and I need blood.";
            acceptBtn.innerText = "Accept Request"; 
        }

        if (elements.modal) elements.modal.style.display = 'flex';
        if (elements.dropdown) elements.dropdown.classList.remove('active');
    });
}

    // DROPDOWN & MARK READ
    if (elements.notifBtn) {
        elements.notifBtn.onclick = (e) => {
            e.stopPropagation();
            elements.dropdown.classList.toggle('active');
        };
    }

    if (elements.markBtn) {
        elements.markBtn.onclick = () => {
            notifications = notifications.filter(n => n.targetEmail !== LOGGED_IN_USER);
            saveAndRender();
        };
    }

    // Close Modal Logic
    const closeX = document.getElementById('closeModal');
    if (closeX) closeX.onclick = () => elements.modal.style.display = 'none';
});
>>>>>>> fec63f1219b24b90e943cda1ba90e2614902c1d0
