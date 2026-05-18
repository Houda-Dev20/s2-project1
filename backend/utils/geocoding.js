async function getHospitalCoords(name) {
    try {
const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&namedetails=1&q=${encodeURIComponent(name + ", hospital, Algeria")}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(url, {
            signal: controller.signal,
            headers: { "User-Agent": "blood-donation-app" }
        });

        clearTimeout(timeout);

        const data = await res.json();
        if (!data.length) return null;

        return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
        };

    } catch (err) {
        console.log("Geocoding failed:", err.message);
        return null;
    }
}

module.exports = { getHospitalCoords };