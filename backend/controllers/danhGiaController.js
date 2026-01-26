const DanhGia = require("../model/DanhGia");
const SanPham = require("../model/SanPham");
const NguoiDung = require("../model/NguoiDung");

exports.taoDanhGia = async (req, res) => {
  try {
    const dg = await DanhGia.create(req.body);
    res.status(201).json(dg);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.layDanhGiaTheoSanPham = async (req, res) => {
  const ds = await DanhGia.find({ sanPham: req.params.id }).populate(
    "nguoiDung"
  );
  res.json(ds);
};

// Lấy đánh giá của 1 người dùng
exports.layDanhGiaTheoNguoiDung = async (req, res) => {
  try {
    const userId = req.params.id;
    const ds = await DanhGia.find({ nguoiDung: userId })
      .populate("sanPham", "ten")
      .sort({ createdAt: -1 });
    res.json(ds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi lấy đánh giá của người dùng" });
  }
};

// --- Admin: lấy tất cả đánh giá (kèm product + user)
exports.layTatCaDanhGia = async (req, res) => {
  try {
    const ds = await DanhGia.find()
      .populate("nguoiDung", "hoTen email")
      .populate("sanPham", "ten")
      .sort({ createdAt: -1 });
    res.json(ds);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách đánh giá" });
  }
};

// --- Admin: phản hồi đánh giá
exports.phanHoiDanhGia = async (req, res) => {
  try {
    const { id } = req.params;
    const { phanHoi } = req.body;

    const dg = await DanhGia.findById(id);
    if (!dg)
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });

    dg.phanHoi = phanHoi;
    dg.phanHoiAt = new Date();
    await dg.save();

    // populate for response
    const updated = await DanhGia.findById(id)
      .populate("nguoiDung", "hoTen email")
      .populate("sanPham", "ten");

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi phản hồi đánh giá" });
  }
};
