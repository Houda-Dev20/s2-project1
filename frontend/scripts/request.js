// frontend/scripts/request.js

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const donorId = urlParams.get("donorId");
    if (!donorId) {
        alert("No donor specified.");
        return;
    }

    const searcherSession = JSON.parse(localStorage.getItem("currentUserSession"));
    if (!searcherSession || !searcherSession.userId) {
        alert("Please log in as a patient.");
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
        document.querySelector(".profile-img-container img").src = `https://ui-avatars.com/api/?name=${encodeURIComponent(donor.full_name)}&background=FDECEA&color=E8433A&size=128`;
        document.querySelector(".card-header h2").innerText = donor.full_name;
        document.querySelector(".blood-type-tag").innerHTML = `${donor.blood_type} Blood Type`;

        const infoFields = document.querySelectorAll(".info-field");
        if (infoFields.length >= 3) {
            infoFields[0].style.display = "none";
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
                if (confirm("Cancel this donation request?")) {
                    try {
                        const cancelRes = await fetch(`http://localhost:3000/donations/${existingDonationId}/cancel`, {
                            method: "POST"
                        });
                        if (cancelRes.ok) {
                            alert("Request cancelled.");
                            window.location.reload();
                        } else {
                            const errText = await cancelRes.text();
                            alert("Cancel failed: " + errText);
                        }
                    } catch (err) {
                        alert("Error: " + err.message);
                    }
                }
            };
        } else {
            // وضع الطلب العادي
            donateBtn.textContent = "Request Donation";
            donateBtn.style.backgroundColor = "";
            donateBtn.onclick = async () => {
                try {
                    const response = await fetch("http://localhost:3000/donations/", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id_donor: donorId, id_searcher: searcherId, initiatedBy: "searcher" })
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        if (response.status === 409) {
                            // يوجد طلب pending بالفعل -> نعرض الرسالة ونعيد تحميل الصفحة ليزهر زر الإلغاء
                            alert(errorData.message || "A pending request already exists.");
                            window.location.reload();
                            return;
                        }
                        throw new Error(errorData.message || "Request failed");
                    }
                    alert("Donation request sent!");
                    window.location.reload();
                } catch (err) {
                    alert(err.message);
                }
            };
        }
    } catch (err) {
        console.error(err);
        alert("Error loading donor details.");
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