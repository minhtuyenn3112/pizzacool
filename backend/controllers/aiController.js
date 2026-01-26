const SanPham = require("../model/SanPham");
const DonHang = require("../model/DonHang");
const MaGiamGia = require("../model/MaGiamGia");

// 1. Tra cứu đơn hàng thông minh (Dựa vào Order Code hoặc Số điện thoại)
exports.smartOrderLookup = async (req, res) => {
  try {
    const { keyword } = req.body; // AI sẽ gửi mã đơn (ORD...) hoặc SĐT vào đây

    if (!keyword) {
      return res.json({
        info: "Vui lòng cung cấp Mã đơn hàng hoặc Số điện thoại để tôi kiểm tra.",
      });
    }

    // Tìm đơn hàng khớp mã hoặc SĐT
    // Dựa vào cấu trúc DonHang của bạn
    const order = await DonHang.findOne({
      $or: [
        { orderCode: keyword },
        { "thongTinGiaoHang.soDienThoai": keyword },
      ],
    }).populate("items.sanPham");

    if (!order) {
      return res.json({
        info: `Không tìm thấy đơn hàng nào với thông tin "${keyword}".`,
      });
    }

    // Format dữ liệu gọn gàng cho AI đọc
    const aiResponse = {
      ma_don: order.orderCode,
      trang_thai: order.trangThaiDonHang,
      thanh_toan: order.trangThaiThanhToan, // "Chưa thanh toán" hoặc "Thành công"
      tong_tien: order.tongTien.toLocaleString("vi-VN") + " VNĐ",
      ngay_dat: new Date(order.createdAt).toLocaleString("vi-VN"),
      cac_mon: order.items.map((i) => `${i.ten} (x${i.soLuong})`).join(", "),
      nguoi_nhan: order.thongTinGiaoHang.hoTen,
      dia_chi: order.thongTinGiaoHang.diaChi,
    };

    res.json({
      success: true,
      data: aiResponse,
      message_for_ai: `Đây là thông tin đơn hàng ${keyword}. Hãy báo cho khách trạng thái là "${aiResponse.trang_thai}".`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ info: "Lỗi hệ thống khi tra cứu đơn hàng." });
  }
};


// 2. Tìm món ăn thông minh (Dựa vào từ khóa người dùng nhập)
function removeVietnameseTones(str) {
  if (!str || typeof str !== "string") return ""; // <--- Dòng mới thêm để chống sập
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  return str;
}

const synonymMap = {
  mỳ: ["mỳ", "mi", "nui", "pasta", "spaghetti"],
  gà: ["gà", "chicken", "cánh", "đùi"],
  bò: ["bò", "beef", "steak", "bằm"],
  "hải sản": ["hải sản", "tôm", "mực", "seafood", "cua", "ngêu"],
  pizza: ["pizza", "bánh", "đế"],
  combo: ["combo", "set", "bữa", "phần ăn"],
  giàu: ["giàu", "sang", "xịn", "đắt", "vip", "luxury", "đại gia"],
  rẻ: ["rẻ", "tiết kiệm", "sinh viên", "bèo", "ít tiền"],
};

async function createDynamicCombo(sortDirection) {
  const pizza = await SanPham.findOne({
    loai: { $regex: "pizza", $options: "i" },
  }).sort({ gia: sortDirection });
  const ga = await SanPham.findOne({
    loai: { $regex: "ga", $options: "i" },
  }).sort({ gia: sortDirection });
  const my = await SanPham.findOne({
    loai: { $regex: "my", $options: "i" },
  }).sort({ gia: sortDirection });
  return [pizza, ga, my].filter((item) => item !== null);
}

exports.smartProductSearch = async (req, res) => {
  try {
    let { keyword } = req.body;
    // Sửa lỗi: Kiểm tra keyword tồn tại trước khi xử lý
    let cleanKeyword = keyword ? keyword.toLowerCase().trim() : "";
    let message = "Dưới đây là các món tìm thấy:";

    const stopWords = [
      "cho",
      "tôi",
      "muốn",
      "tìm",
      "xem",
      "hỏi",
      "về",
      "món",
      "có",
      "nào",
      "không",
      "giá",
      "bao",
      "nhiêu",
      "shop",
      "quán",
      "ơi",
      "lấy",
      "order",
      "đặt",
      "là",
      "trong",
      "đó",
    ];
    stopWords.forEach((word) => {
      cleanKeyword = cleanKeyword
        .replace(new RegExp(`\\b${word}\\b`, "gi"), " ")
        .trim();
    });

    let products = [];
    const isCombo =
      cleanKeyword.includes("combo") || cleanKeyword.includes("set");

    if (isCombo) {
      if (synonymMap["giàu"].some((k) => cleanKeyword.includes(k))) {
        products = await createDynamicCombo(-1);
        const total = products
          .reduce((sum, p) => sum + (p.gia || 0), 0)
          .toLocaleString("vi-VN");
        message = `✨ Dạ mời 'Đại Gia' thẩm ngay **COMBO CHỦ TỊCH** (Gồm Pizza, Gà, Mỳ đắt nhất quán). Tổng thiệt hại: **${total} VNĐ** ạ:`;
      } else if (synonymMap["rẻ"].some((k) => cleanKeyword.includes(k))) {
        products = await createDynamicCombo(1);
        const total = products
          .reduce((sum, p) => sum + (p.gia || 0), 0)
          .toLocaleString("vi-VN");
        message = `💖 Dạ đây là **COMBO SINH VIÊN** (Ăn no nê mà siêu tiết kiệm). Tổng chỉ: **${total} VNĐ** thôi ạ:`;
      } else {
        products = await SanPham.aggregate([{ $sample: { size: 3 } }]);
        message = "Dạ em gợi ý mình một Combo ngẫu nhiên đổi gió nhé:";
      }
    } else {
      let searchTerms = cleanKeyword.split(/\s+/);

      if (searchTerms.length > 1) {
        const andConditions = searchTerms.map((originalTerm) => {
          let subTerms = [originalTerm];
          Object.keys(synonymMap).forEach((key) => {
            if (originalTerm.includes(key)) subTerms.push(...synonymMap[key]);
          });
          return {
            $or: [
              { tenSanPham: { $regex: subTerms.join("|"), $options: "i" } },
              { loai: { $regex: subTerms.join("|"), $options: "i" } },
              { moTa: { $regex: subTerms.join("|"), $options: "i" } },
            ],
          };
        });
        products = await SanPham.find({ $and: andConditions }).limit(6);
        message = `Dạ đây là các món thỏa mãn yêu cầu "${cleanKeyword}" của bạn:`;
      }

      if (products.length === 0) {
        // Tìm kiếm mở rộng (Fallback)
        let expandedTerms = [];
        searchTerms.forEach((term) => {
          expandedTerms.push(term);
          Object.keys(synonymMap).forEach((key) => {
            if (term.includes(key)) expandedTerms.push(...synonymMap[key]);
          });
        });

        const regexString = expandedTerms.join("|");
        products = await SanPham.find({
          $or: [
            { tenSanPham: { $regex: regexString, $options: "i" } },
            { loai: { $regex: regexString, $options: "i" } },
            { moTa: { $regex: regexString, $options: "i" } },
          ],
        }).limit(6);

        // --- SỬA LỖI CRASH Ở ĐÂY ---
        if (products.length > 0) {
          products.sort((a, b) => {
            // Thêm || "" để đảm bảo không bao giờ bị undefined
            const aName = removeVietnameseTones(
              (a.tenSanPham || "").toLowerCase()
            );
            const bName = removeVietnameseTones(
              (b.tenSanPham || "").toLowerCase()
            );
            const key = removeVietnameseTones(cleanKeyword);
            return bName.includes(key) - aName.includes(key);
          });
          message = "Dạ em tìm thấy mấy món này liên quan ạ:";
        } else {
          message = "Hic, em tìm không ra món đó.";
        }
      }
    }

    if (products.length === 0) {
      products = await SanPham.find({}).sort({ gia: -1 }).limit(3);
      message =
        "Hic, em tìm không ra món đó. Hay bạn thử mấy món 'Signature' này của quán nha?";
    }

    const menuList = products.map((p) => ({
      ten: p.tenSanPham || "Món chưa đặt tên", // Chống lỗi hiển thị
      gia: (p.gia || 0).toLocaleString("vi-VN") + " VNĐ",
      mo_ta: p.moTa || "",
      loai: p.loai || "khác",
    }));

    res.json({
      success: true,
      data: menuList,
      message_for_ai: message,
    });
  } catch (err) {
    console.error("Lỗi AI Controller:", err); // Log lỗi ra xem cho dễ
    res.status(500).json({ info: "Lỗi hệ thống tìm kiếm." });
  }
};

// 3. Kiểm tra Voucher (Tính năng nâng cao)
exports.checkVoucher = async (req, res) => {
  try {
    const { code } = req.body;
    const voucher = await MaGiamGia.findOne({ maCode: code, conHieuLuc: true });

    if (!voucher) {
      return res.json({
        valid: false,
        message: "Mã giảm giá không tồn tại hoặc đã hết hạn.",
      });
    }

    res.json({
      valid: true,
      code: voucher.maCode,
      giam: voucher.giaTriGiam.toLocaleString("vi-VN") + " VNĐ",
      message: "Mã hợp lệ. Bạn sẽ được giảm " + voucher.giaTriGiam + " VNĐ.",
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi kiểm tra voucher." });
  }
};
