import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  CreditCard,
} from "lucide-react";
import pizzaBgImage from "../images/cart.jpg";


// Hàm định dạng tiền tệ
const formatCurrency = (price) => {
  const num = Number(price);
  if (isNaN(num)) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
};

export default function CartPage() {
  const { cart, fetchCart, updateCartItem, removeCartItem, clearCart } =
    useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQtyChange = async (item, delta) => {
    try {
      setLoading(true);
      const newQty = item.soLuong + delta;
      await updateCartItem(item, newQty);
      await fetchCart();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (item) => {
    try {
      setLoading(true);
      await removeCartItem(item.sanPham);
      toast.success(`Đã xóa sản phẩm khỏi giỏ`);
      await fetchCart();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Xóa thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }
    navigate("/checkout");
  };

  // --- Giao diện khi giỏ hàng trống ---
  if (!cart || cart.items.length === 0) {
    return (
      <div
        className="min-h-screen w-full bg-cover bg-center bg-fixed flex items-center justify-center px-4"
        style={{ backgroundImage: `url(${pizzaBgImage})` }}
      >
        <div className="max-w-lg w-full bg-white/50 backdrop-blur-xl border border-white/60 p-10 rounded-[2rem] shadow-2xl text-center">
          <div className="w-24 h-24 bg-white/60 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/50">
            <ShoppingCart size={48} className="text-red-600 drop-shadow-sm" />
          </div>
          <p className="text-2xl font-extrabold text-gray-800 mb-2 drop-shadow-sm">
            Giỏ hàng của bạn đang trống!
          </p>
          <p className="text-gray-800 mb-8 font-semibold drop-shadow-sm">
            Có vẻ như bạn chưa chọn món pizza nào.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition duration-300 shadow-lg transform hover:scale-105"
          >
            Quay lại thực đơn
          </button>
        </div>
      </div>
    );
  }

  // --- Giao diện chính của giỏ hàng ---
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed flex items-start justify-center py-12 px-4"
      style={{ backgroundImage: `url(${pizzaBgImage})` }}
    >
      {/* --- OUTER CONTAINER (KHUNG NGOÀI) --- */}
      <div className="max-w-6xl w-full p-4 bg-transparent">
        {/* Tiêu đề */}
        <h1 className="text-4xl font-extrabold text-white mb-8 pb-3 flex items-center justify-center gap-3 drop-shadow-[0_3px_3px_rgba(0,0,0,0.9)] border-b border-white/30">
          <ShoppingCart className="text-white drop-shadow-lg" size={42} />
          <span className="uppercase tracking-wider">Giỏ hàng của bạn</span>
        </h1>

        <div className="space-y-6">
          {cart.items.map((item, index) => (
            <div
              key={`${item.sanPham}-${index}`}
              // --- CARD SẢN PHẨM: HIỆU ỨNG BÓNG HƠN ---
              // - bg-white/40: Nền trong suốt hơn (cũ là /70)
              // - backdrop-blur-2xl: Độ mờ cực mạnh (cũ là -md)
              // - shadow-2xl shadow-black/10: Bóng sâu và mềm hơn
              // - border-white/70: Viền sáng rõ hơn (cũ là /50)
              className="flex flex-col md:flex-row items-center gap-6 bg-white/40 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl shadow-black/10 border border-white/70 hover:shadow-red-200/40 hover:bg-white/50 hover:-translate-y-1 transition-all duration-500 group"
            >
              <img
                src={item.hinhAnh || "/placeholder.png"}
                alt={item.ten}
                // Thêm hiệu ứng bóng cho ảnh
                className="w-28 h-28 object-cover rounded-2xl shadow-lg flex-shrink-0 border-2 border-white/80 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="flex-1 min-w-0 text-center md:text-left">
                <div className="font-extrabold text-2xl text-gray-900 truncate mb-1 drop-shadow-sm">
                  {item.ten}
                </div>
                <div className="text-sm text-gray-800 font-bold">
                  Đơn giá:{" "}
                  <span className="font-extrabold text-red-600 text-base drop-shadow-sm">
                    {formatCurrency(item.gia)}
                  </span>
                </div>
              </div>

              {/* Điều chỉnh số lượng */}
              <div className="flex items-center gap-3 bg-white/50 rounded-full px-3 py-2 border border-white/70 shadow-inner backdrop-blur-sm">
                <button
                  onClick={() => handleQtyChange(item, -1)}
                  disabled={loading || item.soLuong <= 1}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-red-600 hover:bg-red-100 disabled:opacity-50 transition shadow-md font-bold"
                  title="Giảm số lượng"
                >
                  <Minus size={18} />
                </button>
                <input
                  type="text"
                  value={item.soLuong}
                  readOnly
                  className="w-10 text-center text-xl font-extrabold bg-transparent text-gray-900 focus:outline-none drop-shadow-sm"
                />
                <button
                  onClick={() => handleQtyChange(item, 1)}
                  disabled={loading}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-red-600 hover:bg-red-100 disabled:opacity-50 transition shadow-md font-bold"
                  title="Tăng số lượng"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Thành tiền và Xóa */}
              <div className="text-center md:text-right min-w-[150px] md:min-w-[200px]">
                <div className="text-3xl font-black text-red-600 drop-shadow-md">
                  {formatCurrency(item.gia * item.soLuong)}
                </div>
                <button
                  onClick={() => handleRemove(item)}
                  disabled={loading}
                  className="text-gray-700 text-sm mt-3 flex items-center gap-2 justify-center md:justify-end ml-auto hover:text-red-600 transition duration-300 font-bold group/btn bg-white/40 px-3 py-1 rounded-full border border-white/40 hover:bg-white/70 hover:shadow-sm"
                  title="Xóa sản phẩm"
                >
                  <Trash2
                    size={18}
                    className="group-hover/btn:scale-110 transition-transform"
                  />{" "}
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer: Tổng tiền & Nút bấm - HIỆU ỨNG BÓNG HƠN */}
        <div className="mt-10 pt-6 flex flex-col lg:flex-row justify-between items-center gap-6 bg-white/50 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl shadow-black/20 border border-white/80 relative z-10">
          {/* Thêm một lớp viền sáng nội bộ để tăng cảm giác bóng */}
          <div
            className="absolute inset-0 rounded-3xl border border-white/30 pointer-events-none"
            style={{ clipPath: "inset(1px)" }}
          ></div>

          <div className="flex flex-col gap-1 text-center lg:text-left">
            <span className="text-gray-800 font-extrabold uppercase tracking-wide text-sm drop-shadow-sm">
              Tổng thanh toán
            </span>
            <span className="text-5xl font-black text-red-600 tracking-tight drop-shadow-lg">
              {formatCurrency(cart.tongTien)}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 w-full lg:w-auto">
            <button
              onClick={clearCart}
              disabled={loading}
              className="px-6 py-4 rounded-2xl border-2 border-gray-300/70 bg-white/60 text-gray-800 font-bold hover:bg-white hover:text-red-600 hover:border-red-300 transition duration-300 disabled:opacity-50 shadow-md flex items-center justify-center gap-2 hover:shadow-lg backdrop-blur-sm"
            >
              <Trash2 size={22} /> Xóa tất cả
            </button>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="px-10 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-extrabold text-xl hover:from-red-700 hover:to-orange-700 transition duration-300 disabled:opacity-50 shadow-xl shadow-red-900/30 transform hover:scale-105 flex items-center justify-center gap-3 flex-1 sm:flex-none border border-red-500/50"
            >
              <CreditCard size={26} /> Thanh toán ngay
            </button>
          </div>
        </div>

        {/* Nút quay lại */}
        <div className="mt-10 text-center md:text-left">
          <button
            onClick={() => navigate("/menu")}
            className="inline-flex items-center gap-3 text-white font-bold hover:text-yellow-300 transition-all duration-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] text-lg group"
          >
            <ArrowLeft
              size={24}
              className="group-hover:-translate-x-1 transition-transform"
            />{" "}
            Tiếp tục mua hàng
          </button>
        </div>
      </div>
    </div>
  );
}
