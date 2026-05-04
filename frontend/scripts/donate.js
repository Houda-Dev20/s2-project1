// frontend/scripts/donate.js

document.addEventListener("DOMContentLoaded", async () => {
    console.log("donate.js loaded");
    const urlParams = new URLSearchParams(window.location.search);
    const searcherId = urlParams.get("searcherId");
    console.log("searcherId:", searcherId);

    if (!searcherId || searcherId === "undefined") {
        alert("No valid searcher specified.");
        return;
    }

    // جلسة المستخدم الحالي (المتبرع)
    const donorSession = JSON.parse(localStorage.getItem("currentUserSession"));
    if (!donorSession || !donorSession.userId) {
        alert("You must be logged in as a donor.");
        window.location.href = "login.html";
        return;
    }
    const donorId = donorSession.userId;

    let existingDonationId = null;

    // 1️⃣ التحقق من وجود طلب معلق بين هذا المتبرع وهذا المحتاج
    try {
        const statusRes = await fetch(`http://localhost:3000/donations/status?donorId=${donorId}&searcherId=${searcherId}`);
        const statusData = await statusRes.json();
        if (statusData.hasRequest && statusData.status === 'pending') {
            existingDonationId = statusData.donationId;
            console.log("Existing pending donation found, ID:", existingDonationId);
        }
    } catch (err) {
        console.error("Error checking donation status:", err);
    }

    try {
        const response = await fetch(`http://localhost:3000/searchers/profile/${searcherId}`);
        if (!response.ok) throw new Error("Failed to load searcher data");
        const searcher = await response.json();
        console.log("Searcher data:", searcher);

        const profileImg = document.querySelector(".profile-img-container img");
        if (profileImg) {
            profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(searcher.full_name)}&background=FDECEA&color=E8433A&size=128`;
            profileImg.alt = searcher.full_name;
        }

        const nameEl = document.querySelector(".card-header h2");
        if (nameEl) nameEl.innerText = searcher.full_name;

        const bloodTag = document.querySelector(".blood-type-tag");
        if (bloodTag) bloodTag.innerHTML = `${searcher.blood_type_research} Blood Type`;

        const infoFields = document.querySelectorAll(".info-field");
        if (infoFields.length >= 4) {
            infoFields[0].querySelector("p").innerText = "Available after acceptance";
            infoFields[1].querySelector("p").innerText = "Available after acceptance";
            let locationName = getWilayaNameById(searcher.location);
            infoFields[2].querySelector("p").innerHTML = `${locationName} — Algeria`;
            infoFields[3].querySelector("p").innerText = searcher.Hospital_name || "Not specified";
        }

        const urgencyBadge = document.querySelector(".urgency-badge");
        if (urgencyBadge) {
            if (searcher.is_urgent) {
                urgencyBadge.innerText = "URGENT REQUEST";
                urgencyBadge.style.backgroundColor = "#E33E3E";
            } else {
                urgencyBadge.innerText = "STABLE REQUEST";
                urgencyBadge.style.backgroundColor = "#EA9A60";
            }
        }

        const donateBtn = document.querySelector(".btn-donate");
        if (donateBtn) {
            if (existingDonationId) {
                donateBtn.textContent = "Cancel Request";
                donateBtn.style.backgroundColor = "#888";
                donateBtn.onclick = async () => {
                    if (confirm("Cancel this donation request?")) {
                        try {
                            const cancelRes = await fetch(`http://localhost:3000/donations/${existingDonationId}/cancel`, {
                                method: "POST"
                            });
                            if (cancelRes.ok) {
                                alert("Request cancelled.");
                                window.location.reload();
                            } else {
                                const err = await cancelRes.text();
                                alert("Cancel failed: " + err);
                            }
                        } catch (err) {
                            alert("Error: " + err.message);
                        }
                    }
                }
            } else {
                donateBtn.textContent = "Donate Blood Now";
                donateBtn.style.backgroundColor = "";
                donateBtn.addEventListener("click", async () => {
                    try {
                        const donationRes = await fetch("http://localhost:3000/donations", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id_donor: donorId, id_searcher: searcherId, initiatedBy: "donor" })
                        });
                        if (!donationRes.ok) {
                            const errData = await donationRes.json();
                            throw new Error(errData.message || "Request failed");
                        }
                        alert("Donation offer sent successfully!");
                        window.location.reload();
                    } catch (err) {
                        console.error(err);
                        alert("Failed to send donation offer: " + err.message);
                    }
                });
            }
        }

    } catch (error) {
        console.error("Error loading donation details:", error);
        alert("Error loading donation details: " + error.message);
    }
});

function getWilayaNameById(id) {
    const wilayas = [
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
    return (idx >= 0 && idx < wilayas.length) ? wilayas[idx] : "Unknown";
}

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