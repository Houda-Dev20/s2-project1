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
// =========================
// 1. معرفة نوع المستخدم
// =========================

function getUserRole() {
    const session = localStorage.getItem('currentUserSession');
    if (!session) return null;
    try {
        const user = JSON.parse(session);
        if (user.userType) return user.userType;
        if (user.blood_type) return 'donor';
        if (user.blood_type_research) return 'searcher';
        return null;
    } catch(e) { return null; }
}

// =========================
// 2. تهيئة الخريطة (مركز مؤقت)
// =========================
var map = L.map('map', { zoomControl: false }).setView([36.152, 5.690], 13); // سطيف مؤقتاً


// استقبال المعاملات من URL
const urlParams = new URLSearchParams(window.location.search);
const targetWilaya = urlParams.get('wilaya');
const targetLat = parseFloat(urlParams.get('lat'));
const targetLng = parseFloat(urlParams.get('lng'));

let locationRetrieved = false;

if (targetLat && targetLng && !isNaN(targetLat) && !isNaN(targetLng)) {
    // إذا تم تمرير إحداثيات، انتقل إلى هذا الموقع
    setTimeout(() => {
        map.setView([targetLat, targetLng], 12);
        L.marker([targetLat, targetLng]).addTo(map).bindPopup(targetWilaya || "Location").openPopup();
    }, 500);
        locationRetrieved = true;
}

// طبقة الخريطة
L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: 'Map data © Google'
}).addTo(map);

setTimeout(() => { map.invalidateSize(); }, 300);

// =========================
// 3. تحديد الموقع (مرة واحدة فقط، وسيتم تحديث الخريطة إذا نجح)
// =========================
function getAndSetUserLocation() {
    if (locationRetrieved) return;
    if (!navigator.geolocation) {
showToast("Your browser does not support geolocation.", 'error');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            map.setView([lat, lng], 14);
            // إضافة ماركر للمستخدم
            if (window.userMarker) map.removeLayer(window.userMarker);
            window.userMarker = L.marker([lat, lng], {
                icon: L.icon({
                    iconUrl: 'images/VectorLoc.svg',
                    iconSize: [30, 30],
                    popupAnchor: [0, -10]
                })
            }).addTo(map).bindPopup("You are here").openPopup();
            locationRetrieved = true;
            console.log("Location set to:", lat, lng);
            // إعادة حساب المسافات في البوب أب (اختياري)
            refreshDistances();
        },
        (error) => {
            console.warn("Geolocation error:", error.message);
            let msg = "Could not get your location. Click the 📍 button to try again.";
            if (error.code === 1) msg = "Location access denied. Please allow it via the lock icon next to the URL, then click the 📍 button.";
showToast(msg, 'error');
            // إضافة زر تحديد الموقع يظهر بشكل دائم
            addLocationButtonPermanent();
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// وظيفة لتحديث المسافات في البوب أب لكل الماركرات (إذا أردت)
function refreshDistances() {
    const center = map.getCenter();
    map.eachLayer(layer => {
        if (layer instanceof L.Marker && layer !== window.userMarker) {
            const latlng = layer.getLatLng();
            const distance = (center.distanceTo(latlng) / 1000).toFixed(1);
            // تحديث البوب أب - يمكن إعادة ربطه ولكنها معقدة، الأسهل إعادة تحميل البيانات
        }
    });
}

// إضافة زر دائم لتحديد الموقع في حال الفشل
function addLocationButtonPermanent() {
    if (document.getElementById('static-locate-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'static-locate-btn';
    btn.innerHTML = '📍 Locate Me';
    btn.style.position = 'absolute';
    btn.style.bottom = '30px';
    btn.style.right = '10px';
    btn.style.zIndex = '1000';
    btn.style.padding = '8px 12px';
    btn.style.backgroundColor = '#e74c3c';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.borderRadius = '30px';
    btn.style.cursor = 'pointer';
    btn.style.fontWeight = 'bold';
    btn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    btn.onclick = () => {
        locationRetrieved = false;
        getAndSetUserLocation();
        btn.remove();
    };
    document.querySelector('.map-page').appendChild(btn);
}

// محاولة تحديد الموقع عند التحميل (مرة واحدة)
setTimeout(() => {
    getAndSetUserLocation();
}, 500);

// =========================
// 4. أيقونة نقاط الدم
// =========================
function createBloodIcon(type) {
    return L.divIcon({
        className: 'custom-marker-wrapper',
        iconSize: [55, 75],
        iconAnchor: [27.5, 75],
        html: `
            <div class="marker-container">
                <div class="ripple">
                    <div class="ring ring-1"></div>
                    <div class="ring ring-2"></div>
                    <div class="ring ring-3"></div>
                </div>
                <div class="blood-marker"><span>${type}</span></div>
            </div>
        `,
    });
}

// =========================
// 5. جلب وعرض المحتاجين
// =========================
async function loadSearchersOnMap() {
    try {
        const session = JSON.parse(localStorage.getItem('currentUserSession'));
        const isLoggedIn = !!session;

        const response = await fetch('http://localhost:3000/searchers/map-data');
        if (!response.ok) throw new Error('Failed to fetch searchers');
        const searchers = await response.json();

        console.log("Searchers fetched:", searchers); // ✅ طباعة البيانات

        if (!searchers.length) {
            console.log('No searchers to display');
            const msgDiv = document.createElement('div');
            msgDiv.innerHTML = 'No patients with location data found.';
            msgDiv.style.position = 'absolute';
            msgDiv.style.bottom = '20px';
            msgDiv.style.left = '20px';
            msgDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
            msgDiv.style.color = 'white';
            msgDiv.style.padding = '5px 10px';
            msgDiv.style.borderRadius = '5px';
            msgDiv.style.zIndex = '1000';
            document.querySelector('.map-page').appendChild(msgDiv);
            setTimeout(() => msgDiv.remove(), 3000);
            return;
        }

        const currentUserRole = getUserRole();
        const isDonor = (currentUserRole === 'donor');
        console.log("User role:", currentUserRole, "isDonor:", isDonor);

        searchers.forEach(searcher => {
            if (!searcher.latitude || !searcher.longitude) {
                console.log("Skipping searcher with missing coordinates:", searcher);
                return;
            }

            console.log("Adding marker for:", searcher.full_name, searcher.latitude, searcher.longitude);

            const marker = L.marker([parseFloat(searcher.latitude), parseFloat(searcher.longitude)], {
                icon: createBloodIcon(searcher.blood_type_research || 'O+')
            }).addTo(map);

            const mapCenter = map.getCenter();
            const latlng = L.latLng(searcher.latitude, searcher.longitude);
            const distance = (mapCenter.distanceTo(latlng) / 1000).toFixed(1);
            const dateStr = searcher.created_at
                ? new Date(searcher.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : '';

            let buttonHtml = '';
            if (isDonor) {
                buttonHtml = `<button class="view-request-btn" onclick="goToDonate(${searcher.id})">View Request ></button>`;
            } else {
                buttonHtml = `<div class="no-action-msg" style="text-align:center; color:#888; padding:8px;">You cannot request from another patient</div>`;
            }

            const profileImage = searcher.profile_picture
    ? `http://localhost:3000${searcher.profile_picture}`
    : null;

const initials = searcher.full_name
    ? searcher.full_name
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : '?';

const popupContent = `
    <div class="donor-card-popup">

        <div class="card-header">

            ${
                profileImage
                ? `<img src="${profileImage}" class="card-avatar">`
                : `<div class="card-avatar initials-avatar">${initials}</div>`
            }

            <div class="card-title-group">
                <div class="name-row">
                    <span class="card-name">${escapeHtml(searcher.full_name) || 'Unknown'}</span>
                    <span class="blood-badge">${escapeHtml(searcher.blood_type_research) || ''}</span>
                </div>

                ${searcher.is_urgent ? '<div class="urgency-badge">High Urgency</div>' : ''}
            </div>

        </div>

        <div class="card-details">

            <div class="detail-row">
                <img src="images/Vector P.svg" class="icon">
                <span class="text-main">Nearby Location</span>
                <span class="text-sub">${distance} km away</span>
            </div>

            <div class="detail-row">
                <img src="images/uil_hospital1.svg" class="icon">
                <span class="text-main">
                    ${escapeHtml(searcher.Hospital_name) || 'Hospital'}
                </span>
            </div>

            <div class="detail-row">
                <span class="text-sub">Posted: ${dateStr}</span>
            </div>

        </div>

        ${buttonHtml}

    </div>
`;

if (!isLoggedIn) {
    // لا يستطيع رؤية المعلومات
    marker.on('click', () => {
        L.popup({ closeButton: false, className: 'custom-leaflet-popup', minWidth: 250 })
            .setLatLng([parseFloat(searcher.latitude), parseFloat(searcher.longitude)])
            .setContent(`
                <div style="text-align:center; padding: 20px; font-family: Inter, sans-serif;">
                    <p style="font-size:14px; color:#7A7A7A;">Login to view patient details</p>
                    <a href="login.html" style="color:#E8433A; font-weight:600; text-decoration:none;">Login</a>
                </div>
            `)
            .openOn(map);
    });
} else {
    marker.bindPopup(popupContent, {
        closeButton: false,
        className: 'custom-leaflet-popup',
        minWidth: 300,
        maxWidth: 300
    });
    // ← أضيفي هذا بعد marker.bindPopup
const targetSearcherId = new URLSearchParams(window.location.search).get('searcherId');
if (targetSearcherId && searcher.id == targetSearcherId) {
    setTimeout(() => {
        map.setView([parseFloat(searcher.latitude), parseFloat(searcher.longitude)], 15);
        marker.openPopup();
    }, 800);
}
}
 }
);
    } catch (err) {
        console.error('Error loading searchers:', err);
showToast('Failed to load patients on map.', 'error');
    }
}
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function goToDonate(searcherId) {
    window.location.href = `donate.html?searcherId=${searcherId}`;
}

// بدء تحميل البيانات (المحتاجين)
loadSearchersOnMap();
document.addEventListener('DOMContentLoaded', function () {
    const currentPage = window.location.pathname.split('/').pop();

    document.querySelectorAll('.taps').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});