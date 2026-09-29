const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const controller = require("../controllers/authController");
const { requireAdmin } = require("../middlewares/auth");
const { loginRules, handleValidation } = require("../utils/validators");

// Máximo 10 intentos de login por IP cada 15 minutos.
// Mitiga ataques de fuerza bruta / credential stuffing contra el admin.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Intenta de nuevo en unos minutos." },
});

router.post("/login", loginLimiter, loginRules, handleValidation, controller.login);
router.post("/logout", requireAdmin, controller.logout);
router.get("/me", requireAdmin, controller.me);

module.exports = router;
