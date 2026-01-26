const express = require("express");
const router = express.Router();
const {
  smartOrderLookup,
  smartProductSearch,
  checkVoucher,
} = require("../controllers/aiController");

// Endpoint: POST /api/ai/order (Tra cứu đơn)
router.post("/order", smartOrderLookup);

// Endpoint: POST /api/ai/product (Tìm món ăn)
router.post("/product", smartProductSearch);

// Endpoint: POST /api/ai/voucher (Check mã)
router.post("/voucher", checkVoucher);

module.exports = router;
