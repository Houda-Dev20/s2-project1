// frontend/scripts/search_donor.js

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
});

async function performSearch() {
    if (!selectedBlood || !selectedLocation) {
        const cardsGrid = document.querySelector(".cards-grid");
        if (cardsGrid) {
            cardsGrid.innerHTML = `<div class="info-placeholder">⚠️ Please select both blood type and location.</div>`;
        }
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

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const data = await response.json();
        const donors = data.donors || [];

        if (donors.length === 0) {
            if (cardsGrid) cardsGrid.innerHTML = `<div class="no-results">❌ No matching donors found.</div>`;
            return;
        }

        let html = "";
        donors.forEach(donor => {
            const wilayaName = getWilayaNameById(donor.location);
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(donor.full_name)}&background=FDECEA&color=E8433A&bold=true`;
            html += `
                <div class="card">
                    <div class="card-header">
                        <img src="${avatarUrl}" class="avatar-sm" alt="${donor.full_name}">
                        <div class="card-meta">
                            <div class="card-name">
                                ${donor.full_name}
                                <span class="blood-badge">${donor.blood_type}</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-location">
                        <img src="images/VectorLocation.svg" alt="Location" class="Loc">
                        ${wilayaName}
                    </div>
                    <div class="request-box">
<button class="btn-view" onclick="window.location.href='request.html?donorId=${donor.id}'">Request Donation →</button>                    </div>
                </div>
            `;
        });
        if (cardsGrid) cardsGrid.innerHTML = html;

    } catch (error) {
        console.error("Search error:", error);
        if (cardsGrid) cardsGrid.innerHTML = `<div class="error">❗ Error: ${error.message}</div>`;
    }
}
