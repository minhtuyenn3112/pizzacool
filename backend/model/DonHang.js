const mongoose = require("mongoose");

// --- Schema cho từng item trong đơn hàng ---
const ChitietdonhangSchema = new mongoose.Schema({
  sanPham: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SanPham",
    required: true,
  },
  ten: { type: String, required: true },
  hinhAnh: { type: String, required: true },
  gia: { type: Number, required: true },
  soLuong: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true }, // gia * soLuong
});

// --- Schema Order tổng ---
const donHangSchema = new mongoose.Schema(
  {
    nguoiDung: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NguoiDung",
      required: true,
    },

    orderCode: { type: String, unique: true }, // có thể auto gen
    items: [ChitietdonhangSchema],

    // Giá tiền
    tienTruocGiam: { type: Number, required: true }, // tổng tiền trước giảm
    tienGiam: { type: Number, default: 0 }, // tiền giảm thực tế áp dụng
    tongTien: { type: Number, required: true }, // subtotal - discountAmount

    // Voucher áp dụng
    voucher: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MaGiamGia",
      },
      maCode: { type: String }, // lưu luôn mã code để hiển thị
    },

    // Thanh toán
    hinhThucThanhToan: {
      type: String,
      enum: ["COD", "VNPAY"],
      default: "COD",
    },
    trangThaiThanhToan: {
      type: String,
      enum: ["Chưa thanh toán", "Thành công", "Thất bại"],
      default: "Chưa thanh toán",
    },

    // Trạng thái đơn hàng
    trangThaiDonHang: {
      type: String,
      enum: [
        "Chờ xác nhận",
        "Đã xác nhận",
        "Đang giao",
        "Đã hoàn thành",
        "Đã hủy",
      ],
      default: "Chờ xác nhận",
    },

    // Thông tin giao hàng
    thongTinGiaoHang: {
      hoTen: { type: String, required: true },
      soDienThoai: { type: String, required: true },
      diaChi: { type: String, required: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DonHang", donHangSchema);
