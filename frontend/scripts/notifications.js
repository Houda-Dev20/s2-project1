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
    if (elements.list) {
        elements.list.addEventListener('click', (e) => {
            const item = e.target.closest('.notif-item');
            if (!item) return;

            const type = item.getAttribute('data-type');
            
            // Only open modal if it's a Request
            if (type === "REQUEST") {
                if (elements.modal) elements.modal.style.display = 'flex';
                if (elements.dropdown) elements.dropdown.classList.remove('active');
            }
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