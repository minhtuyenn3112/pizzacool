const SanPham = require("../model/SanPham");

// --- Lấy tất cả sản phẩm (Hỗ trợ lọc theo loại) ---
exports.layTatCaSanPham = async (req, res) => {
  try {
    // --- BẮT ĐẦU DEBUG ---
    console.log("-----------------------------------------");
    console.log("Đã nhận được request tới layTatCaSanPham.");
    console.log("Query parameters nhận được:", req.query);
    // --- KẾT THÚC DEBUG ---

    const filter = {};
    if (req.query.loai) {
      // --- BẮT ĐẦU DEBUG ---
      console.log(`Đang áp dụng bộ lọc: { loai: "${req.query.loai}" }`);
      // --- KẾT THÚC DEBUG ---
      filter.loai = req.query.loai;
    } else {
      // --- BẮT ĐẦU DEBUG ---
      console.log("Không có bộ lọc 'loai', sẽ lấy tất cả sản phẩm.");
      // --- KẾT THÚC DEBUG ---
    }

    const sanPhams = await SanPham.find(filter);

    // --- BẮT ĐẦU DEBUG ---
    console.log(`Query thành công, tìm thấy ${sanPhams.length} sản phẩm.`);
    console.log("-----------------------------------------\n");
    // --- KẾT THÚC DEBUG ---

    res.json(sanPhams);
  } catch (err) {
    res.status(500).json({ message: "Lỗi Server khi lấy dữ liệu" });
  }
};

// --- CÁC HÀM KHÁC GIỮ NGUYÊN ---

// Lấy sản phẩm theo ID
exports.laySanPhamTheoId = async (req, res) => {
  try {
    const sp = await SanPham.findById(req.params.id);
    if (!sp) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.json(sp);
  } catch (err) {
    res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
  }
};

// Thêm sản phẩm
exports.themSanPham = async (req, res) => {
  try {
    const hinhAnhUrl = req.file ? `/images/${req.file.filename}` : null;
    let sanPhamData = req.body;
    if (hinhAnhUrl) {
      sanPhamData.hinhAnh = hinhAnhUrl;
    }
    let sanPhamMoi;
    if (Array.isArray(sanPhamData)) {
      sanPhamMoi = await SanPham.insertMany(sanPhamData);
    } else {
      sanPhamMoi = await SanPham.create(sanPhamData);
    }
    res.status(201).json(sanPhamMoi);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Cập nhật sản phẩm
exports.capNhatSanPham = async (req, res) => {
  try {
    let updateData = req.body;
    if (req.file) {
      updateData.hinhAnh = `/images/${req.file.filename}`;
    }
    const sp = await SanPham.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!sp) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm để cập nhật" });
    }
    res.json(sp);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Xóa sản phẩm
exports.xoaSanPham = async (req, res) => {
  try {
    const result = await SanPham.findByIdAndDelete(req.params.id);
    if (!result) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm để xóa" });
    }
    res.json({ message: "Đã xóa sản phẩm thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi Server khi xóa sản phẩm" });
  }
};

// Lấy sản phẩm liên quan (ví dụ: cùng loại / cùng category)
exports.getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await SanPham.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // Giả sử sản phẩm có category
    const related = await SanPham.find({
      _id: { $ne: id }, // loại trừ sản phẩm hiện tại
      loai: product.loai,
    }).limit(8); // lấy tối đa 8 sản phẩm liên quan

    res.json(related);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy tổng số lượng đã bán cho tất cả sản phẩm
exports.layTongSoLuongDaBan = async (req, res) => {
  try {
    const DonHang = require("../model/DonHang");

    // Lấy tất cả đơn hàng và tính tổng số lượng đã bán cho mỗi sản phẩm
    const donHangs = await DonHang.find({ trangThaiDonHang: "Đã hoàn thành" });

    const soLuongDaBan = {};

    donHangs.forEach((donHang) => {
      donHang.items.forEach((item) => {
        const sanPhamId = item.sanPham.toString();
        if (!soLuongDaBan[sanPhamId]) {
          soLuongDaBan[sanPhamId] = 0;
        }
        soLuongDaBan[sanPhamId] += item.soLuong;
      });
    });

    res.json(soLuongDaBan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi lấy dữ liệu bán hàng" });
  }
};
