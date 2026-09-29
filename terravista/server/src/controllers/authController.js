const bcrypt = require("bcrypt");
const db = require("../db");
const { signAdminToken } = require("../middlewares/auth");

async function login(req, res) {
  const { username, password } = req.body;

  // Consulta parametrizada: nunca se concatena el input del usuario en el SQL
  const admin = db
    .prepare("SELECT * FROM admin_users WHERE username = ?")
    .get(username);

  // Comparamos contra un hash "dummy" aunque el usuario no exista, para que
  // el tiempo de respuesta no revele si el username es válido (mitiga
  // enumeración de usuarios por timing).
  const hashToCompare = admin?.password_hash || "$2b$12$invalidsaltinvalidsaltinvalidsaltiXQ";
  const passwordMatches = await bcrypt.compare(password, hashToCompare);

  if (!admin || !passwordMatches) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }

  const token = signAdminToken(admin);

  res.cookie("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 2 * 60 * 60 * 1000, // 2 horas, igual que la expiración del JWT
  });

  res.json({ ok: true, admin: { id: admin.id, username: admin.username } });
}

function logout(_req, res) {
  res.clearCookie("admin_token");
  res.json({ ok: true });
}

function me(req, res) {
  res.json({ admin: req.admin });
}

module.exports = { login, logout, me };
