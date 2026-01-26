const express = require("express");
const router = express.Router();
const {
  getDashboard,
  getCustomers,
  deleteCustomer,
  updateCustomer,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/adminController");
const { admin, authenticate } = require("../middleware/auth");

// NOTE: import danhGia controller functions
const {
  layTatCaDanhGia,
  phanHoiDanhGia,
} = require("../controllers/danhGiaController");

// Dashboard stats
router.get("/dashboard", authenticate, admin, getDashboard);

// Chỉ admin mới được phép
router.get("/users", authenticate, admin, getCustomers);
router.put("/users/:id", authenticate, admin, updateCustomer);
router.delete("/users/:id", authenticate, admin, deleteCustomer);
router.get("/orders", authenticate, admin, getAllOrders);
router.get("/orders/:orderId", authenticate, admin, getOrderById);
router.put("/orders/:orderId/status", authenticate, admin, updateOrderStatus);

// Admin quản lý đánh giá
router.get("/danhgia", authenticate, admin, layTatCaDanhGia);
router.put("/danhgia/:id/phanhoi", authenticate, admin, phanHoiDanhGia);

module.exports = router;
