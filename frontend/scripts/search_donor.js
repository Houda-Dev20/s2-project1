const WILAYAS_LIST = [
    "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Bejaia","Biskra","Bechar",
    "Blida","Bouira","Tamanrasset","Tebessa","Tlemcen","Tiaret","Tizi Ouzou","Algiers",
    "Djelfa","Jijel","Setif","Saida","Skikda","Sidi Bel Abbes","Annaba","Guelma",
    "Constantine","Medea","Mostaganem","Msila","Mascara","Ouargla","Oran","El Bayadh",
    "Illizi","Bordj Bou Arreridj","Boumerdes","El Tarf","Tindouf","Tissemsilt",
    "El Oued","Khenchela","Souk Ahras","Tipaza","Mila","Ain Defla","Naama",
    "Ain Temouchent","Ghardaia","Relizane","Timimoun","Bordj Badji Mokhtar","Ouled Djellal",
    "Beni Abbes","In Salah","In Guezzam","Touggourt","Djanet","El M'Ghair","El Meniaa"
];

const wilayaOptions = WILAYAS_LIST.map((name, idx) => ({ value: idx + 1, name }));

function getWilayaNameById(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId < 1 || numericId > wilayaOptions.length) return "Unknown";
    return wilayaOptions[numericId - 1].name;
}

const wilayaCoords = {
    1:{lat:27.87,lng:-0.28},2:{lat:36.16,lng:1.33},3:{lat:33.80,lng:2.86},
    4:{lat:35.87,lng:7.11},5:{lat:35.55,lng:6.17},6:{lat:36.75,lng:5.08},
    7:{lat:34.85,lng:5.73},8:{lat:31.61,lng:-2.21},9:{lat:36.47,lng:2.83},
    10:{lat:36.37,lng:3.90},11:{lat:22.78,lng:5.52},12:{lat:35.40,lng:8.12},
    13:{lat:34.88,lng:-1.31},14:{lat:35.37,lng:1.32},15:{lat:36.71,lng:4.05},
    16:{lat:36.73,lng:3.08},17:{lat:34.67,lng:3.25},18:{lat:36.82,lng:5.77},
    19:{lat:36.19,lng:5.41},20:{lat:34.83,lng:0.15},21:{lat:36.87,lng:6.90},
    22:{lat:35.19,lng:-0.63},23:{lat:36.90,lng:7.76},24:{lat:36.46,lng:7.43},
    25:{lat:36.36,lng:6.61},26:{lat:36.26,lng:2.75},27:{lat:35.93,lng:0.09},
    28:{lat:35.70,lng:4.54},29:{lat:35.39,lng:0.14},30:{lat:31.95,lng:5.32},
    31:{lat:35.69,lng:-0.63},32:{lat:33.68,lng:1.01},33:{lat:26.48,lng:8.48},
    34:{lat:36.07,lng:4.76},35:{lat:36.76,lng:3.48},36:{lat:36.76,lng:8.31},
    37:{lat:27.67,lng:-8.14},38:{lat:35.60,lng:1.81},39:{lat:33.36,lng:6.86},
    40:{lat:35.43,lng:7.14},41:{lat:36.28,lng:7.95},42:{lat:36.58,lng:2.45},
    43:{lat:36.45,lng:6.26},44:{lat:36.26,lng:1.96},45:{lat:33.27,lng:-0.31},
    46:{lat:35.30,lng:-1.14},47:{lat:32.49,lng:3.67},48:{lat:35.73,lng:0.56},
    49:{lat:29.26,lng:0.24},50:{lat:21.83,lng:1.07},51:{lat:34.42,lng:3.75},
    52:{lat:30.13,lng:-2.17},53:{lat:27.20,lng:2.47},54:{lat:19.56,lng:5.77},
    55:{lat:33.10,lng:6.06},56:{lat:24.55,lng:9.48},57:{lat:33.96,lng:5.93},
    58:{lat:30.56,lng:2.86}
};

let selectedBlood = "";
let selectedLocation = "";

document.addEventListener("DOMContentLoaded", () => {
    const locationSelect = document.getElementById("location");
    if (locationSelect) {
        locationSelect.innerHTML = '<option value="">Select Location</option>';
        wilayaOptions.forEach(w => {
            const option = document.createElement("option");
            option.value = w.value;
            option.textContent = `${w.value.toString().padStart(2,'0')} - ${w.name}`;
            locationSelect.appendChild(option);
        });
    }

    const bloodLabelSpan = document.getElementById("bloodLabel");

    if (locationSelect) {
        locationSelect.addEventListener("change", () => {
            selectedLocation = locationSelect.value;
            performSearch();
        });
    }

    window.selectBlood = (bloodType) => {
        selectedBlood = bloodType;
        if (bloodLabelSpan) bloodLabelSpan.innerText = bloodType;
        const bloodDropdown = document.getElementById("bloodDropdown");
        if (bloodDropdown) bloodDropdown.style.display = "none";
        performSearch();
    };

    window.toggleBloodPicker = () => {
        const dropdown = document.getElementById("bloodDropdown");
        if (dropdown) dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
    };

    document.addEventListener("click", (e) => {
        const bloodPickerWrap = document.querySelector(".blood-picker-wrap");
        if (bloodPickerWrap && !bloodPickerWrap.contains(e.target)) {
            const dropdown = document.getElementById("bloodDropdown");
            if (dropdown) dropdown.style.display = "none";
        }
    });

    loadAllDonors();
});

// ── تحميل كل المتبرعين عند فتح الصفحة ──
async function loadAllDonors() {
    const cardsGrid = document.querySelector(".cards-grid");
    if (cardsGrid) cardsGrid.innerHTML = `<div class="loading-spinner">🔍 Loading donors...</div>`;

    try {
        const response = await fetch("http://localhost:3000/donors/all");
        if (!response.ok) throw new Error("Failed to load donors");
        const data = await response.json();
        renderDonorCards(data.donors || []);
    } catch (error) {
        console.error(error);
        const cardsGrid = document.querySelector(".cards-grid");
        if (cardsGrid) cardsGrid.innerHTML = `<div class="error">❗ Failed to load donors.</div>`;
    }
}

// ── البحث بالفيلتر ──
async function performSearch() {
    if (!selectedBlood || !selectedLocation) {
        loadAllDonors();
        return;
    }

    const payload = {
        blood_type: selectedBlood,
        location: parseInt(selectedLocation, 10)
    };

    const cardsGrid = document.querySelector(".cards-grid");
    if (cardsGrid) cardsGrid.innerHTML = `<div class="loading-spinner">🔍 Searching...</div>`;

    try {
        const response = await fetch("http://localhost:3000/donors/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(await response.text());

        const data = await response.json();
        const donors = data.donors || [];

        if (donors.length === 0) {
            if (cardsGrid) cardsGrid.innerHTML = `<div class="no-results">❌ No matching donors found.</div>`;
            return;
        }

        renderDonorCards(donors);

    } catch (error) {
        console.error("Search error:", error);
        const cardsGrid = document.querySelector(".cards-grid");
        if (cardsGrid) cardsGrid.innerHTML = `<div class="error">❗ Error: ${error.message}</div>`;
    }
}


// مثال بسيط كيفاش تمشيها في الـ JS تاعك
document.querySelectorAll('.blood-btn').forEach(button => {
    button.addEventListener('click', () => {
        // تنحي الـ active من قاع الأزرار الأخرى
        document.querySelectorAll('.blood-btn').forEach(btn => btn.classList.remove('active'));
        // تزيدها للزر لي تكليكا عليه
        button.classList.add('active');
        
        // هنا دير الكود تاعك باه تبدل النص الفوقاني وتقفل القائمة
    });
});

// ── دالة بناء البطاقات (مشتركة بين loadAllDonors و performSearch) ──
function renderDonorCards(donors) {
    const cardsGrid = document.querySelector(".cards-grid");

    if (!donors.length) {
        cardsGrid.innerHTML = `<div class="no-results">❌ No donors found.</div>`;
        return;
    }

    let html = "";
    donors.forEach((donor, index) => {
        const wilayaName = getWilayaNameById(donor.location);
const avatarUrl = donor.profile_picture 
    ? `http://localhost:3000${donor.profile_picture}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(donor.full_name)}&background=FDECEA&color=E8433A&bold=true`;

        let postedAgo = "recently";
        let registerDate = "Date not available";
        if (donor.created_at) {
            registerDate = new Date(donor.created_at).toLocaleDateString('en-GB');
            const daysDiff = Math.floor((Date.now() - new Date(donor.created_at)) / (1000 * 3600 * 24));
            if (daysDiff === 0) postedAgo = "today";
            else if (daysDiff === 1) postedAgo = "yesterday";
            else if (daysDiff < 30) postedAgo = `${daysDiff} days ago`;
            else postedAgo = `${Math.floor(daysDiff / 30)} months ago`;
        }

        html += `
            <div class="card" data-location="${donor.location}" data-wilaya="${wilayaName}">
                <div class="card-header">
${donor.profile_picture 
    ? `<img src="http://localhost:3000${donor.profile_picture}" class="avatar-sm" alt="${donor.full_name}">`
    : `<div class="avatar-sm" style="background:#FDECEA;display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;font-weight:700;font-size:22px;color:#E8433A;">
        ${donor.full_name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2)}
       </div>`
}                    <div class="card-meta">
                        <div class="card-name">
                            ${donor.full_name}
                            <span class="blood-badge">${donor.blood_type}</span>
                        </div>
                        <span class="urgency-tag stable">Available</span>
                    </div>
                </div>
                <div class="card-location">
                    <img src="images/VectorLocation.svg" alt="Location" class="Loc">
                    ${wilayaName}
                </div>
                <div class="request-box">
                    <div class="req-date">${registerDate}</div>
                    <div class="req-meta">
                        <span>
                            <img src="images/material-symbols-light_post-add.svg" alt="" class="post-icon">
                            Posted ${postedAgo}
                        </span>
                    </div>
                    <div class="map-preview" id="map-donor-${index}"></div>
                    <button class="btn-view" onclick="window.location.href='request.html?donorId=${donor.id}'">Request Donation →</button>
                </div>
            </div>
        `;
    });

    cardsGrid.innerHTML = html;

    // إنشاء الخرائط بعد رسم البطاقات
    donors.forEach((donor, index) => {
        const wilayaName = getWilayaNameById(donor.location);
        const coords = wilayaCoords[donor.location] || { lat: 28.0, lng: 2.0 };
        const mapEl = document.getElementById(`map-donor-${index}`);
        if (!mapEl) return;

        mapEl.style.height = "80px";
        mapEl.style.cursor = "pointer";

        mapEl.onclick = (e) => {
            e.stopPropagation();
            window.location.href = `map.html?wilaya=${encodeURIComponent(wilayaName)}&lat=${coords.lat}&lng=${coords.lng}`;
        };

        const map = L.map(mapEl, {
            center: [coords.lat, coords.lng],
            zoom: 10,
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            touchZoom: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        const icon = L.divIcon({
            className: '',
            html: `<div style="background:#E8433A;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });

        L.marker([coords.lat, coords.lng], { icon }).addTo(map)
            .bindTooltip(wilayaName, { permanent: true, direction: 'right', className: 'marker-text' });

        setTimeout(() => map.invalidateSize(), 100);
    });
}