const { body, param, query, validationResult } = require("express-validator");

// Centraliza el manejo de errores de validación: si algo falla,
// respondemos 400 con detalle en vez de dejar que llegue a la DB.
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const PROPERTY_TYPES = ["casa", "apartamento", "terreno", "local", "otro"];
const PROPERTY_STATUS = ["venta", "renta", "vendida", "reservada"];

const propertyRules = [
  body("title").trim().isLength({ min: 5, max: 150 }).escape(),
  body("description").optional({ nullable: true }).trim().isLength({ max: 3000 }).escape(),
  body("price").isFloat({ min: 0 }),
  body("currency").optional().isIn(["HNL", "USD"]),
  body("property_type").isIn(PROPERTY_TYPES),
  body("status").optional().isIn(PROPERTY_STATUS),
  body("bedrooms").optional().isInt({ min: 0, max: 50 }),
  body("bathrooms").optional().isInt({ min: 0, max: 50 }),
  body("area_m2").optional({ nullable: true }).isFloat({ min: 0 }),
  body("lot_m2").optional({ nullable: true }).isFloat({ min: 0 }),
  body("parking").optional().isInt({ min: 0, max: 20 }),
  body("year_built").optional({ nullable: true }).isInt({ min: 1900, max: 2100 }),
  body("address").trim().isLength({ min: 5, max: 200 }).escape(),
  body("city").trim().isLength({ min: 2, max: 100 }).escape(),
  body("latitude").optional({ nullable: true }).isFloat({ min: -90, max: 90 }),
  body("longitude").optional({ nullable: true }).isFloat({ min: -180, max: 180 }),
  body("featured").optional().isBoolean(),
  body("agent_id").optional({ nullable: true }).isInt({ min: 1 }),
  // Las imágenes ya NO viajan como URLs en el JSON: se suben como archivos
  // reales vía POST /api/properties/:id/images (ver imagesController).
  body("amenities").optional().isArray({ max: 30 }),
  body("amenities.*").optional().trim().isLength({ min: 1, max: 100 }).escape(),
];

const idParamRule = [param("id").isInt({ min: 1 })];

const listQueryRules = [
  query("city").optional().trim().escape(),
  query("property_type").optional().isIn(PROPERTY_TYPES),
  query("status").optional().isIn(PROPERTY_STATUS),
  query("min_price").optional().isFloat({ min: 0 }),
  query("max_price").optional().isFloat({ min: 0 }),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 50 }),
];

const loginRules = [
  body("username").trim().isLength({ min: 3, max: 50 }).escape(),
  body("password").isLength({ min: 8, max: 200 }),
];

module.exports = {
  handleValidation,
  propertyRules,
  idParamRule,
  listQueryRules,
  loginRules,
  PROPERTY_TYPES,
  PROPERTY_STATUS,
};
