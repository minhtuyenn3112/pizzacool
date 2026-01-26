const express = require("express");
const router = express.Router();
const {
  dangKy,
  dangNhap,
  layThongTin,
  capNhatThongTin,
  doiMatKhau,
  xoaTaiKhoan,
} = require("../controllers/nguoiDungController");
const { authenticate, onlyCustomer } = require("../middleware/auth");

router.post("/dangky", dangKy);
router.post("/dangnhap", dangNhap);
router.get("/me", authenticate, onlyCustomer, layThongTin);
router.put("/me", authenticate, onlyCustomer, capNhatThongTin);
router.put("/me/doimatkhau", authenticate, onlyCustomer, doiMatKhau);
router.delete("/me", authenticate, onlyCustomer, xoaTaiKhoan);

module.exports = router;
