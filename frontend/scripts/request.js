
// قائمة الولايات لتحويل الرقم إلى اسم
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

function getWilayaNameById(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId < 1 || numericId > wilayasList.length) return "Unknown";
    return wilayasList[numericId - 1];
}

// frontend/scripts/request.js

document.addEventListener("DOMContentLoaded", async () => {
    console.log("request.js loaded");
    const urlParams = new URLSearchParams(window.location.search);
    const donorId = urlParams.get("donorId");
    console.log("donorId:", donorId);

    if (!donorId || donorId === "undefined") {
        alert("No valid donor specified.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/donors/profile/${donorId}`);
        if (!response.ok) throw new Error("Failed to load donor data");
        const donor = await response.json();
        console.log("Donor data:", donor);

        const profileImg = document.querySelector(".profile-img-container img");
        if (profileImg) {
            profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(donor.full_name)}&background=FDECEA&color=E8433A&size=128`;
            profileImg.alt = donor.full_name;
        }

        const nameEl = document.querySelector(".card-header h2");
        if (nameEl) nameEl.innerText = donor.full_name;

        const bloodTag = document.querySelector(".blood-type-tag");
        if (bloodTag) bloodTag.innerHTML = `${donor.blood_type} Blood Type`;

        // إخفاء رقم الهاتف والبريد الإلكتروني (الخاصين بالمتبرع)
        const infoFields = document.querySelectorAll(".info-field");
        if (infoFields.length >= 3) {
            infoFields[0].style.display = "none"; // Phone
            infoFields[1].style.display = "none"; // Email
            // عرض الموقع فقط
            let locationName = getWilayaNameById(donor.location);
            infoFields[2].querySelector("p").innerHTML = `${locationName} — Algeria`;
        }

        const donateBtn = document.querySelector(".btn-donate");
        if (donateBtn) {
            donateBtn.addEventListener("click", async () => {
                const searcherSession = JSON.parse(localStorage.getItem("currentUserSession"));
                if (!searcherSession || !searcherSession.userId) {
                    alert("You must be logged in as a patient to request donation.");
                    window.location.href = "login.html";
                    return;
                }
                const searcherId = searcherSession.userId;

                try {
                    const donationRes = await fetch("http://localhost:3000/donations/", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id_donor: donorId, id_searcher: searcherId, initiatedBy: "searcher" })
                    });
                    if (!donationRes.ok) {
                        const err = await donationRes.text();
                        throw new Error(err);
                    }
                    alert("Donation request sent successfully!");
                    window.location.href = "patient-profile.html";
                } catch (err) {
                    console.error(err);
                    alert("Failed to send donation request: " + err.message);
                }
            });
        }

    } catch (error) {
        console.error("Error loading donor details:", error);
        alert("Error loading donor details: " + error.message);
    }
});

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
document.addEventListener('DOMContentLoaded', setupFooterHover);


