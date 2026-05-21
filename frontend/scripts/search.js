// frontend/scripts/search.js

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
let selectedUrgency = "";

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
    const urgencySelect = document.getElementById("urgentStatus");

    if (locationSelect) {
        locationSelect.addEventListener("change", () => {
            selectedLocation = locationSelect.value;
            performSearch();
        });
    }

    if (urgencySelect) {
        urgencySelect.addEventListener("change", () => {
            const val = urgencySelect.value;
            if (val === "High Urgency") selectedUrgency = "1";
            else if (val === "Stable") selectedUrgency = "0";
            else selectedUrgency = "";
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

    // تحميل كل المحتاجين عند فتح الصفحة
    loadAllSearchers();
});

// ── تحميل كل المحتاجين عند فتح الصفحة ──
async function loadAllSearchers() {
    const cardsGrid = document.querySelector(".cards-grid");
    if (cardsGrid) cardsGrid.innerHTML = `<div class="loading-spinner">🔍 Loading requests...</div>`;

    try {
        const response = await fetch("http://localhost:3000/searchers/all");
        if (!response.ok) throw new Error("Failed to load searchers");
        const data = await response.json();
        renderSearcherCards(data.searchers || []);
    } catch (error) {
        console.error(error);
        const cardsGrid = document.querySelector(".cards-grid");
        if (cardsGrid) cardsGrid.innerHTML = `<div class="error">❗ Failed to load requests.</div>`;
    }
}

// ── البحث بالفيلتر ──
async function performSearch() {
    // إذا لم يكن هناك فيلتر → أعد تحميل الكل
    if (!selectedBlood && !selectedLocation && selectedUrgency === "") {
        loadAllSearchers();
        return;
    }

    const payload = {
        blood_type: selectedBlood,
        location: parseInt(selectedLocation, 10)
    };
    if (selectedUrgency !== "") {
        payload.is_urgent = parseInt(selectedUrgency, 10);
    }

    const cardsGrid = document.querySelector(".cards-grid");
    if (cardsGrid) cardsGrid.innerHTML = `<div class="loading-spinner">🔍 Searching...</div>`;

    try {
        const response = await fetch("http://localhost:3000/searchers/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(await response.text());

        const data = await response.json();
        const searchers = data.searchers || [];

        if (searchers.length === 0) {
            if (cardsGrid) cardsGrid.innerHTML = `<div class="no-results">❌ No matching requests found.</div>`;
            return;
        }

        renderSearcherCards(searchers);

    } catch (error) {
        console.error("Search error:", error);
        const cardsGrid = document.querySelector(".cards-grid");
        if (cardsGrid) cardsGrid.innerHTML = `<div class="error">❗ Error: ${error.message}</div>`;
    }
}

// ── دالة بناء البطاقات (مشتركة بين loadAllSearchers و performSearch) ──
function renderSearcherCards(searchers) {
    const cardsGrid = document.querySelector(".cards-grid");

    if (!searchers.length) {
        cardsGrid.innerHTML = `<div class="no-results">❌ No requests found.</div>`;
        return;
    }

    let html = "";
    searchers.forEach((searcher, index) => {
        const wilayaName = getWilayaNameById(searcher.location);
        const urgencyClass = searcher.is_urgent ? "high" : "stable";
        const urgencyText = searcher.is_urgent ? "High Urgency" : "Stable";
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(searcher.full_name)}&background=FDECEA&color=E8433A&bold=true`;

        let registerDate = "Date not available";
        let postedAgo = "recently";
        if (searcher.created_at) {
            registerDate = new Date(searcher.created_at).toLocaleDateString('en-GB');
            const daysDiff = Math.floor((Date.now() - new Date(searcher.created_at)) / (1000 * 3600 * 24));
            if (daysDiff === 0) postedAgo = "today";
            else if (daysDiff === 1) postedAgo = "yesterday";
            else if (daysDiff < 30) postedAgo = `${daysDiff} days ago`;
            else postedAgo = `${Math.floor(daysDiff / 30)} months ago`;
        }

        html += `
            <div class="card">
                <div class="card-header">
                    <img src="${avatarUrl}" class="avatar-sm" alt="${searcher.full_name}">
                    <div class="card-meta">
                        <div class="card-name">
                            ${searcher.full_name}
                            <span class="blood-badge">${searcher.blood_type_research}</span>
                        </div>
                        <span class="urgency-tag ${urgencyClass}">${urgencyText}</span>
                    </div>
                </div>
                <div class="card-location">
                    <img src="images/VectorLocation.svg" alt="Location" class="loc">
                    ${wilayaName}
                </div>
                <div class="request-box">
                    <div class="hospital-name">
                        <img src="images/uil_hospital.svg" alt="" class="hospital-icon">
                        Hospital in ${wilayaName}
                    </div>
                    <div class="req-date">${registerDate}</div>
                    <div class="req-meta">
                        <span>
                            <img src="images/material-symbols-light_post-add.svg" alt="" class="post-icon">
                            Posted ${postedAgo}
                        </span>
                    </div>
                    <div class="map-preview" id="map-searcher-${index}"></div>
                    <button class="btn-view" onclick="window.location.href='donate.html?searcherId=${searcher.id}'">View Request →</button>
                </div>
            </div>
        `;
    });

    cardsGrid.innerHTML = html;

    // إنشاء الخرائط بعد رسم البطاقات
    searchers.forEach((searcher, index) => {
        const wilayaName = getWilayaNameById(searcher.location);
        const coords = wilayaCoords[searcher.location] || { lat: 28.0, lng: 2.0 };
        const mapEl = document.getElementById(`map-searcher-${index}`);
        if (!mapEl) return;

        mapEl.style.height = "80px";
        mapEl.style.cursor = "pointer";

        mapEl.addEventListener("click", (e) => {
            e.stopPropagation();
            window.location.href = `map.html?wilaya=${encodeURIComponent(wilayaName)}&lat=${coords.lat}&lng=${coords.lng}`;
        });

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

        L.marker([coords.lat, coords.lng], { icon })
            .addTo(map)
            .bindTooltip(wilayaName, { permanent: true, direction: 'right', className: 'marker-text' });

        setTimeout(() => map.invalidateSize(), 100);
    });
}