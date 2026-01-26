// routes/orderRoutes.js
const express = require("express");

const {
  createOrder,
  vnpayReturn,
  getMyOrders,
  getOrderById,
  cancelOrder,
} = require("../controllers/donHangController.js");

const { authenticate, onlyCustomer } = require("../middleware/auth.js");

const router = express.Router();

// ===========================
// 1. Tạo đơn hàng (COD hoặc VNPAY)
// ===========================
router.post("/", authenticate, onlyCustomer, createOrder);

// ===========================
// 2. Xử lý kết quả VNPAY trả về
// ===========================
router.get("/vnpay-return", vnpayReturn);

// ===========================
// 3. Lấy danh sách đơn hàng của user
// ===========================
router.get("/my-orders", authenticate, onlyCustomer, getMyOrders);

// ===========================
// 4. Lấy chi tiết đơn hàng theo ID
// ===========================
router.get("/:id", authenticate, onlyCustomer, getOrderById);

// ===========================
// 5. Hủy đơn hàng
// ===========================
router.put("/:id/cancel", authenticate, onlyCustomer, cancelOrder);

module.exports = router;
