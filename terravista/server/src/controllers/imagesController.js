const fs = require("fs");
const path = require("path");
const db = require("../db");
const { UPLOAD_DIR } = require("../middlewares/upload");

const insertImage = db.prepare(
  "INSERT INTO property_images (property_id, url, position) VALUES (?, ?, ?)"
);

// POST /api/properties/:id/images  (multipart/form-data, campo "images")
function uploadImages(req, res) {
  const propertyId = Number(req.params.id);
  const property = db.prepare("SELECT id FROM properties WHERE id = ?").get(propertyId);

  if (!property) {
    // Si la propiedad no existe, no dejamos archivos huérfanos en disco
    (req.files || []).forEach((f) => fs.unlink(f.path, () => {}));
    return res.status(404).json({ error: "Propiedad no encontrada" });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No se recibió ninguna imagen" });
  }

  const maxPos = db
    .prepare("SELECT COALESCE(MAX(position), -1) AS maxPos FROM property_images WHERE property_id = ?")
    .get(propertyId).maxPos;

  const inserted = req.files.map((file, i) => {
    // Guardamos solo la ruta relativa pública, nunca la ruta absoluta del disco
    const relativeUrl = `/uploads/properties/${file.filename}`;
    const result = insertImage.run(propertyId, relativeUrl, maxPos + 1 + i);
    return { id: result.lastInsertRowid, url: relativeUrl };
  });

  res.status(201).json({ data: inserted });
}

// DELETE /api/properties/:propertyId/images/:imageId
function deleteImage(req, res) {
  const { propertyId, imageId } = req.params;

  const image = db
    .prepare("SELECT * FROM property_images WHERE id = ? AND property_id = ?")
    .get(imageId, propertyId);

  if (!image) {
    return res.status(404).json({ error: "Imagen no encontrada" });
  }

  db.prepare("DELETE FROM property_images WHERE id = ?").run(imageId);

  // Borramos el archivo físico también. Verificamos que la ruta resultante
  // siga dentro de UPLOAD_DIR antes de borrar, como defensa adicional.
  const filename = path.basename(image.url);
  const filePath = path.join(UPLOAD_DIR, filename);
  if (filePath.startsWith(UPLOAD_DIR)) {
    fs.unlink(filePath, () => {}); // si ya no existe, ignoramos el error
  }

  res.status(204).send();
}

module.exports = { uploadImages, deleteImage };
