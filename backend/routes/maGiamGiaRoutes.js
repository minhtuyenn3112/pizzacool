const express = require("express");
const router = express.Router();
const {
  getAll,
  getById,
  create,
  update,
  remove,
  kiemTraMa,
} = require("../controllers/maGiamGiaController");
const { authenticate, onlyCustomer } = require("../middleware/auth");

// CRUD
router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

// API áp dụng mã voucher
router.post("/apply", authenticate, onlyCustomer, kiemTraMa);

module.exports = router;
