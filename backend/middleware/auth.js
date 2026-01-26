const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

exports.authenticate = (req, res, next) => {
  let token;

  // Lấy token từ header: "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  console.log("Token nhận được:", token); // <-- xem token backend nhận
  if (!token) {
    return res.status(401).json({ message: "Chưa xác thực, không có token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Gắn thông tin user vào request
    req.user = {
      id: decoded.id,
      vaiTro: decoded.vaiTro,
      email: decoded.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

exports.onlyCustomer = (req, res, next) => {
  if (req.user.vaiTro !== "khach_hang") {
    return res.status(403).json({
      message: "Chỉ khách hàng mới được phép thực hiện hành động này",
    });
  }
  next();
};

//Middleware Admin (Để sửa lỗi import { admin })
exports.admin = (req, res, next) => {
  // Kiểm tra xem user có phải admin không
  // (Logic này tùy thuộc vào User Model của bạn dùng field 'isAdmin' hay role='admin')
  if (req.user && (req.user.isAdmin || req.user.vaiTro === "quan_tri")) {
    next();
  } else {
    res.status(401).json({ message: "Không được phép, yêu cầu quyền Admin" });
  }
};
