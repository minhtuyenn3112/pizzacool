// controllers/cartController.js
const Cart = require("../model/GioHang");

const addToCart = async (req, res) => {
  const userId = req.user.id;
  const { sanPham, ten, gia, hinhAnh, soLuong } = req.body;

  if (!sanPham || !ten || !gia)
    return res.status(400).json({ message: "Sản phẩm không hợp lệ" });

  try {
    // tìm giỏ hàng của user
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // nếu chưa có giỏ, tạo mới
      cart = new Cart({
        user: userId,
        items: [{ sanPham, ten, gia, hinhAnh, soLuong }],
      });
    } else {
      // kiểm tra sản phẩm đã có trong giỏ chưa
      const index = cart.items.findIndex(
        (item) => item.sanPham.toString() === sanPham.toString()
      );

      if (index !== -1) {
        // đã tồn tại → cộng dồn số lượng
        cart.items[index].soLuong += soLuong;
      } else {
        // chưa có → thêm mới
        cart.items.push({ sanPham, ten, gia, hinhAnh, soLuong });
      }
    }

    // tính tổng tiền
    cart.tongTien = cart.items.reduce(
      (total, item) => total + item.gia * item.soLuong,
      0
    );

    await cart.save();

    // log debug
    console.log(
      "Cart items after add:",
      cart.items.map((i) => ({
        sanPham: i.sanPham.toString(),
        soLuong: i.soLuong,
      }))
    );

    res.status(200).json(cart);
  } catch (err) {
    console.error("Lỗi thêm sản phẩm vào giỏ:", err);
    res.status(500).json({ message: "Lỗi thêm sản phẩm vào giỏ" });
  }
};

// controllers/giohangController.js
const updateCartItem = async (req, res) => {
  const userId = req.user.id;
  const { itemId, soLuong } = req.body; // dùng itemId thay vì sanPham

  if (!itemId || soLuong == null)
    return res.status(400).json({ message: "Thiếu thông tin cập nhật" });

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart)
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

    const index = cart.items.findIndex((i) => i._id.toString() === itemId);
    if (index === -1)
      return res
        .status(404)
        .json({ message: "Sản phẩm không tồn tại trong giỏ" });

    // nếu số lượng <= 0 thì xóa luôn
    if (soLuong <= 0) {
      cart.items.splice(index, 1);
    } else {
      cart.items[index].soLuong = soLuong;
    }

    // tính lại tổng tiền
    cart.tongTien = cart.items.reduce(
      (total, i) => total + i.gia * i.soLuong,
      0
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi cập nhật giỏ hàng" });
  }
};

// Xóa một sản phẩm trong giỏ
const removeCartItem = async (req, res) => {
  const userId = req.user.id;
  const { sanPham } = req.body;

  if (!sanPham)
    return res.status(400).json({ message: "Thiếu thông tin sản phẩm" });

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart)
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

    const index = cart.items.findIndex(
      (i) => i.sanPham.toString() === sanPham.toString()
    );
    if (index === -1)
      return res
        .status(404)
        .json({ message: "Sản phẩm không tồn tại trong giỏ" });

    cart.items.splice(index, 1);
    cart.tongTien = cart.items.reduce(
      (total, i) => total + i.gia * i.soLuong,
      0
    );
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi xóa sản phẩm khỏi giỏ hàng" });
  }
};

// Xóa toàn bộ giỏ hàng
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user.id });
    res.status(200).json({ message: "Đã xóa giỏ hàng" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi xóa giỏ hàng" });
  }
};

// Lấy giỏ hàng
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [], tongTien: 0 });
      await cart.save();
    }
    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi lấy giỏ hàng" });
  }
};

module.exports = {
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCart,
};
