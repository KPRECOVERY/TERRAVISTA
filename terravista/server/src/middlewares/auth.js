const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET no está definido. Revisa tu archivo .env");
}

/**
 * Protege rutas de escritura (crear/editar/eliminar propiedades).
 * Lee el token desde una cookie httpOnly (nunca desde localStorage,
 * para reducir la superficie de ataque de XSS).
 */
function requireAdmin(req, res, next) {
  const token = req.cookies?.admin_token;

  if (!token) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.admin = { id: payload.sub, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Sesión inválida o expirada" });
  }
}

function signAdminToken(admin) {
  return jwt.sign(
    { sub: admin.id, username: admin.username },
    JWT_SECRET,
    { expiresIn: "2h" }
  );
}

module.exports = { requireAdmin, signAdminToken };
