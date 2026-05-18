const fs = require("fs");
const db = require("./config/db");

const filePath = "./data/hospitals.geojson";

const geo = JSON.parse(fs.readFileSync(filePath, "utf8"));

async function importHospitals() {
    const features = geo.features || [];
    console.log("Total features:", features.length);
    let inserted = 0;
    for (const f of features) {
        const name = f.properties?.name;
        const coords = f.geometry?.coordinates;
        if (!name || !coords) continue;
        const lng = coords[0];
        const lat = coords[1];
        db.query(
            "INSERT INTO hospitals (hospital_name, latitude, longitude) VALUES (?, ?, ?)",
            [name, lat, lng],
            (err) => {
                if (err) {
                    if (err.code !== 'ER_DUP_ENTRY') console.log("Error:", err.message);
                } else inserted++;
            }
        );
    }
    console.log(`✔ Import finished. Inserted ${inserted} hospitals.`);
}

importHospitals();