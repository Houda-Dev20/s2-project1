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

    try {
        const response = await fetch(`http://localhost:3000/searchers/profile/${searcherId}`);
        if (!response.ok) throw new Error("Failed to load searcher data");
        const searcher = await response.json();
        console.log("Searcher data:", searcher);

        // تحديث الصورة
        const profileImg = document.querySelector(".profile-img-container img");
        if (profileImg) {
            profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(searcher.full_name)}&background=FDECEA&color=E8433A&size=128`;
            profileImg.alt = searcher.full_name;
        }

        // تحديث الاسم
        const nameEl = document.querySelector(".card-header h2");
        if (nameEl) nameEl.innerText = searcher.full_name;

        // تحديث فصيلة الدم
        const bloodTag = document.querySelector(".blood-type-tag");
        if (bloodTag) bloodTag.innerHTML = `${searcher.blood_type_research} Blood Type`;

        // تحديث معلومات الصفوف (info-field)
        const infoFields = document.querySelectorAll(".info-field");
        if (infoFields.length >= 4) {
            infoFields[0].querySelector("p").innerText = searcher.telephon;
            infoFields[1].querySelector("p").innerText = searcher.email;
            // الحصول على اسم الولاية من الرقم باستخدام try-catch (قد لا يكون المسار موجوداً)
            let locationName = searcher.location;
            try {
                const wilayaRes = await fetch(`http://localhost:3000/utils/wilaya/${searcher.location}`);
                if (wilayaRes.ok) {
                    const wilayaData = await wilayaRes.json();
                    locationName = wilayaData.name;
                } else {
                    locationName = "Wilaya " + searcher.location;
                }
            } catch(e) { console.warn("Wilaya fetch failed, using number", e); }
            infoFields[2].querySelector("p").innerHTML = `${locationName} — Algeria`;
            infoFields[3].querySelector("p").innerText = searcher.Hospital_name || "Not specified";
        }

        // تحديث شارة الطوارئ
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

        // إضافة حدث لزر التبرع
        const donateBtn = document.querySelector(".btn-donate");
        if (donateBtn) {
            donateBtn.addEventListener("click", async () => {
                const donorSession = JSON.parse(localStorage.getItem("currentUserSession"));
                if (!donorSession || !donorSession.userId) {
                    alert("You must be logged in as a donor to donate.");
                    window.location.href = "login.html";
                    return;
                }
                const donorId = donorSession.userId;

                try {
                    const donationRes = await fetch("http://localhost:3000/donations/", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id_donor: donorId, id_searcher: searcherId })
                    });
                    if (!donationRes.ok) {
                        const err = await donationRes.text();
                        throw new Error(err);
                    }
                    alert("Donation request sent successfully!");
                    window.location.href = "donor-profile.html";
                } catch (err) {
                    console.error(err);
                    alert("Donation failed: " + err.message);
                }
            });
        }

    } catch (error) {
        console.error("Error loading donation details:", error);
        alert("Error loading donation details: " + error.message);
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
