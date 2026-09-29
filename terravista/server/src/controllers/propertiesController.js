const db = require("../db");

// ------------------------------------------------------------------
// Helpers internos
// ------------------------------------------------------------------

function attachRelations(property) {
  // Cada imagen viaja con su id para que el admin pueda borrar una imagen
  // puntual sin afectar las demás.
  const images = db
    .prepare("SELECT id, url FROM property_images WHERE property_id = ? ORDER BY position ASC")
    .all(property.id);

  const amenities = db
    .prepare("SELECT label FROM property_amenities WHERE property_id = ?")
    .all(property.id)
    .map((r) => r.label);

  const agent = property.agent_id
    ? db.prepare("SELECT id, name, role, phone, email, photo_url FROM agents WHERE id = ?").get(property.agent_id)
    : null;

  return { ...property, images, amenities, agent };
}

// ------------------------------------------------------------------
// GET /api/properties  — catálogo público, con filtros y paginación
// ------------------------------------------------------------------
function list(req, res) {
  const { city, property_type, status, min_price, max_price } = req.query;
  const page = parseInt(req.query.page || "1", 10);
  const limit = parseInt(req.query.limit || "12", 10);
  const offset = (page - 1) * limit;

  // Construimos el WHERE dinámicamente pero SIEMPRE con placeholders (?),
  // nunca interpolando el valor directamente en el string SQL.
  const conditions = [];
  const params = [];

  if (city) {
    conditions.push("city = ?");
    params.push(city);
  }
  if (property_type) {
    conditions.push("property_type = ?");
    params.push(property_type);
  }
  if (status) {
    conditions.push("status = ?");
    params.push(status);
  } else {
    // Por defecto el catálogo público solo muestra activas
    conditions.push("status IN ('venta','renta')");
  }
  if (min_price) {
    conditions.push("price >= ?");
    params.push(min_price);
  }
  if (max_price) {
    conditions.push("price <= ?");
    params.push(max_price);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const total = db
    .prepare(`SELECT COUNT(*) AS count FROM properties ${whereClause}`)
    .get(...params).count;

  const rows = db
    .prepare(
      `SELECT * FROM properties ${whereClause}
       ORDER BY featured DESC, created_at DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset);

  res.json({
    data: rows.map(attachRelations),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// ------------------------------------------------------------------
// GET /api/properties/admin/all — solo admin, sin filtro de estado
// (el panel necesita ver también propiedades vendidas/reservadas)
// ------------------------------------------------------------------
function listAllForAdmin(_req, res) {
  const rows = db
    .prepare("SELECT * FROM properties ORDER BY created_at DESC")
    .all();
  res.json({ data: rows.map(attachRelations) });
}

// ------------------------------------------------------------------
// GET /api/properties/:id
// ------------------------------------------------------------------
function getById(req, res) {
  const property = db.prepare("SELECT * FROM properties WHERE id = ?").get(req.params.id);

  if (!property) {
    return res.status(404).json({ error: "Propiedad no encontrada" });
  }

  res.json({ data: attachRelations(property) });
}

// ------------------------------------------------------------------
// POST /api/properties  — solo admin
// ------------------------------------------------------------------
const insertProperty = db.prepare(`
  INSERT INTO properties
    (title, description, price, currency, property_type, status, bedrooms,
     bathrooms, area_m2, lot_m2, parking, year_built, address, city,
     latitude, longitude, featured, agent_id)
  VALUES
    (@title, @description, @price, @currency, @property_type, @status, @bedrooms,
     @bathrooms, @area_m2, @lot_m2, @parking, @year_built, @address, @city,
     @latitude, @longitude, @featured, @agent_id)
`);

const insertAmenity = db.prepare(
  "INSERT INTO property_amenities (property_id, label) VALUES (?, ?)"
);

function create(req, res) {
  const b = req.body;

  // Transacción: si falla cualquier parte (propiedad, imágenes, amenidades),
  // no queda un registro a medias en la base de datos.
  const createTx = db.transaction((body) => {
    const result = insertProperty.run({
      title: body.title,
      description: body.description || null,
      price: body.price,
      currency: body.currency || "HNL",
      property_type: body.property_type,
      status: body.status || "venta",
      bedrooms: body.bedrooms ?? 0,
      bathrooms: body.bathrooms ?? 0,
      area_m2: body.area_m2 ?? null,
      lot_m2: body.lot_m2 ?? null,
      parking: body.parking ?? 0,
      year_built: body.year_built ?? null,
      address: body.address,
      city: body.city,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      featured: body.featured ? 1 : 0,
      agent_id: body.agent_id ?? null,
    });

    const propertyId = result.lastInsertRowid;

    // Las imágenes se agregan después con POST /:id/images (subida real de archivos)
    (body.amenities || []).forEach((label) => insertAmenity.run(propertyId, label));

    return propertyId;
  });

  const propertyId = createTx(b);
  const created = db.prepare("SELECT * FROM properties WHERE id = ?").get(propertyId);

  res.status(201).json({ data: attachRelations(created) });
}

// ------------------------------------------------------------------
// PUT /api/properties/:id  — solo admin
// ------------------------------------------------------------------
const updateProperty = db.prepare(`
  UPDATE properties SET
    title = @title, description = @description, price = @price, currency = @currency,
    property_type = @property_type, status = @status, bedrooms = @bedrooms,
    bathrooms = @bathrooms, area_m2 = @area_m2, lot_m2 = @lot_m2, parking = @parking,
    year_built = @year_built, address = @address, city = @city,
    latitude = @latitude, longitude = @longitude, featured = @featured, agent_id = @agent_id
  WHERE id = @id
`);
const deleteAmenities = db.prepare("DELETE FROM property_amenities WHERE property_id = ?");

function update(req, res) {
  const id = Number(req.params.id);
  const existing = db.prepare("SELECT id FROM properties WHERE id = ?").get(id);

  if (!existing) {
    return res.status(404).json({ error: "Propiedad no encontrada" });
  }

  const b = req.body;

  const updateTx = db.transaction((body) => {
    updateProperty.run({
      id,
      title: body.title,
      description: body.description || null,
      price: body.price,
      currency: body.currency || "HNL",
      property_type: body.property_type,
      status: body.status || "venta",
      bedrooms: body.bedrooms ?? 0,
      bathrooms: body.bathrooms ?? 0,
      area_m2: body.area_m2 ?? null,
      lot_m2: body.lot_m2 ?? null,
      parking: body.parking ?? 0,
      year_built: body.year_built ?? null,
      address: body.address,
      city: body.city,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      featured: body.featured ? 1 : 0,
      agent_id: body.agent_id ?? null,
    });

    // Las amenidades se reemplazan por completo en cada edición. Las
    // imágenes NO se tocan aquí: se gestionan aparte con los endpoints
    // de subida/borrado de archivos.
    deleteAmenities.run(id);
    (body.amenities || []).forEach((label) => insertAmenity.run(id, label));
  });

  updateTx(b);

  const updated = db.prepare("SELECT * FROM properties WHERE id = ?").get(id);
  res.json({ data: attachRelations(updated) });
}

// ------------------------------------------------------------------
// DELETE /api/properties/:id  — solo admin
// ------------------------------------------------------------------
function remove(req, res) {
  const id = Number(req.params.id);
  // ON DELETE CASCADE en el esquema limpia imágenes y amenidades automáticamente
  const result = db.prepare("DELETE FROM properties WHERE id = ?").run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Propiedad no encontrada" });
  }

  res.status(204).send();
}

module.exports = { list, listAllForAdmin, getById, create, update, remove };
