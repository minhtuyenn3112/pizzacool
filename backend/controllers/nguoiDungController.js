const NguoiDung = require("../model/NguoiDung");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const JWT_EXPIRES_IN = "7d";
const ADMIN_EMAILS = ["nguyenduyphu1309@gmail.com"]; // danh sách email admin

// Helper: ẩn mật khẩu
function hidePassword(userDoc) {
  if (!userDoc) return userDoc;
  const obj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete obj.matKhau;
  return obj;
}

// ------------------- Đăng ký -------------------
exports.dangKy = async (req, res) => {
  try {
    const { hoTen, email, matKhau, soDienThoai, diaChi } = req.body;
    if (!email || !matKhau || !hoTen)
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });

    const exist = await NguoiDung.findOne({ email });
    if (exist)
      return res.status(409).json({ message: "Email đã được sử dụng" });

    const hashed = await bcrypt.hash(matKhau, 10);
    const vaiTro = ADMIN_EMAILS.includes(email) ? "quan_tri" : "khach_hang";

    const nguoiDung = await NguoiDung.create({
      hoTen,
      email,
      matKhau: hashed,
      soDienThoai,
      diaChi,
      vaiTro,
    });

    res.status(201).json(hidePassword(nguoiDung));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ------------------- Đăng nhập -------------------
exports.dangNhap = async (req, res) => {
  try {
    const { email, matKhau } = req.body;
    if (!email || !matKhau)
      return res.status(400).json({ message: "Thiếu email hoặc mật khẩu" });

    const user = await NguoiDung.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Sai thông tin đăng nhập" });

    const match = await bcrypt.compare(matKhau, user.matKhau);
    if (!match)
      return res.status(401).json({ message: "Sai thông tin đăng nhập" });

    const token = jwt.sign(
      { id: user._id, email: user.email, vaiTro: user.vaiTro },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ token, user: hidePassword(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------- Lấy thông tin người dùng -------------------
exports.layThongTin = async (req, res) => {
  try {
    const user = await NguoiDung.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.json(hidePassword(user));
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ------------------- Cập nhật thông tin -------------------
exports.capNhatThongTin = async (req, res) => {
  try {
    const { hoTen, email, soDienThoai, diaChi } = req.body;
    const updated = await NguoiDung.findByIdAndUpdate(
      req.user.id,
      { hoTen, email, soDienThoai, diaChi },
      { new: true }
    );

    res.json(hidePassword(updated));
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật thông tin" });
  }
};

// ------------------- Đổi mật khẩu -------------------
exports.doiMatKhau = async (req, res) => {
  try {
    const { matKhauCu, matKhauMoi } = req.body;
    const user = await NguoiDung.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    const match = await bcrypt.compare(matKhauCu, user.matKhau);
    if (!match)
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });

    user.matKhau = await bcrypt.hash(matKhauMoi, 10);
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi đổi mật khẩu" });
  }
};

// ------------------- Xóa tài khoản -------------------
exports.xoaTaiKhoan = async (req, res) => {
  try {
    await NguoiDung.findByIdAndDelete(req.user.id);
    res.json({ message: "Xóa tài khoản thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa tài khoản" });
  }
};
