const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import routes
const danhGiaRoutes = require("./routes/danhGiaRoutes");
const donHangRoutes = require("./routes/donHangRoutes");
const maGiamGiaRoutes = require("./routes/maGiamGiaRoutes");
const nguoiDungRoutes = require("./routes/nguoiDungRoutes");
const sanPhamRoutes = require("./routes/sanPhamRoutes");
const gioHangRoutes = require("./routes/gioHangRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aiRoutes = require("./routes/aiRoutes");

// Import model để seed admin
const NguoiDung = require("./model/NguoiDung");

// Khởi tạo app
const app = express();

// ------------------- MIDDLEWARE -------------------
app.use(cors({ origin: "http://localhost:5173", credentials: true })); // frontend React
app.use(express.json());

// Cho phép truy cập static files (ảnh, uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/images", express.static(path.join(__dirname, "public")));

// ------------------- ROUTES API -------------------
app.use("/api/danhgia", danhGiaRoutes);
app.use("/api/magiamgia", maGiamGiaRoutes);
app.use("/api/nguoidung", nguoiDungRoutes);
app.use("/api/sanpham", sanPhamRoutes);
app.use("/api/giohang", gioHangRoutes);
app.use("/api/donhang", donHangRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);


// ------------------- ROUTE TEST -------------------
app.get("/", (req, res) => {
  res.send("🍕 PizzaCool Backend đang hoạt động!");
});

// ------------------- CONNECT MONGODB & SEED ADMIN -------------------
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Kết nối MongoDB thành công!");

    // Tạo admin mặc định nếu chưa có
    const adminEmail = "nguyenduyphu1309@gmail.com";
    const adminTonTai = await NguoiDung.findOne({ email: adminEmail });

    if (!adminTonTai) {
      // Hash mật khẩu trước khi lưu
      const matKhauHash = await bcrypt.hash("123456789", 10);
      await NguoiDung.create({
        hoTen: "Duy Phu",
        email: adminEmail,
        matKhau: matKhauHash, // Lưu mật khẩu đã hash
        vaiTro: "quan_tri",
      });
      console.log(
        "👑 Đã tạo tài khoản admin mặc định (Duy Phu) với mật khẩu hash"
      );
    } else {
      console.log("ℹ️ Admin đã tồn tại, bỏ qua tạo mới.");
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server đang chạy tại cổng ${PORT}`));
  } catch (err) {
    console.error("❌ Lỗi khởi động server:", err);
  }
};


startServer();
