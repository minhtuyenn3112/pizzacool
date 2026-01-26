// backend/controllers/maGiamGiaController.js
const MaGiamGia = require("../model/MaGiamGia");

// Lấy tất cả
exports.getAll = async (req, res) => {
  try {
    const list = await MaGiamGia.find();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Lấy 1
exports.getById = async (req, res) => {
  try {
    const item = await MaGiamGia.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Tạo mới
exports.create = async (req, res) => {
  try {
    const {
      tenMa,
      maCode,
      giaTriGiam,
      ngayBatDau,
      ngayKetThuc,
      conHieuLuc,
      Mota,
      dieuKienToiThieu,
      soLuotSuDung,
      soLuotDaSuDung,
      chiTietDieuKien,
    } = req.body;

    if (!tenMa || !maCode || giaTriGiam == null) {
      return res
        .status(400)
        .json({ message: "tenMa, maCode và giaTriGiam là bắt buộc" });
    }

    const mg = await MaGiamGia.create({
      tenMa,
      maCode,
      giaTriGiam,
      ngayBatDau,
      ngayKetThuc,
      conHieuLuc,
      Mota,
      dieuKienToiThieu: dieuKienToiThieu || 0,
      soLuotSuDung: soLuotSuDung !== undefined ? soLuotSuDung : -1,
      soLuotDaSuDung: soLuotDaSuDung || 0,
      chiTietDieuKien: chiTietDieuKien || "",
    });

    res.status(201).json(mg);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// Cập nhật
exports.update = async (req, res) => {
  try {
    const {
      tenMa,
      maCode,
      giaTriGiam,
      ngayBatDau,
      ngayKetThuc,
      conHieuLuc,
      Mota,
      dieuKienToiThieu,
      soLuotSuDung,
      soLuotDaSuDung,
      chiTietDieuKien,
    } = req.body;

    const updated = await MaGiamGia.findByIdAndUpdate(
      req.params.id,
      {
        tenMa,
        maCode,
        giaTriGiam,
        ngayBatDau,
        ngayKetThuc,
        conHieuLuc,
        Mota,
        dieuKienToiThieu,
        soLuotSuDung,
        soLuotDaSuDung,
        chiTietDieuKien,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Không tìm thấy" });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// Xóa
exports.remove = async (req, res) => {
  try {
    const deleted = await MaGiamGia.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy" });
    res.json({ message: "Đã xóa" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.kiemTraMa = async (req, res) => {
  try {
    const { ma, tongTien } = req.body;

    if (!ma || typeof tongTien !== "number") {
      return res.status(400).json({
        success: false,
        message: "Vui lòng gửi mã và tổng tiền giỏ hàng",
      });
    }

    const mg = await MaGiamGia.findOne({ maCode: ma });
    if (!mg)
      return res
        .status(404)
        .json({ success: false, message: "Mã không hợp lệ" });

    const now = new Date();
    if (mg.ngayBatDau && now < mg.ngayBatDau)
      return res
        .status(400)
        .json({ success: false, message: "Mã chưa bắt đầu" });
    if (mg.ngayKetThuc && now > mg.ngayKetThuc)
      return res.status(400).json({ success: false, message: "Mã đã hết hạn" });
    if (!mg.conHieuLuc)
      return res.status(400).json({ success: false, message: "Mã đã bị khóa" });

    // Kiểm tra điều kiện tối thiểu
    if (tongTien < mg.dieuKienToiThieu)
      return res.status(400).json({
        success: false,
        message: `Mã này chỉ áp dụng cho đơn hàng từ ${mg.dieuKienToiThieu.toLocaleString()}đ trở lên`,
        minAmount: mg.dieuKienToiThieu,
      });

    // Kiểm tra số lượt sử dụng
    if (mg.soLuotSuDung > 0 && mg.soLuotDaSuDung >= mg.soLuotSuDung)
      return res.status(400).json({
        success: false,
        message: "Mã này đã hết số lượt sử dụng",
      });

    // Tính tiền sau giảm
    const giam = mg.giaTriGiam;
    const thanhTien = Math.max(tongTien - giam, 0);

    res.json({
      success: true,
      discountAmount: giam,
      finalTotal: thanhTien,
      thongTinMa: mg,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
