// frontend/scripts/donate.js

document.addEventListener("DOMContentLoaded", async () => {
    console.log("donate.js loaded");
    const urlParams = new URLSearchParams(window.location.search);
    const searcherId = urlParams.get("searcherId");
    console.log("searcherId:", searcherId);

    if (!searcherId || searcherId === "undefined") {
showToast("No valid searcher specified.", 'error');
        return;
    }

    // جلسة المستخدم الحالي (المتبرع)
    const donorSession = JSON.parse(localStorage.getItem("currentUserSession"));
    if (!donorSession || !donorSession.userId) {
showToast("You must be logged in as a donor.", 'error');
        window.location.href = "login.html";
        return;
    }
    const donorId = donorSession.userId;

    let existingDonationId = null;

let initiatedBy = null;

try {
    const statusRes = await fetch(`http://localhost:3000/donations/status?donorId=${donorId}&searcherId=${searcherId}`);
    const statusData = await statusRes.json();
    if (statusData.hasRequest && statusData.status === 'pending') {
        existingDonationId = statusData.donationId;
        initiatedBy = statusData.initiatedBy;
        console.log("Existing pending donation found, ID:", existingDonationId, "initiatedBy:", initiatedBy);
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
    if (searcher.profile_picture) {
        profileImg.src = `http://localhost:3000${searcher.profile_picture}`;
    } else {
        profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(searcher.full_name)}&background=FDECEA&color=E8433A&size=128`;
    }
    profileImg.alt = searcher.full_name;
}

        const nameEl = document.querySelector(".card-header h2");
        if (nameEl) nameEl.innerText = searcher.full_name;

        const bloodTag = document.querySelector(".blood-type-tag");
        if (bloodTag) bloodTag.innerHTML = `${searcher.blood_type_research} Blood Type`;

        const infoFields = document.querySelectorAll(".info-field");
        if (infoFields.length >= 4) {
            infoFields[0].querySelector("p").innerText = "Available after acceptance";
infoFields[1].style.display = "none";            let locationName = getWilayaNameById(searcher.location);
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
            if (existingDonationId && initiatedBy === 'searcher') {
                // الطلب بدأ من المحتاج — المتبرع يقبل أو يرفض
                donateBtn.textContent = "Accept Request";
                donateBtn.style.backgroundColor = "#4CAF50";
                donateBtn.onclick = async () => {
                    showConfirm("Accept this donation request?", async () => {
                        try {
                            const acceptRes = await fetch(`http://localhost:3000/donations/${existingDonationId}/accept-by-donor`, {
                                method: "POST"
                            });
                            if (acceptRes.ok) {
                                showToast("Request accepted! Both parties will be notified.", 'success');
                                setTimeout(() => window.location.reload(), 1500);
                            } else {
                                const err = await acceptRes.text();
                                showToast("Accept failed: " + err, 'error');
                            }
                        } catch (err) {
                            showToast("Error: " + err.message, 'error');
                        }
                    });
                };

                // زر الرفض
                const rejectBtn = document.createElement("button");
                rejectBtn.textContent = "Reject Request";
                rejectBtn.className = donateBtn.className;
                rejectBtn.style.backgroundColor = "#888";
                rejectBtn.style.marginTop = "10px";
                donateBtn.parentNode.insertBefore(rejectBtn, donateBtn.nextSibling);

                rejectBtn.onclick = async () => {
                    showConfirm("Reject this donation request?", async () => {
                        try {
                            const cancelRes = await fetch(`http://localhost:3000/donations/${existingDonationId}/cancel`, {
                                method: "POST"
                            });
                            if (cancelRes.ok) {
                                showToast("Request rejected.", 'success');
                                setTimeout(() => window.location.reload(), 1500);
                            } else {
                                const err = await cancelRes.text();
                                showToast("Reject failed: " + err, 'error');
                            }
                        } catch (err) {
                            showToast("Error: " + err.message, 'error');
                        }
                    });
                };

            } else if (existingDonationId && initiatedBy === 'donor') {
                // الطلب بدأ من المتبرع — يرى Cancel فقط
                donateBtn.textContent = "Cancel Request";
                donateBtn.style.backgroundColor = "#888";
                donateBtn.onclick = async () => {
                    showConfirm("Cancel this donation request?", async () => {
                        try {
                            const cancelRes = await fetch(`http://localhost:3000/donations/${existingDonationId}/cancel`, {
                                method: "POST"
                            });
                            if (cancelRes.ok) {
                                showToast("Request cancelled.", 'success');
                                setTimeout(() => window.location.reload(), 1500);
                            } else {
                                const err = await cancelRes.text();
                                showToast("Cancel failed: " + err, 'error');
                            }
                        } catch (err) {
                            showToast("Error: " + err.message, 'error');
                        }
                    });
                };
            } else {
                donateBtn.textContent = "Donate Blood Now";
                donateBtn.style.backgroundColor = "";
                donateBtn.addEventListener("click", async () => {
    try {
        // تحقق من بيانات المتبرع أولاً
        const donorProfileRes = await fetch(`http://localhost:3000/donors/profile/${donorId}`);
        const donorProfile = await donorProfileRes.json();

        // تحقق من 90 يوم
        if (donorProfile.last_donation_date) {
            const lastDonation = new Date(donorProfile.last_donation_date);
            const now = new Date();
            const daysDiff = Math.floor((now - lastDonation) / (1000 * 60 * 60 * 24));

            if (daysDiff < 90) {
                const daysLeft = 90 - daysDiff;
                showToast(`You cannot donate yet. ${daysLeft} days remaining until you can donate again.`, 'error');
                return;
            }
        }

        // تحقق من available
if (donorProfile.available === 0) {
    // تحقق إذا كان السبب طلب pending موجود
    const pendingCheck = await fetch(`http://localhost:3000/donations/donor-pending/${donorId}`);
    const pendingData = await pendingCheck.json();
    
    if (pendingData.hasPending) {
        showToast("You already have a pending donation request. Please wait for a response or cancel it before sending a new one.", 'error');
    } else {
        showToast('You are currently not available to donate. Please enable "Ready to Donate" in your profile first.', 'error');
    }
    return;
}

        // إرسال طلب التبرع
        const donationRes = await fetch("http://localhost:3000/donations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_donor: donorId, id_searcher: searcherId, initiatedBy: "donor" })
        });
        if (!donationRes.ok) {
            const errData = await donationRes.json();
            throw new Error(errData.message || "Request failed");
        }
        showToast("Donation offer sent successfully!", 'success');
        setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
        console.error(err);
        showToast("Failed to send donation offer: " + err.message, 'error');
    }
});
            }
        }

    } catch (error) {
        console.error("Error loading donation details:", error);
showToast("Error loading donation details: " + error.message, 'error');
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

function showConfirm(message, onConfirm) {
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
                ">Confirm</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('confirmYes').onclick = () => { overlay.remove(); onConfirm(); };
    document.getElementById('confirmNo').onclick = () => overlay.remove();
}

document.addEventListener('DOMContentLoaded', setupFooterHover);