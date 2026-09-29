require("dotenv").config();

const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const propertiesRoutes = require("./routes/properties");
const authRoutes = require("./routes/auth");

const app = express();

const CLIENT_DIST = path.join(__dirname, "..", "public");
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

// Cabeceras HTTP seguras. Relajamos un poco crossOriginResourcePolicy
// para que las imágenes servidas desde /uploads se puedan cargar
// normalmente en el mismo sitio (es todo un único origen igual).
app.use(
  helmet({
    contentSecurityPolicy: false, // el build de Vite gestiona sus propios scripts/estilos
  })
);

// Todo vive en el mismo origen (mismo dominio y puerto), así que ya no
// necesitamos CORS entre frontend y backend. Se deja configurable por si
// en el futuro se separa un dominio de administración aparte.
if (process.env.FRONTEND_URL) {
  app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
}

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Límite general de requests por IP, adicional al límite específico de /login
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use("/api/properties", propertiesRoutes);
app.use("/api/auth", authRoutes);
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Archivos de imágenes subidos por el admin. Es una carpeta de solo
// archivos estáticos: express.static nunca ejecuta lo que hay adentro,
// así que aunque alguien suba algo raro no hay riesgo de ejecución.
app.use(
  "/uploads",
  express.static(UPLOADS_DIR, {
    maxAge: "7d",
    setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
  })
);

// Frontend ya compilado (resultado de `npm run build` en /client).
// Al servirlo desde el mismo Express, todo el sitio queda en un solo
// proceso y un solo puerto: no hace falta un servidor aparte para el front.
app.use(express.static(CLIENT_DIST));

// Cualquier ruta que no sea /api ni /uploads devuelve index.html,
// para que el enrutador de React (rutas como /propiedad/12) funcione
// al recargar la página o entrar por URL directa.
app.get(/^(?!\/api|\/uploads).*/, (_req, res) => {
  res.sendFile(path.join(CLIENT_DIST, "index.html"));
});

// Manejador de errores centralizado: nunca exponemos detalles internos
// (stack traces, mensajes de SQLite, errores de Multer, etc.) al cliente.
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.message?.includes("Tipo de archivo no permitido")) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: "Error interno del servidor" });
});

module.exports = app;
