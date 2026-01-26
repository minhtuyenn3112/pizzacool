const express = require("express");
const {
  taoDanhGia,
  layDanhGiaTheoSanPham,
  layDanhGiaTheoNguoiDung,
} = require("../controllers/danhGiaController");
const router = express.Router();

router.post("/", taoDanhGia);
router.get("/sanpham/:id", layDanhGiaTheoSanPham);
router.get("/nguoidung/:id", layDanhGiaTheoNguoiDung);

module.exports = router;
