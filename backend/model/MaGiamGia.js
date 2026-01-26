const mongoose = require("mongoose");

const maGiamGiaSchema = new mongoose.Schema(
  {
    tenMa: { type: String, required: true },
    maCode: { type: String, required: true, unique: true },
    giaTriGiam: { type: Number, required: true },
    ngayBatDau: Date,
    ngayKetThuc: Date,
    conHieuLuc: { type: Boolean, default: true },
    Mota: String,
    // Điều kiện sử dụng
    dieuKienToiThieu: { type: Number, default: 0 }, // Tổng đơn hàng tối thiểu (VNĐ)
    soLuotSuDung: { type: Number, default: -1 }, // -1 = không giới hạn, số dương = giới hạn
    soLuotDaSuDung: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MaGiamGia", maGiamGiaSchema);
