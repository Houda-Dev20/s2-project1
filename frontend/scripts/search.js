// ── Blood Type Picker ──
function toggleBloodPicker() {
  document.getElementById('bloodDropdown').classList.toggle('show');
}

function selectBlood(type) {
  document.getElementById('bloodLabel').textContent = type;
  document.getElementById('bloodDropdown').classList.remove('show');
  document.querySelectorAll('.blood-btn').forEach(function(b) {
    b.classList.toggle('selected', b.textContent === type);
  });
}

document.addEventListener('click', function(e) {
  const wrap = document.querySelector('.blood-picker-wrap');
  if (wrap && !wrap.contains(e.target)) {
    document.getElementById('bloodDropdown').classList.remove('show');
  }
});

function initHospitalMaps() {
    const hospitalData = [
        { id: 'map1', lat: 36.3667, lng: 6.6167, name: "Hospital Ali Mendjli" },
        { id: 'map2', lat: 36.1539, lng: 5.6887, name: "Clinique ZAMMIT" },
        { id: 'map3', lat: 35.5550, lng: 6.1741, name: "Clinique Les Rosiers" }
    ];

    hospitalData.forEach(data => {
        if (document.getElementById(data.id)) {
            renderSingleMap(data.id, data.lat, data.lng, data.name);
        }
    });
}

function renderSingleMap(id, lat, lng, hospitalName) {
    const map = L.map(id, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const customIcon = L.divIcon({
        className: 'custom-hospital-marker',
        html: `
            <div class="marker-pin"></div>
            <span class="marker-text">${hospitalName}</span>
        `,
        iconSize: [150, 20],
        iconAnchor: [6, 6]
    });

    L.marker([lat, lng], { icon: customIcon }).addTo(map);
}

document.addEventListener('DOMContentLoaded', initHospitalMaps);
function setupFooterHover() {
    const socialIcons = [
        { selector: '.sm1-img', hover: 'images/hoverX.svg' },
        { selector: '.sm2-img', hover: 'images/hoverInst.svg' },
        { selector: '.sm3-img', hover: 'images/hoverFace.svg' }, 
        { selector: '.sm4-img', hover: 'images/hoverIn.svg' }
    ];

    socialIcons.forEach(icon => {
        const img = document.querySelector(icon.selector);
        
        if (img) {
            const originalSrc = img.src; 
            img.onmouseenter = () => { img.src = icon.hover; };

            img.onmouseleave = () => { img.src = originalSrc; };
        }
    });
}
function goToPage() {
    window.location.href = "donate.html";
}

document.addEventListener('DOMContentLoaded', setupFooterHover);
