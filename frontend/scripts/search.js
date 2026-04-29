// frontend/scripts/search.js

// قائمة الولايات الأساسية (58 ولاية)
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

// تحويل كل ولاية إلى كائن { value: الرقم, name: الاسم }
const wilayaOptions = WILAYAS_LIST.map((name, idx) => ({ value: idx + 1, name }));

function getWilayaNameById(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId < 1 || numericId > wilayaOptions.length) return "Unknown";
    return wilayaOptions[numericId - 1].name;
}

// المتغيرات العامة للفلاتر
let selectedBlood = "";
let selectedLocation = "";
let selectedUrgency = "";

document.addEventListener("DOMContentLoaded", () => {
    // 1) تعبئة قائمة الولايات (select) بالقيم الصحيحة (الرقم - الاسم)
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

    // 2) ربط مستمعات الأحداث للتغيير في الفلاتر
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

    // 3) دالة اختيار فصيلة الدم (تُستدعى من أزرار القائمة المنسدلة في HTML)
    window.selectBlood = (bloodType) => {
        selectedBlood = bloodType;
        if (bloodLabelSpan) bloodLabelSpan.innerText = bloodType;
        // إخفاء القائمة المنسدلة بعد الاختيار
        const bloodDropdown = document.getElementById("bloodDropdown");
        if (bloodDropdown) bloodDropdown.style.display = "none";
        performSearch();
    };

    // 4) إظهار/إخفاء القائمة المنسدلة لفصيلة الدم
    window.toggleBloodPicker = () => {
        const dropdown = document.getElementById("bloodDropdown");
        if (dropdown) dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
    };

    // 5) إغلاق القائمة عند النقر خارجها
    document.addEventListener("click", (e) => {
        const bloodPickerWrap = document.querySelector(".blood-picker-wrap");
        if (bloodPickerWrap && !bloodPickerWrap.contains(e.target)) {
            const dropdown = document.getElementById("bloodDropdown");
            if (dropdown) dropdown.style.display = "none";
        }
    });

    // 6) (اختياري) إذا أردت إضافة زر بحث منفصل، يمكنك إلغاء تعليق السطور التالية
    /*
    let searchBtn = document.getElementById("dynamicSearchBtn");
    if (!searchBtn) {
        const filtersDiv = document.querySelector(".filters");
        if (filtersDiv) {
            searchBtn = document.createElement("button");
            searchBtn.id = "dynamicSearchBtn";
            searchBtn.className = "search-btn";
            searchBtn.textContent = "🔍 Search";
            searchBtn.style.marginTop = "20px";
            searchBtn.style.padding = "10px 20px";
            searchBtn.style.backgroundColor = "#E8433A";
            searchBtn.style.color = "white";
            searchBtn.style.border = "none";
            searchBtn.style.borderRadius = "30px";
            searchBtn.style.cursor = "pointer";
            searchBtn.style.fontWeight = "bold";
            filtersDiv.appendChild(searchBtn);
        }
    }
    if (searchBtn) {
        searchBtn.addEventListener("click", () => performSearch());
    }
    */
});

// الدالة الأساسية للبحث
async function performSearch() {
    // التحقق من اختيار فصيلة الدم والولاية (إلزاميان)
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
    if (selectedUrgency !== "") {
        payload.is_urgent = parseInt(selectedUrgency, 10);
    }

    // عرض حالة "جارٍ البحث"
    const cardsGrid = document.querySelector(".cards-grid");
    if (cardsGrid) cardsGrid.innerHTML = `<div class="loading-spinner">🔍 Searching...</div>`;

    try {
        const response = await fetch("http://localhost:3000/searchers/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const data = await response.json();
        const searchers = data.searchers || [];

        if (searchers.length === 0) {
            if (cardsGrid) cardsGrid.innerHTML = `<div class="no-results">❌ No matching requests found.</div>`;
            return;
        }

        // بناء البطاقات ديناميكياً
        let html = "";
        searchers.forEach(searcher => {
            const wilayaName = getWilayaNameById(searcher.location);
            const urgencyClass = searcher.is_urgent ? "high" : "stable";
            const urgencyText = searcher.is_urgent ? "High Urgency" : "Stable";
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(searcher.full_name)}&background=FDECEA&color=E8433A&bold=true`;
            const requestDate = searcher.created_at ? new Date(searcher.created_at).toLocaleDateString('en-GB') : "Date not available";
            
            // تقدير تاريخ النشر (بالأيام)
            let postedAgo = "recently";
            if (searcher.created_at) {
                const daysDiff = Math.floor((Date.now() - new Date(searcher.created_at)) / (1000 * 3600 * 24));
                if (daysDiff === 0) postedAgo = "today";
                else if (daysDiff === 1) postedAgo = "yesterday";
                else if (daysDiff < 30) postedAgo = `${daysDiff} days ago`;
                else postedAgo = `${Math.floor(daysDiff/30)} months ago`;
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
                        <img src="images/VectorLocation.svg" alt="Location" class="Loc">
                        ${wilayaName}
                    </div>
                    <div class="request-box">
                        <div class="request-info">
                            <div class="hospital-name">
                                <img src="images/uil_hospital.svg" alt="" class="hospital-icon">
                                Hospital in ${wilayaName}
                            </div>
                            <div class="req-date">${requestDate}</div>
                        </div>
                        <div class="req-meta">
                            <span>
                                <img src="images/material-symbols-light_post-add.svg" alt="" class="post-icon">
                                Posted ${postedAgo}
                            </span>
                            <span>
                                <img src="images/VectorLocation.svg" alt="Location" class="metre">
                                📞 ${searcher.telephon}
                            </span>
                        </div>
                        <div class="map-preview"><div class="map-placeholder">🗺️ Map preview</div></div>
                        <button class="btn-view" onclick="alert('Contact ${searcher.full_name} at ${searcher.telephon}')">View Request →</button>
                    </div>
                </div>
            `;
        });
        if (cardsGrid) cardsGrid.innerHTML = html;

    } catch (error) {
        console.error("Search error:", error);
        if (cardsGrid) cardsGrid.innerHTML = `<div class="error">❗ Error: ${error.message}</div>`;
    }
}