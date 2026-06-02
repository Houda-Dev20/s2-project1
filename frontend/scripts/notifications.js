// دالة تحويل التاريخ إلى "منذ X دقيقة/ساعة/يوم"
function getTimeAgo(dateString) {
    const dateStr = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 0) return "Just now"; // إذا كان الوقت في المستقبل بسبب timezone
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
let filtered = notifications;
if (isDonor) {
    filtered = filtered.filter(n => 
        n.type === 'request_accepted' || 
        n.type === 'donation_offer_accepted' || 
        n.type === 'eligibility' || 
        n.type === 'donor_help_request' ||
        n.type === 'donation_completed' ||
        n.type === 'donation_failed' ||
        n.type === 'nearby_patient'
    );
} else if (user?.userType === 'searcher') {
    filtered = filtered.filter(n => 
        n.type === 'donation_request' || 
        n.type === 'patient_accepted' ||
        n.type === 'donation_completed' ||
        n.type === 'donation_failed'
    );
}

    if (!filtered.length) {
        elements.list.innerHTML = "";
        if (elements.empty) elements.empty.style.display = 'flex';
        if (elements.markBtn) elements.markBtn.style.display = 'none';
        return;
    }
    elements.empty.style.display = 'none';
    elements.markBtn.style.display = 'block';
elements.list.innerHTML = filtered.map(notif => {
let iconBg = 'green-bg';
let iconImg = 'Frame 171.svg';

if (notif.type === 'donation_request' || notif.type === 'donor_help_request') {
    iconBg = 'red-bg';
    iconImg = 'Frame 170.svg';
} else if (notif.type === 'donation_completed') {
    iconBg = 'green-bg';
    iconImg = 'Frame 171.svg';
} else if (notif.type === 'donation_failed') {
    iconBg = '';
    iconImg = 'Frame 170.svg';
} else if (notif.type === 'nearby_patient') {
    iconBg = 'nearby-bg';
    iconImg = 'Frame 172.svg'; 
} else if (notif.type === 'eligibility') {
    iconBg = 'eligibility-bg';
    iconImg = 'Frame 173.svg'; 
}

    return `
        <div class="notif-item ${notif.is_read ? 'read' : 'unread'}" 
             data-id="${notif.id}" 
             data-type="${notif.type}" 
             data-donation-id="${notif.donation_id || ''}" 
             data-read="${notif.is_read}">
            <div class="icon-circle ${iconBg}" ${notif.type === 'donation_failed' ? 'style="background-color:#888;"' : ''}>
                <img src="images/${iconImg}" alt="icon">
            </div>
            <div class="notif-content">
                <span class="notif-title">${escapeHtml(notif.title)}</span>
                <p class="notif-desc">${escapeHtml(notif.message)}</p>
                <span class="notif-time">${getTimeAgo(notif.created_at)}</span>
            </div>
        </div>
    `;
}).join('');
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
    // جلب بيانات المتبرع
    const donationRes = await fetch(`http://localhost:3000/donations/${donationId}`);
    const donation = await donationRes.json();
    const donorId = donation.id_donor;
    
    const donorRes = await fetch(`http://localhost:3000/donors/profile/${donorId}`);
    const donor = await donorRes.json();
    
    // تحديث الـ modal
    if (elements.modalTitle) elements.modalTitle.innerText = "DONOR MATCH FOUND!";
    if (elements.modalName) elements.modalName.innerText = donor.full_name;
    if (elements.modalLocation) elements.modalLocation.innerText = getWilayaNameById(donor.location) || "Unknown";
    if (elements.modalMsg) elements.modalMsg.innerText = "Hello, I am nearby and I can help you.";

    // صورة المتبرع
    const modalImg = document.getElementById('modalImg');
    if (modalImg) {
        if (donor.profile_picture) {
            modalImg.src = 'http://localhost:3000' + donor.profile_picture;
            modalImg.style.display = 'block';
        } else {
            // أظهر الحروف الأولى
            modalImg.style.display = 'none';
            const donorInfo = document.querySelector('.donor-info');
            if (donorInfo) {
                const existing = donorInfo.querySelector('.initials-circle');
                if (!existing) {
                    const initials = donor.full_name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
                    const circle = document.createElement('div');
                    circle.className = 'initials-circle';
                    circle.style.cssText = `
                        width: 50px; height: 50px; border-radius: 50%;
                        background: #FDECEA; color: #E8433A;
                        display: flex; align-items: center; justify-content: center;
                        font-weight: bold; font-size: 18px; font-family: Inter, sans-serif;
                        flex-shrink: 0;
                    `;
                    circle.innerText = initials;
                    donorInfo.insertBefore(circle, donorInfo.firstChild);
                }
            }
        }
    }
    // ... باقي كود القبول    // هذا الإشعار يصل للمحتاج (طلب من متبرع) -> المحتاج هو من سيقبل
elements.modal.style.display = 'flex';

const existingX = elements.modal.querySelector('.modal-close-x');
if (!existingX) {
    const xBtn = document.createElement('button');
    xBtn.className = 'modal-close-x';
    xBtn.innerHTML = '✕';
    xBtn.style.cssText = `
        position: absolute; top: 12px; right: 16px;
        background: none; border: none; font-size: 20px;
        cursor: pointer; color: #888; z-index: 10;
    `;
    xBtn.onclick = () => { elements.modal.style.display = 'none'; };
    elements.modal.querySelector('.frame-33').style.position = 'relative';
    elements.modal.querySelector('.frame-33').appendChild(xBtn);
}

// ✅ تغيير زر Cancel إلى Delete
const cancelBtn = elements.modal.querySelector('.btn-cancel');
if (cancelBtn) {
cancelBtn.textContent = 'Delete';
cancelBtn.style.backgroundColor = 'white';
cancelBtn.style.color = '#E8433A';
cancelBtn.style.border = '1px solid #E8433A';
    cancelBtn.onclick = async () => {
showConfirm("Are you sure you want to delete this request?", async () => {
                try {
                const res = await fetch(`http://localhost:3000/donations/${donationId}/cancel`, { method: 'POST' });
                if (res.ok) {
                    elements.modal.style.display = 'none';
                    fetchNotifications();
                } else {
                    showToast("Failed to delete request.", 'error');
                }
            } catch(e) { showToast("Something went wrong.", 'error'); }
        })
    };
}

if (elements.acceptBtn) {
    const newAcceptBtn = elements.acceptBtn.cloneNode(true);
    elements.acceptBtn.parentNode.replaceChild(newAcceptBtn, elements.acceptBtn);
    elements.acceptBtn = newAcceptBtn;
    elements.acceptBtn.onclick = async () => {
        if (donationId) {
            try {
                const res = await fetch(`http://localhost:3000/donations/${donationId}/accept-by-searcher`, { method: 'POST' });
                if (res.ok) {
showToast("Donation accepted! The donor has been notified with your phone number.", 'success');
                    elements.modal.style.display = 'none';
                    fetchNotifications();
                } else {
                    showToast("Failed to accept donation.", 'error');
                }
            } catch(e) { showToast("Something went wrong.", 'error') }
        } else showToast("Donation ID missing.", 'error')
        elements.modal.style.display = 'none';
    };
}
} else if (notifType === 'donor_help_request') {
    // هذا الإشعار يصل للمتبرع (طلب من محتاج) -> المتبرع هو من سيقبل
    let donationId = item.dataset.donationId;
    console.log("donationId from dataset:", donationId);
    if (!donationId) {
        console.warn("donationId missing, trying to fetch from notification details...");
showToast("Invalid donation request: missing donation ID. Please contact support.", 'error');        return;
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
            // ✅ زر X
            syncModalWithHeaderImage(); 
const existingX2 = elements.modal.querySelector('.modal-close-x');
if (!existingX2) {
    const xBtn2 = document.createElement('button');
    xBtn2.className = 'modal-close-x';
    xBtn2.innerHTML = '✕';
    xBtn2.style.cssText = `
        position: absolute; top: 12px; right: 16px;
        background: none; border: none; font-size: 20px;
        cursor: pointer; color: #888; z-index: 10;
    `;
    xBtn2.onclick = () => { elements.modal.style.display = 'none'; };
    elements.modal.querySelector('.frame-33').style.position = 'relative';
    elements.modal.querySelector('.frame-33').appendChild(xBtn2);
}

// ✅ زر Delete للمتبرع (يحذف الطلب ويبقى available = 0)
const cancelBtn2 = elements.modal.querySelector('.btn-cancel');
if (cancelBtn2) {
cancelBtn2.textContent = 'Delete';
cancelBtn2.style.backgroundColor = 'white';
cancelBtn2.style.color = '#E8433A';
cancelBtn2.style.border = '1px solid #E8433A';
    cancelBtn2.onclick = async () => {
showConfirm("Are you sure you want to delete this request?", async () => {
            try {
                const res = await fetch(`http://localhost:3000/donations/${donationId}/cancel`, { method: 'POST' });
                if (res.ok) {
                    elements.modal.style.display = 'none';
                    fetchNotifications();
                    // ✅ available يبقى 0 — لا نغيره هنا
                } else {
                    showToast("Failed to delete request.", 'error');
                }
            } catch(e) { showToast("Something went wrong.", 'error'); }
           })
        }
    };

            if (elements.modalTitle) elements.modalTitle.innerText = "PATIENT WANTS YOUR HELP!";
            if (elements.modalName) elements.modalName.innerText = searcher.full_name;
            if (elements.modalLocation) elements.modalLocation.innerText = getWilayaNameById(searcher.location) || "Unknown";
            if (elements.modalMsg) elements.modalMsg.innerText = "Hello, I am nearby and I need blood.";
            const modalImg = document.getElementById('modalImg');
if (modalImg) {
    if (searcher.profile_picture) {
        modalImg.src = 'http://localhost:3000' + searcher.profile_picture;
    } else {
        modalImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(searcher.full_name)}&background=FDECEA&color=E8433A&size=128`;
    }
}
            if (elements.acceptBtn) {
                const newAcceptBtn = elements.acceptBtn.cloneNode(true);
                elements.acceptBtn.parentNode.replaceChild(newAcceptBtn, elements.acceptBtn);
                elements.acceptBtn = newAcceptBtn;
                elements.acceptBtn.onclick = async () => {
                    try {
                        // استخدم المسار الخاص بقبول المتبرع لطلب المحتاج
                        const acceptRes = await fetch(`http://localhost:3000/donations/${donationId}/accept-by-donor`, { method: 'POST' });
                        if (acceptRes.ok) {
showToast("Donation accepted! Patient has been notified with your phone number.", 'success');                 
         elements.modal.style.display = 'none';
                            fetchNotifications(); // تحديث القائمة
                        } else {
                            showToast("Failed to accept donation.", 'error')
                        }
                    } catch(e) { showToast("Something went wrong.", 'error'); }
                };
            }
        }
    } catch (err) {
        console.error("Error loading patient details:", err);
        showToast("Could not load patient details.", 'error');
    }
} else if (notifType === 'donation_offer_accepted') {
    const donationId = item.dataset.donationId;
    if (!donationId) { showToast("Donation ID missing.", 'error'); return; }

   try {
        const checkRes = await fetch(`http://localhost:3000/donations/${donationId}`);
        const checkData = await checkRes.json();
        if (checkData.status === 'completed') {
            showToast("This donation has already been confirmed as completed.", 'success');
            return;
        }
        if (checkData.status === 'failed') {
            showToast("This donation was already reported as not completed.", 'error');
            return;
        }
    } catch(e) { console.error(e); }

    const existing = document.getElementById('completionOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'completionOverlay';
    overlay.style.cssText = `
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.4);
        display: flex; align-items: center; justify-content: center;
        z-index: 999999;
    `;
    overlay.innerHTML = `
        <div style="
            background: white; border-radius: 16px;
            padding: 32px 28px; width: 340px;
            text-align: center; box-shadow: 0 8px 30px rgba(0,0,0,0.15);
            font-family: Inter, sans-serif;
        ">
            <h3 style="font-size: 18px; color: #1A1A1A; margin-bottom: 10px;">Did the donation happen?</h3>
            <p style="font-size: 14px; color: #7A7A7A; margin-bottom: 24px;">Please confirm whether the donation took place.</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button id="btnFailed" style="
                    padding: 10px 20px; border-radius: 8px;
                    border: 1px solid #ddd; background: white;
                    color: #555; cursor: pointer; font-size: 14px;
                ">Did Not Happen</button>
                <button id="btnCompleted" style="
                    padding: 10px 20px; border-radius: 8px;
                    border: none; background: #4CAF50;
                    color: white; cursor: pointer; font-size: 14px;
                ">Donation Completed</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('btnCompleted').onclick = async () => {
        try {
            const res = await fetch(`http://localhost:3000/donations/${donationId}/complete`, { method: 'POST' });
            if (res.ok) {
                overlay.remove();
                showToast("Donation confirmed! Thank you for saving a life.", 'success');
                fetchNotifications();
            } else { showToast("Failed to confirm donation.", 'error'); }
        } catch(e) { showToast("Something went wrong.", 'error'); }
    };

    document.getElementById('btnFailed').onclick = async () => {
        try {
            const res = await fetch(`http://localhost:3000/donations/${donationId}/fail`, { method: 'POST' });
            if (res.ok) {
                overlay.remove();
                showToast("Recorded. The patient will be notified.", 'success');
                fetchNotifications();
            } else { showToast("Failed to record.", 'error'); }
        } catch(e) { showToast("Something went wrong.", 'error'); }
    };

    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
} else if (notifType === 'request_accepted') {
    // يصل فقط للمتبرع — هو من يؤكد إتمام التبرع
    const donationId = item.dataset.donationId;
    if (!donationId) {
        showToast("Donation ID missing.", 'error');
        return;
    }

        try {
        const checkRes = await fetch(`http://localhost:3000/donations/${donationId}`);
        const checkData = await checkRes.json();
        if (checkData.status === 'completed') {
            showToast("This donation has already been confirmed as completed.", 'success');
            return;
        }
        if (checkData.status === 'failed') {
            showToast("This donation was already reported as not completed.", 'error');
            return;
        }
    } catch(e) { console.error(e); }

    const existing = document.getElementById('completionOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'completionOverlay';
    overlay.style.cssText = `
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.4);
        display: flex; align-items: center; justify-content: center;
        z-index: 999999;
    `;
    overlay.innerHTML = `
        <div style="
            background: white; border-radius: 16px;
            padding: 32px 28px; width: 340px;
            text-align: center; box-shadow: 0 8px 30px rgba(0,0,0,0.15);
            font-family: Inter, sans-serif;
        ">
            <h3 style="font-size: 18px; color: #1A1A1A; margin-bottom: 10px;">Did the donation happen?</h3>
            <p style="font-size: 14px; color: #7A7A7A; margin-bottom: 24px;">Please confirm whether the donation took place.</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button id="btnFailed" style="
                    padding: 10px 20px; border-radius: 8px;
                    border: 1px solid #ddd; background: white;
                    color: #555; cursor: pointer; font-size: 14px;
                ">Did Not Happen</button>
                <button id="btnCompleted" style="
                    padding: 10px 20px; border-radius: 8px;
                    border: none; background: #4CAF50;
                    color: white; cursor: pointer; font-size: 14px;
                ">Donation Completed</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('btnCompleted').onclick = async () => {
        try {
            const res = await fetch(`http://localhost:3000/donations/${donationId}/complete`, { method: 'POST' });
            if (res.ok) {
                overlay.remove();
                showToast("Donation confirmed! Thank you for saving a life.", 'success');
                fetchNotifications();
            } else {
                showToast("Failed to confirm donation.", 'error');
            }
        } catch(e) { showToast("Something went wrong.", 'error'); }
    };

    document.getElementById('btnFailed').onclick = async () => {
        try {
            const res = await fetch(`http://localhost:3000/donations/${donationId}/fail`, { method: 'POST' });
            if (res.ok) {
                overlay.remove();
                showToast("Recorded. The patient will be notified.", 'success');
                fetchNotifications();
            } else {
                showToast("Failed to record.", 'error');
            }
        } catch(e) { showToast("Something went wrong.", 'error'); }
    };

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
} else if (notifType === 'nearby_patient') {
    const donationId = item.dataset.donationId; // هنا يحمل searcherId
    if (donationId) {
        try {
            const res = await fetch(`http://localhost:3000/searchers/profile/${donationId}`);
            const searcher = await res.json();
            if (searcher.latitude && searcher.longitude) {
                window.location.href = `map.html?lat=${searcher.latitude}&lng=${searcher.longitude}&searcherId=${donationId}`;
            } else {
                window.location.href = 'map.html';
            }
        } catch(e) {
            window.location.href = 'map.html';
        }
    } else {
        window.location.href = 'map.html';
    }
}else if (notifType === 'donation_completed' || notifType === 'donation_failed') {
    showToast(
        notifType === 'donation_completed' 
            ? "This donation has been marked as completed." 
            : "This donation was reported as not completed.",
        notifType === 'donation_completed' ? 'success' : 'error'
    );
} else if (notifType === 'eligibility') {
        const user = getCurrentUser();
    if (user?.userId) {
        const profileRes = await fetch(`http://localhost:3000/donors/profile/${user.userId}`);
        const profileData = await profileRes.json();
        if (profileData.available === 1) {
            showToast("You are already available for donation.", 'success');
            return;
        }
    }
    showConfirm("90 days have passed. Do you want to be available for donation again?", async () => {
        const user = getCurrentUser();
        if (user?.userId) {
            // ← تحديث available = 1 بدل is_active
            const res = await fetch(`http://localhost:3000/donors/update-availability/${user.userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ available: 1 })
            });
            if (res.ok) {
                showToast("You are now available for donation!", 'success');
                fetchNotifications();
    const readyToggle = document.getElementById('readyToggle');
    const readySub = document.getElementById('readySubtext');
    if (readyToggle) readyToggle.checked = true;
    if (readySub) readySub.textContent = 'You are visible to patients';
    
    if (typeof loadDonorData === 'function') loadDonorData();
            } else {
                showToast("Failed to update availability.", 'error');
            }
        }
    }, 'Yes, I am Ready');
};
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

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: ${type === 'success' ? '#4CAF50' : '#E8433A'};
        color: white;
        padding: 14px 24px;
        border-radius: 10px;
        font-family: Inter, sans-serif;
        font-size: 15px;
        z-index: 99999;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showConfirm(message, onConfirm, confirmText = 'Confirm') {
    // إزالة أي confirm موجود
    const existing = document.getElementById('confirmOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'confirmOverlay';
    overlay.style.cssText = `
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.4);
        display: flex; align-items: center; justify-content: center;
        z-index: 999999;
    `;

    overlay.innerHTML = `
        <div style="
            background: white; border-radius: 16px;
            padding: 32px 28px; width: 320px;
            text-align: center; box-shadow: 0 8px 30px rgba(0,0,0,0.15);
            font-family: Inter, sans-serif;
        ">
            <p style="font-size: 16px; color: #333; margin-bottom: 24px;">${message}</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button id="confirmNo" style="
                    padding: 10px 28px; border-radius: 8px;
                    border: 1px solid #ddd; background: white;
                    color: #555; cursor: pointer; font-size: 14px;
                ">Cancel</button>
                <button id="confirmYes" style="
                    padding: 10px 28px; border-radius: 8px;
                    border: none; background: #E8433A;
                    color: white; cursor: pointer; font-size: 14px;
                ">${confirmText}</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('confirmYes').onclick = () => {
        overlay.remove();
        onConfirm();
    };
    document.getElementById('confirmNo').onclick = () => {
        overlay.remove();
    };
}
// تحديث الروابط عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', updateSearchLinks);

// دالة لمزامنة صورة المودال مع صورة الهيدر
function syncModalWithHeaderImage() {
    // الحصول على صورة البروفايل من الهيدر
    const headerProfileImg = document.querySelector('.profile-img');
    if (headerProfileImg && headerProfileImg.src && headerProfileImg.src !== '') {
        // تحديث صورة المودال لتكون نفس صورة الهيدر
        const modalImg = document.getElementById('modalImg');
        if (modalImg) {
            modalImg.src = headerProfileImg.src;
            modalImg.style.display = 'block';
            
            // إخفاء أي دائرة أحرف أولية موجودة في المودال
            const donorInfo = document.querySelector('.donor-info');
            if (donorInfo) {
                const initialsCircle = donorInfo.querySelector('.initials-circle');
                if (initialsCircle) {
                    initialsCircle.style.display = 'none';
                }
            }
        }
    }
}










