// backend/seed/seedMaGiamGia.js
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

// Chỉ định path tới file .env ở backend
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Import model mã giảm giá
const MaGiamGia = require("../model/MaGiamGia");

const seedDiscounts = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Kết nối MongoDB thành công");

    // Xóa hết mã giảm giá cũ
    await MaGiamGia.deleteMany({});

    // Danh sách seed
    const discounts = [
      {
        tenMa: "Giảm 50k cho đơn từ 200k",
        maCode: "GIAM50K",
        giaTriGiam: 50000,
        ngayBatDau: new Date("2025-11-01"),
        ngayKetThuc: new Date("2025-12-31"),
        conHieuLuc: true,
        Mota: "Áp dụng cho đơn hàng từ 200k trở lên",
        dieuKienToiThieu: 200000,
        soLuotSuDung: -1,
        chiTietDieuKien: "Tổng đơn hàng phải từ 200,000đ trở lên",
      },
      {
        tenMa: "Giảm 30k cho đơn từ 100k",
        maCode: "GIAM30K",
        giaTriGiam: 30000,
        ngayBatDau: new Date("2025-11-15"),
        ngayKetThuc: new Date("2025-12-31"),
        conHieuLuc: true,
        Mota: "Giảm 30k cho đơn hàng từ 100k",
        dieuKienToiThieu: 100000,
        soLuotSuDung: 100,
        chiTietDieuKien: "Tổng đơn hàng từ 100,000đ; Giới hạn 100 lượt sử dụng",
      },
      {
        tenMa: "Black Friday giảm 100k",
        maCode: "BLACK100",
        giaTriGiam: 100000,
        ngayBatDau: new Date("2025-11-28"),
        ngayKetThuc: new Date("2025-11-30"),
        conHieuLuc: true,
        Mota: "Chỉ áp dụng trong dịp Black Friday",
        dieuKienToiThieu: 300000,
        soLuotSuDung: 50,
        chiTietDieuKien: "Tổng đơn hàng từ 300,000đ; Giới hạn 50 lượt sử dụng",
      },
    ];

    // Thêm vào DB
    await MaGiamGia.insertMany(discounts);

    console.log("🎉 Seed mã giảm giá thành công!");
  } catch (err) {
    console.error("❌ Lỗi seed mã giảm giá:", err);
  } finally {
    // Ngắt kết nối
    await mongoose.disconnect();
  }
};

// Chạy seed
seedDiscounts();
