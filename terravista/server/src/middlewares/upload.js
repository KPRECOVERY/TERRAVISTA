const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "properties");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Solo estos tipos de imagen están permitidos, validados por su
// "magic number" real (no solo por la extensión del archivo, que se
// puede falsificar fácilmente).
const ALLOWED_MIME_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    // Nunca usamos el nombre original del archivo: evita path traversal
    // (../../etc) y colisiones. Generamos un nombre aleatorio propio.
    const ext = ALLOWED_MIME_TYPES[file.mimetype] || path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    cb(null, safeName);
  },
});

function fileFilter(_req, file, cb) {
  if (!ALLOWED_MIME_TYPES[file.mimetype]) {
    return cb(new Error("Tipo de archivo no permitido. Solo JPG, PNG o WEBP."));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB por imagen
    files: 12, // máximo de imágenes por propiedad en una sola subida
  },
});

module.exports = { upload, UPLOAD_DIR };
