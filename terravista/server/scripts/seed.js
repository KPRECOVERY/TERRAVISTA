/**
 * Seed de datos de ejemplo para demos/presentaciones.
 * Uso: npm run seed
 *
 * Inserta un agente y 6 propiedades con descripción, precio, amenidades
 * y fotos reales (se descargan una vez y quedan guardadas en
 * uploads/properties/, igual que si las hubiera subido el admin).
 *
 * Es seguro correrlo varias veces: si ya existen propiedades de ejemplo
 * (detectadas por título), no las duplica.
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const db = require("../src/db");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "properties");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const AGENT = {
  name: "María Elena Rodríguez",
  role: "Agente certificada",
  phone: "+504 9988-7766",
  email: "maria.rodriguez@terravista.hn",
  photo_url: null,
};

const PROPERTIES = [
  {
    title: "Residencia moderna en Lomas del Guijarro",
    description:
      "Residencia de dos niveles ubicada en una de las zonas más exclusivas de la capital. Diseño contemporáneo con acabados de alta calidad, amplios espacios iluminados naturalmente y áreas verdes privadas. A pocos minutos de centros comerciales, colegios bilingües y vías principales.",
    price: 4850000,
    currency: "HNL",
    property_type: "casa",
    status: "venta",
    bedrooms: 4,
    bathrooms: 3,
    area_m2: 320,
    lot_m2: 480,
    parking: 2,
    year_built: 2019,
    address: "Lomas del Guijarro Sur, Calle Principal",
    city: "Tegucigalpa",
    featured: 1,
    amenities: ["Cocina integral con isla", "Cuarto de servicio", "Sistema de seguridad 24/7", "Jardín privado", "Terraza techada", "Aires acondicionados"],
    imageQuery: "modern-house",
  },
  {
    title: "Apartamento con vista a la ciudad",
    description:
      "Cómodo apartamento de un nivel con vista panorámica de Tegucigalpa. Ideal para profesionales o parejas jóvenes. Edificio con gimnasio, área social y vigilancia permanente.",
    price: 2100000,
    currency: "HNL",
    property_type: "apartamento",
    status: "venta",
    bedrooms: 2,
    bathrooms: 2,
    area_m2: 145,
    lot_m2: null,
    parking: 1,
    year_built: 2021,
    address: "Colonia Palmira, Torre Alta Vista",
    city: "Tegucigalpa",
    featured: 1,
    amenities: ["Gimnasio del edificio", "Balcón", "Closets empotrados", "Vigilancia 24/7"],
    imageQuery: "city-apartment",
  },
  {
    title: "Casa familiar con jardín amplio",
    description:
      "Casa de un nivel pensada para familias, con jardín amplio ideal para niños y mascotas. Ubicada en zona residencial tranquila, cerca de colegios y supermercados.",
    price: 3300000,
    currency: "HNL",
    property_type: "casa",
    status: "renta",
    bedrooms: 3,
    bathrooms: 2,
    area_m2: 260,
    lot_m2: 350,
    parking: 2,
    year_built: 2015,
    address: "Residencial Plaza, 3ra Calle",
    city: "Tegucigalpa",
    featured: 0,
    amenities: ["Jardín amplio", "Cuarto de servicio", "Parqueo techado"],
    imageQuery: "family-house-garden",
  },
  {
    title: "Estudio moderno cerca del centro",
    description:
      "Estudio compacto y funcional, perfecto para estudiantes o primera vivienda. A pocos minutos del centro histórico y de las principales universidades.",
    price: 980000,
    currency: "HNL",
    property_type: "apartamento",
    status: "venta",
    bedrooms: 1,
    bathrooms: 1,
    area_m2: 55,
    lot_m2: null,
    parking: 0,
    year_built: 2020,
    address: "Barrio Guacerique, Edificio Centro Vida",
    city: "Tegucigalpa",
    featured: 0,
    amenities: ["Cocina equipada", "Internet incluido"],
    imageQuery: "studio-apartment",
  },
  {
    title: "Terreno con vista para proyecto residencial",
    description:
      "Terreno plano con excelente ubicación y vista despejada, ideal para desarrollo residencial o construcción de vivienda personalizada. Acceso pavimentado y servicios básicos cercanos.",
    price: 1500000,
    currency: "HNL",
    property_type: "terreno",
    status: "venta",
    bedrooms: 0,
    bathrooms: 0,
    area_m2: null,
    lot_m2: 900,
    parking: 0,
    year_built: null,
    address: "Valle de Ángeles, Km 22",
    city: "Valle de Ángeles",
    featured: 0,
    amenities: ["Acceso pavimentado", "Servicios básicos cercanos"],
    imageQuery: "land-plot-mountains",
  },
  {
    title: "Local comercial en zona de alto tráfico",
    description:
      "Local comercial de dos plantas, ubicado sobre avenida principal con alto flujo peatonal y vehicular. Apto para restaurante, banco o tienda ancla.",
    price: 5200000,
    currency: "HNL",
    property_type: "local",
    status: "venta",
    bedrooms: 0,
    bathrooms: 2,
    area_m2: 410,
    lot_m2: 500,
    parking: 6,
    year_built: 2017,
    address: "Boulevard Morazán, frente a Plaza Miraflores",
    city: "Tegucigalpa",
    featured: 1,
    amenities: ["Fachada de vidrio", "Parqueo para clientes", "Bodega en planta baja"],
    imageQuery: "commercial-building-storefront",
  },
];

// Fuente estable de imágenes de ejemplo, libres de usar. Cada llamada con
// una "seed" fija siempre devuelve la misma imagen, así el resultado es
// reproducible en cada corrida del script.
function sampleImageUrl(seed) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/800`;
}

async function downloadImage(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo descargar ${url}: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
}

async function main() {
  const insertAgent = db.prepare(
    "INSERT INTO agents (name, role, phone, email, photo_url) VALUES (@name, @role, @phone, @email, @photo_url)"
  );
  const existingAgent = db.prepare("SELECT id FROM agents WHERE email = ?").get(AGENT.email);
  const agentId = existingAgent ? existingAgent.id : insertAgent.run(AGENT).lastInsertRowid;

  const insertProperty = db.prepare(`
    INSERT INTO properties
      (title, description, price, currency, property_type, status, bedrooms,
       bathrooms, area_m2, lot_m2, parking, year_built, address, city,
       featured, agent_id)
    VALUES
      (@title, @description, @price, @currency, @property_type, @status, @bedrooms,
       @bathrooms, @area_m2, @lot_m2, @parking, @year_built, @address, @city,
       @featured, @agent_id)
  `);
  const insertImage = db.prepare("INSERT INTO property_images (property_id, url, position) VALUES (?, ?, ?)");
  const insertAmenity = db.prepare("INSERT INTO property_amenities (property_id, label) VALUES (?, ?)");
  const findExisting = db.prepare("SELECT id FROM properties WHERE title = ?");

  for (const p of PROPERTIES) {
    if (findExisting.get(p.title)) {
      console.log(`— Ya existe: "${p.title}", se omite.`);
      continue;
    }

    const propertyId = insertProperty.run({ ...p, agent_id: agentId }).lastInsertRowid;

    p.amenities.forEach((label) => insertAmenity.run(propertyId, label));

    // Dos fotos por propiedad, descargadas una sola vez y guardadas en disco
    for (let i = 0; i < 2; i++) {
      const seed = `${p.imageQuery}-${propertyId}-${i}`;
      const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.jpg`;
      const destPath = path.join(UPLOAD_DIR, filename);
      try {
        await downloadImage(sampleImageUrl(seed), destPath);
        insertImage.run(propertyId, `/uploads/properties/${filename}`, i);
      } catch (err) {
        console.warn(`  (no se pudo descargar foto para "${p.title}": ${err.message})`);
      }
    }

    console.log(`✓ Creada: "${p.title}"`);
  }

  console.log("\nListo. Propiedades de ejemplo cargadas.");
}

main().catch((err) => {
  console.error("Error corriendo el seed:", err);
  process.exit(1);
});
