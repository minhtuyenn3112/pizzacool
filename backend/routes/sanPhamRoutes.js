const express = require("express");
const {
  layTatCaSanPham,
  laySanPhamTheoId,
  themSanPham,
  capNhatSanPham,
  xoaSanPham,
  getRelatedProducts,
  layTongSoLuongDaBan,
} = require("../controllers/sanPhamController");

const router = express.Router();

// Route này giờ đây xử lý cả hai:
// 1. GET /api/sanpham (lấy tất cả)
// 2. GET /api/sanpham?loai=pizza (lọc theo loại)
router.get("/", layTatCaSanPham);
// GET /api/sanpham/related/:id
router.get("/related/:id", getRelatedProducts);
// GET /api/sanpham/sales/total - Lấy tổng số lượng đã bán
router.get("/sales/total", layTongSoLuongDaBan);
router.get("/:id", laySanPhamTheoId);
router.post("/", themSanPham);
router.put("/:id", capNhatSanPham);
router.delete("/:id", xoaSanPham);

module.exports = router;
