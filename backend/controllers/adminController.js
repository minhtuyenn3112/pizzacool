const NguoiDung = require("../model/NguoiDung");
const DonHang = require("../model/DonHang");
const SanPham = require("../model/SanPham");

// =========================
// Lấy dashboard stats (thống kê)
// =========================
exports.getDashboard = async (req, res) => {
  try {
    // Lấy tổng số người dùng (chỉ khách hàng)
    const totalUsers = await NguoiDung.countDocuments({
      vaiTro: "khach_hang",
    });

    // Lấy tổng số sản phẩm
    const totalProducts = await SanPham.countDocuments();

    // Lấy tổng số đơn hàng
    const totalOrders = await DonHang.countDocuments();

    // Lấy tổng doanh thu (CHỈ TÍNH ĐƠN ĐÃ HOÀN THÀNH)
    const revenueData = await DonHang.aggregate([
      {
        $match: {
          trangThaiDonHang: "Đã hoàn thành",
        },
      },
      {
        // Bước 2: Cộng tổng tiền các đơn vừa lọc được
        $group: {
          _id: null,
          totalRevenue: { $sum: "$tongTien" },
        },
      },
    ]);

    const revenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Lấy 5 đơn hàng gần đây nhất
    const recentOrders = await DonHang.find()
      .populate("nguoiDung", "hoTen")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Chuyển đổi dữ liệu để hiển thị
    const formattedOrders = recentOrders.map((order) => ({
      _id: order._id,
      khachHang: order.nguoiDung?.hoTen || "Khách vãng lai",
      tongTien: order.tongTien,
      trangThai: order.trangThaiDonHang || "Chờ xử lý",
    }));

    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        revenue,
      },
      recentOrders: formattedOrders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi lấy thống kê dashboard." });
  }
};

// =========================
// Lấy danh sách khách hàng
// =========================
exports.getCustomers = async (req, res) => {
  try {
    const customers = await NguoiDung.find({ vaiTro: "khach_hang" })
      .select("-matKhau") // Ẩn mật khẩu
      .sort({ createdAt: -1 });

    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách khách hàng." });
  }
};

// =========================
// Xóa khách hàng theo ID
// =========================
exports.deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;

    // Chỉ xóa user có vaiTro = khách hàng
    const user = await NguoiDung.findOne({
      _id: customerId,
      vaiTro: "khach_hang",
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy khách hàng hoặc không thể xóa." });
    }

    await NguoiDung.findByIdAndDelete(customerId);

    res.json({ message: "Xóa khách hàng thành công." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xóa khách hàng." });
  }
};

// =========================
// Cập nhật thông tin khách hàng
// =========================
exports.updateCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    const { hoTen, soDienThoai, diaChi, vaiTro } = req.body;

    const user = await NguoiDung.findById(customerId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng." });
    }

    // Cập nhật các trường được phép
    if (hoTen) user.hoTen = hoTen;
    if (soDienThoai) user.soDienThoai = soDienThoai;
    if (diaChi) user.diaChi = diaChi;
    if (vaiTro) user.vaiTro = vaiTro;

    await user.save();

    res.json({ message: "Cập nhật khách hàng thành công.", user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật khách hàng." });
  }
};

// Lấy danh sách tất cả đơn hàng (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await DonHang.find()
      .populate("nguoiDung", "hoTen email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng." });
  }
};

// Lấy chi tiết đơn hàng theo ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await DonHang.findById(orderId).populate(
      "nguoiDung",
      "hoTen email"
    );

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi lấy chi tiết đơn hàng." });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { trangThaiDonHang } = req.body;

    const order = await DonHang.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    order.trangThaiDonHang = trangThaiDonHang;

    // Nếu trạng thái là "Đang giao" hoặc "Đã hoàn thành" => trừ số lượng trong sản phẩm
    if (["Đang giao", "Đã hoàn thành"].includes(trangThaiDonHang)) {
      for (const item of order.items) {
        const product = await SanPham.findById(item.sanPham);
        if (product) {
          product.soLuong = Math.max(product.soLuong - item.soLuong, 0);
          await product.save();
        }
      }
    }

    await order.save();

    res.json({ message: "Cập nhật trạng thái đơn hàng thành công", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái đơn hàng." });
  }
};
