const mongoose = require("mongoose");

const GioHangSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NguoiDung",
      required: true,
    }, // người dùng sở hữu giỏ
    items: [
      {
        sanPham: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SanPham",
          required: true,
        }, // sản phẩm
        ten: { type: String, required: true }, // tên sản phẩm
        soLuong: { type: Number, default: 1, min: 1 }, // số lượng sản phẩm
        gia: { type: Number, required: true }, // giá tại thời điểm thêm vào giỏ
        hinhAnh: { type: String, required: true }, // hình ảnh sản phẩm
      },
    ],
    tongTien: { type: Number, default: 0 }, // tổng tiền
  },
  { timestamps: true }
);

module.exports = mongoose.model("GioHang", GioHangSchema);
