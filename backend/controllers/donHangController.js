// controllers/donHangController.js
const DonHang = require("../model/DonHang.js");
const GioHang = require("../model/GioHang.js");
const MaGiamGia = require("../model/MaGiamGia.js");
const moment = require("moment");
const querystring = require("qs");
const crypto = require("crypto");

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingInfo, paymentMethod, voucherCode } = req.body;

    // Lấy giỏ hàng của user
    const cart = await GioHang.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    // Tính tổng tiền trước giảm
    let tienTruocGiam = 0;
    const orderItems = cart.items.map((item) => {
      const subtotal = item.gia * item.soLuong;
      tienTruocGiam += subtotal;
      return {
        sanPham: item.sanPham,
        ten: item.ten,
        hinhAnh: item.hinhAnh,
        gia: item.gia,
        soLuong: item.soLuong,
        subtotal,
      };
    });

    // Xử lý voucher
    let tienGiam = 0;
    let voucher = null; // sẽ lưu object {_id, maCode}

    if (voucherCode) {
      const ma = await MaGiamGia.findOne({ maCode: voucherCode });
      const now = new Date();

      if (!ma) return res.status(404).json({ message: "Mã không hợp lệ" });
      if (ma.ngayBatDau && now < ma.ngayBatDau)
        return res.status(400).json({ message: "Mã chưa bắt đầu" });
      if (ma.ngayKetThuc && now > ma.ngayKetThuc)
        return res.status(400).json({ message: "Mã đã hết hạn" });
      if (!ma.conHieuLuc)
        return res.status(400).json({ message: "Mã đã bị khóa" });

      tienGiam = ma.giaTriGiam;
      voucher = { _id: ma._id, maCode: ma.maCode }; // lưu cả _id và maCode
    }

    // Tổng tiền cuối
    const tongTien = Math.max(tienTruocGiam - tienGiam, 0);

    // Tạo mã đơn hàng
    const orderCode = "ORD" + Date.now();
    const initialPaymentStatus =
      paymentMethod === "COD" ? "Thành công" : "Chưa thanh toán";

    // Tạo đơn hàng mới
    const newOrder = new DonHang({
      nguoiDung: userId,
      orderCode,
      items: orderItems,
      tienTruocGiam,
      tienGiam,
      tongTien,
      voucher, // lưu object {_id, maCode}
      hinhThucThanhToan: paymentMethod,
      trangThaiThanhToan: initialPaymentStatus,
      trangThaiDonHang: "Chờ xác nhận",
      thongTinGiaoHang: {
        hoTen: shippingInfo.name,
        soDienThoai: shippingInfo.phone,
        diaChi: shippingInfo.address,
      },
    });

    await newOrder.save();

    // Xóa giỏ hàng
    await GioHang.findOneAndUpdate(
      { user: userId },
      { items: [], tongTien: 0 }
    );

    // Trả về kết quả
    if (paymentMethod === "COD") {
      return res.status(201).json({
        success: true,
        message: "Đặt hàng thành công (COD)",
        order: newOrder,
        paymentUrl: null,
      });
    }

    if (paymentMethod === "VNPAY") {
      const paymentUrl = createVnPayUrl(req, newOrder);
      return res.status(201).json({
        success: true,
        message: "Đang chuyển hướng sang VNPAY...",
        order: newOrder,
        paymentUrl,
      });
    }
  } catch (error) {
    console.error("Lỗi tạo đơn:", error);
    res.status(500).json({
      message: "Lỗi server khi tạo đơn hàng",
      error: error.message,
    });
  }
};

// ... các import giữ nguyên

// ==========================================
// 2. TẠO URL VNPAY (ĐÃ CHUẨN HÓA)
// ==========================================
const createVnPayUrl = (req, order) => {
  process.env.TZ = "Asia/Ho_Chi_Minh";
  const date = new Date();
  const createDate = moment(date).format("YYYYMMDDHHmmss");

  // Xử lý IP: Nếu là ::1 thì chuyển thành 127.0.0.1
  let ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    "127.0.0.1";

  if (ipAddr === "::1") {
    ipAddr = "127.0.0.1";
  }

  // SỬA: Lấy cấu hình từ biến môi trường (File .env)
  const tmnCode = "2A1ZFBC9";
  const secretKey = "1TRHMTB0T2OCY9O1BSPN3X3QMDKVDWC4";
  const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

  // URL này trỏ về FRONTEND (React/Vue)
  const returnUrl = "http://localhost:5173/donhang/vnpay-return";

  const amount = Math.round(order.tongTien * 100); // VNPAY tính tiền bằng đơn vị đồng (không có hào/xu)

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: order._id.toString(),
    vnp_OrderInfo: "Thanh toan don hang " + order.orderCode,
    vnp_OrderType: "other",
    vnp_Amount: amount,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  vnp_Params = sortObject(vnp_Params);

  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  vnp_Params["vnp_SecureHash"] = signed;

  return vnpUrl + "?" + querystring.stringify(vnp_Params, { encode: false });
};

// ==========================================
// 3. XỬ LÝ KẾT QUẢ VNPAY (ĐÃ CHUẨN HÓA)
// ==========================================
const vnpayReturn = async (req, res) => {
  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    // SỬA: Đảm bảo dùng chung secretKey với hàm tạo URL
    const secretKey = process.env.VNP_HASH_SECRET;

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      const orderId = vnp_Params["vnp_TxnRef"];
      const rspCode = vnp_Params["vnp_ResponseCode"];

      // Kiểm tra dữ liệu có trong DB không để tránh tấn công
      const order = await DonHang.findById(orderId);
      if (!order)
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

      // Kiểm tra số tiền thanh toán có khớp không (Quan trọng)
      const checkAmount =
        order.tongTien * 100 === parseInt(vnp_Params["vnp_Amount"]);
      if (!checkAmount)
        return res.status(400).json({ message: "Sai số tiền thanh toán" });

      if (rspCode === "00") {
        order.trangThaiThanhToan = "Thành công";
        order.hinhThucThanhToan = "VNPAY";
        await order.save();

        return res.status(200).json({
          code: "00",
          message: "Thanh toán thành công",
          data: order,
        });
      } else {
        // Giao dịch thất bại thì có thể cập nhật trạng thái đơn hàng hoặc không
        return res.status(400).json({
          code: rspCode,
          message: "Giao dịch thất bại tại VNPAY",
        });
      }
    } else {
      return res.status(400).json({
        code: "97",
        message: "Chữ ký không hợp lệ (Sai Checksum)",
      });
    }
  } catch (error) {
    console.error("VNPAY Return Error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// 4. LẤY ĐƠN HÀNG CỦA USER
// ==========================================
const getMyOrders = async (req, res) => {
  try {
    const orders = await DonHang.find({ nguoiDung: req.user.id })
      .sort({ createdAt: -1 })
      .populate("voucher")
      .populate("nguoiDung", "name email");

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng",
    });
  }
};

// ==========================================
// 5. LẤY CHI TIẾT ĐƠN HÀNG
// ==========================================
const getOrderById = async (req, res) => {
  try {
    const order = await DonHang.findById(req.params.id)
      .populate("voucher")
      .populate("nguoiDung", "name email");

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết đơn hàng",
    });
  }
};

// ==========================================
// 6. HỦY ĐƠN HÀNG
// ==========================================
const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await DonHang.findById(orderId);

    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    if (
      ["Đã hoàn thành", "Đã hủy", "Đang giao"].includes(order.trangThaiDonHang)
    ) {
      return res.status(400).json({ message: "Đơn hàng không thể hủy" });
    }

    order.trangThaiDonHang = "Đã hủy";
    await order.save();

    res.json({
      success: true,
      message: "Đơn hàng đã hủy",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ==========================================
// 7. HÀM HỖ TRỢ
// ==========================================
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();

  keys.forEach((key) => {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
  });

  return sorted;
}

// ==========================================
// EXPORT COMMONJS
// ==========================================
module.exports = {
  createOrder,
  vnpayReturn,
  getMyOrders,
  getOrderById,
  cancelOrder,
};
