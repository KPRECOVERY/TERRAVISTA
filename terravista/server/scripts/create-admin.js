/**
 * Uso: node scripts/create-admin.js <username> <password>
 * Crea (o actualiza la contraseña de) un usuario administrador.
 * Nunca guardamos la contraseña en texto plano, solo su hash bcrypt.
 */
require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("../src/db");

async function main() {
  const [username, password] = process.argv.slice(2);

  if (!username || !password) {
    console.error("Uso: node scripts/create-admin.js <username> <password>");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("La contraseña debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  db.prepare(
    `INSERT INTO admin_users (username, password_hash)
     VALUES (?, ?)
     ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash`
  ).run(username, passwordHash);

  console.log(`Usuario admin "${username}" creado/actualizado correctamente.`);
}

main();
