const express = require("express");
const { param } = require("express-validator");
const router = express.Router();

const controller = require("../controllers/propertiesController");
const imagesController = require("../controllers/imagesController");
const { requireAdmin } = require("../middlewares/auth");
const { upload } = require("../middlewares/upload");
const {
  propertyRules,
  idParamRule,
  listQueryRules,
  handleValidation,
} = require("../utils/validators");

// Público: cualquiera puede ver el catálogo (es un catálogo estático de lectura)
router.get("/", listQueryRules, handleValidation, controller.list);

// Admin: ve TODO el catálogo, incluyendo vendidas/reservadas.
// Va antes de "/:id" para que "admin/all" no se confunda con un id.
router.get("/admin/all", requireAdmin, controller.listAllForAdmin);

router.get("/:id", idParamRule, handleValidation, controller.getById);

// Protegido: solo el admin autenticado puede modificar el catálogo
router.post("/", requireAdmin, propertyRules, handleValidation, controller.create);
router.put("/:id", requireAdmin, [...idParamRule, ...propertyRules], handleValidation, controller.update);
router.delete("/:id", requireAdmin, idParamRule, handleValidation, controller.remove);

// Imágenes: subida real de archivos (multipart/form-data, campo "images")
router.post(
  "/:id/images",
  requireAdmin,
  idParamRule,
  handleValidation,
  upload.array("images", 12),
  imagesController.uploadImages
);
router.delete(
  "/:propertyId/images/:imageId",
  requireAdmin,
  [param("propertyId").isInt({ min: 1 }), param("imageId").isInt({ min: 1 })],
  handleValidation,
  imagesController.deleteImage
);

module.exports = router;
