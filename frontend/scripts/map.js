// 1. DATA
var donations = [
    { lat: 36.152, lng: 5.690, type: "O+"},
    { lat: 36.155, lng: 5.700, type: "B+"},
    { lat: 36.140, lng: 5.695, type: "O-"}
];

// 2. SETUP MAP
var map = L.map('map', {
    zoomControl: false 
}).setView([36.152, 5.690], 14); 

L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3'],
    detectRetina: true,
    attribution: 'Map data © Google'
}).addTo(map);

// 3. ICON FACTORY
function createBloodIcon(type) {
    return L.divIcon({
        className: 'custom-marker-wrapper',
        html: `
            <div class="marker-container">
                <div class="ripple">
                    <div class="ring ring-1"></div>
                    <div class="ring ring-2"></div>
                    <div class="ring ring-3"></div>
                </div>
                <div class="blood-marker"><span>${type}</span></div>
            </div>`,
        iconSize: [55, 75],
        iconAnchor: [27, 75] 
    });
}

// 4. THE LOOP WITH POPUPS

async function initMapWithData() {
    try {
        // 1. Fetch data from your backend
        const response = await fetch('http://localhost:3000/searchers/map-data');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const searchers = await response.json();
        
        // 2. Get the current center of the map to calculate distances
        const mapCenter = map.getCenter();

        searchers.forEach(person => {
            // Validate coordinates exist to prevent Leaflet errors
            if (!person.latitude || !person.longitude) return;

            const personLatLng = L.latLng(person.latitude, person.longitude);

            // 3. Calculate real-time distance (meters to km)
            const distance = (mapCenter.distanceTo(personLatLng) / 1000).toFixed(1);

            // 4. Create the custom blood drop marker
            const marker = L.marker([person.latitude, person.longitude], { 
                icon: createBloodIcon(person.blood_type_research) 
            }).addTo(map);

            // 5. Format the "Created At" date
            const dateStr = new Date(person.created_at).toLocaleDateString('en-GB', {
                day: '2-digit', 
                month: 'short', 
                year: 'numeric'
            });

            // 6. Build the Popup HTML (Matching your Figma exactly)
            const popupContent = `
                <div class="donor-card-popup">
                    <div class="card-header">
                        <img src="images/Rectangle.svg" class="card-avatar" alt="Profile">
                        <div class="card-title-group">
                            <div class="name-row">
                                <span class="card-name">${person.full_name}</span>
                                <span class="blood-badge">${person.blood_type_research}</span>
                            </div>
                            ${person.is_urgent ? '<div class="urgency-badge">High Urgency</div>' : ''}
                        </div>
                    </div>
                    
                    <div class="card-details">
                        <div class="detail-row">
                            <img src="images/Vector P.svg" class="icon">
                            <span class="text-main">Nearby, Sétif</span>
                            <span class="text-sub dis">${distance} km away</span>
                        </div>

                        <div class="detail-row">
                            <img src="images/uil_hospital.svg" class="icon">
                            <span class="text-main">${person.Hospital_name || 'General Hospital'}</span>
                        </div>

                        <div class="detail-row">
                            <img src="images/material-symbols-light_post-add.svg" class="icon">
                            <span class="text-sub text-sub1">Request Sent</span>
                            <span class="text-sub date">${dateStr}</span>
                        </div>
                    </div>
                    
                    <button class="view-request-btn" onclick="goToRequest(${person.id})">
                        View Request >
                    </button>
                </div>
            `;

            // 7. Bind and Style the Popup
            marker.bindPopup(popupContent, {
                closeButton: false,
                className: 'custom-leaflet-popup',
                minWidth: 400,
                maxWidth: 400,
                offset: [0, -70]
            });
        });

    } catch (err) {
        console.error("Critical Error: Could not load searcher data onto map:", err);
    }
}

// Global function to handle button clicks inside the popup
function goToRequest(id) {
    console.log("Navigating to request ID:", id);
    window.location.href = `request-details.html?id=${id}`;
}

// Call the function to start
initMapWithData();
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() ;
    
    document.querySelectorAll('.taps').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});

