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

// 4. THE LOOP
donations.forEach(function(donor) {
    // We create a marker at the lat/lng and use our icon function
    L.marker([donor.lat, donor.lng], { 
        icon: createBloodIcon(donor.type) 
    }).addTo(map);
});
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() ;
    
    document.querySelectorAll('.taps').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});

//Without L., the browser wouldn't understand what a map 
// or a marker is. It keeps the Leaflet code organized 
// and prevents it from clashing with other libraries 
// you might be using (like Google Maps or Mapbox).
//
// When the user clicks anywhere on the map...
//map.on('click', function(e) {
    // 1. Get the coordinates of the click
  //  var lat = e.latlng.lat;
    //var lng = e.latlng.lng;

    // 2. Ask the user for their blood type (simple popup for now)
    //var bloodType = prompt("Enter Blood Type (e.g., AB+):");

    //if (bloodType) {
        // 3. Use your function to drop the marker immediately!
      //  L.marker([lat, lng], { 
          //  icon: createBloodIcon(bloodType) 
        //}).addTo(map);
   // }
//});