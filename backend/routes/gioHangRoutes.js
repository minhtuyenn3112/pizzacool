const express = require("express");
const router = express.Router();
const { authenticate, onlyCustomer } = require("../middleware/auth");
const {
  addToCart,
  updateCartItem,
  removeCartItem, // thêm hàm mới
  clearCart,
  getCart,
} = require("../controllers/giohangController");

// Tất cả route cần login
router.use(authenticate);

// Lấy giỏ hàng của người dùng
router.get("/", onlyCustomer, getCart);

// Thêm sản phẩm vào giỏ
router.post("/add", onlyCustomer, addToCart);

// Cập nhật số lượng sản phẩm
router.put("/update", onlyCustomer, updateCartItem);

// Xóa một sản phẩm cụ thể
router.delete("/remove", onlyCustomer, removeCartItem);

// Xóa toàn bộ giỏ hàng
router.delete("/clear", onlyCustomer, clearCart);

module.exports = router;
