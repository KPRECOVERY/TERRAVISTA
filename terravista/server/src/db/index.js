const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

// Archivo físico de la base de datos. Vive fuera del repo (ver .gitignore).
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "..", "data", "database.sqlite");

// Asegurar que exista la carpeta /data
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// WAL mejora la concurrencia lectura/escritura, ideal para un catálogo
// con muchas lecturas públicas y pocas escrituras desde el admin.
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Aplicar el esquema si no existe (idempotente gracias a IF NOT EXISTS)
const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
db.exec(schema);

module.exports = db;
