-- ============================================================
-- Esquema de base de datos - Catálogo de bienes inmuebles
-- SQLite
-- ============================================================

PRAGMA foreign_keys = ON;

-- Agentes / vendedores que aparecen como contacto de una propiedad
CREATE TABLE IF NOT EXISTS agents (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  role        TEXT DEFAULT 'Agente certificado',
  phone       TEXT NOT NULL,
  email       TEXT NOT NULL,
  photo_url   TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Propiedades del catálogo
CREATE TABLE IF NOT EXISTS properties (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT NOT NULL,
  description   TEXT,
  price         REAL NOT NULL CHECK (price >= 0),
  currency      TEXT NOT NULL DEFAULT 'HNL',
  property_type TEXT NOT NULL CHECK (property_type IN ('casa','apartamento','terreno','local','otro')),
  status        TEXT NOT NULL DEFAULT 'venta' CHECK (status IN ('venta','renta','vendida','reservada')),
  bedrooms      INTEGER DEFAULT 0,
  bathrooms     INTEGER DEFAULT 0,
  area_m2       REAL,
  lot_m2        REAL,
  parking       INTEGER DEFAULT 0,
  year_built    INTEGER,
  address       TEXT NOT NULL,
  city          TEXT NOT NULL,
  latitude      REAL,
  longitude     REAL,
  featured      INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0,1)),
  agent_id      INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Imágenes de cada propiedad (una propiedad tiene muchas imágenes)
CREATE TABLE IF NOT EXISTS property_images (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id  INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  position     INTEGER NOT NULL DEFAULT 0
);

-- Amenidades / comodidades de cada propiedad
CREATE TABLE IF NOT EXISTS property_amenities (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id  INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  label        TEXT NOT NULL
);

-- Usuarios administradores del panel (NO usuarios finales del sitio público)
CREATE TABLE IF NOT EXISTS admin_users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Índices para acelerar los filtros más comunes del catálogo
CREATE INDEX IF NOT EXISTS idx_properties_status   ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city      ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_type      ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_featured  ON properties(featured);
CREATE INDEX IF NOT EXISTS idx_property_images_pid  ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_amenities_pid ON property_amenities(property_id);

-- Trigger para mantener updated_at al día en cada edición
CREATE TRIGGER IF NOT EXISTS trg_properties_updated_at
AFTER UPDATE ON properties
FOR EACH ROW
BEGIN
  UPDATE properties SET updated_at = datetime('now') WHERE id = OLD.id;
END;
