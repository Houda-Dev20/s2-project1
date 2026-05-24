// frontend/scripts/request.js

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const donorId = urlParams.get("donorId");
    if (!donorId) {
showToast("No donor specified.", 'error');
        return;
    }

    const searcherSession = JSON.parse(localStorage.getItem("currentUserSession"));
    if (!searcherSession || !searcherSession.userId) {
showToast("Please log in as a patient.", 'error');

window.location.href = "login.html";
        return;
    }
    const searcherId = searcherSession.userId;

    let existingDonationId = null;

    // التحقق من وجود طلب pending
    try {
        const statusRes = await fetch(`http://localhost:3000/donations/status?donorId=${donorId}&searcherId=${searcherId}`);
        if (statusRes.ok) {
            const data = await statusRes.json();
            if (data.hasRequest && data.status === "pending") {
                existingDonationId = data.donationId;
                console.log("✅ Found pending request ID:", existingDonationId);
            }
        } else if (statusRes.status === 404) {
            console.log("No existing request (404)");
        } else {
            console.warn("Unexpected status response:", statusRes.status);
        }
    } catch (err) {
        console.error("Error checking status:", err);
    }

    // تحميل بيانات المتبرع
    try {
        const donorRes = await fetch(`http://localhost:3000/donors/profile/${donorId}`);
        if (!donorRes.ok) throw new Error("Donor not found");
        const donor = await donorRes.json();

        // تحديث الواجهة
document.querySelector(".profile-img-container img").src = donor.profile_picture
    ? `http://localhost:3000${donor.profile_picture}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(donor.full_name)}&background=FDECEA&color=E8433A&size=128`;
    document.querySelector(".profile-img-container img").alt = donor.full_name;
    document.querySelector(".card-header h2").innerText = donor.full_name;
        document.querySelector(".blood-type-tag").innerHTML = `${donor.blood_type} Blood Type`;

console.log("donor data:", donor);
console.log("profile_picture:", donor.profile_picture);

        const infoFields = document.querySelectorAll(".info-field");
        if (infoFields.length >= 3) {
    infoFields[0].querySelector("p").innerText = "Available after acceptance";
            infoFields[1].style.display = "none";
            const locationName = getWilayaNameById(donor.location);
            infoFields[2].querySelector("p").innerHTML = `${locationName} — Algeria`;
        }

        const donateBtn = document.querySelector(".btn-donate");

        if (existingDonationId) {
            // وضع الإلغاء
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
            const errText = await cancelRes.text();
            showToast("Cancel failed: " + errText, 'error');
        }
    } catch (err) {
        showToast("Error: " + err.message, 'error');
    }
});
            };
} else {
    // وضع الطلب العادي
    donateBtn.textContent = "Request Donation";
    donateBtn.style.backgroundColor = "";
    donateBtn.onclick = async () => {
        try {
            // ✅ تحقق من available للمحتاج
            const searcherRes = await fetch(`http://localhost:3000/searchers/profile/${searcherId}`);
            const searcherProfile = await searcherRes.json();
            
            if (searcherProfile.available === 0) {
                showToast("You are currently marked as unavailable. Please activate yourself in your profile first.", 'error');
                return;
            }

            const response = await fetch("http://localhost:3000/donations/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_donor: donorId, id_searcher: searcherId, initiatedBy: "searcher" })
            });
            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 409) {
                    showToast(errorData.message || "A pending request already exists.", 'error');
                    window.location.reload();
                    return;
                }
                throw new Error(errorData.message || "Request failed");
            }
            showToast("Donation request sent!", 'success');
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            showToast(err.message, 'error');
        }
    };
}
    } catch (err) {
        console.error(err);
showToast("Error loading donor details.", 'error');
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