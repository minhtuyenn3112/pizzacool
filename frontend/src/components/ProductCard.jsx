import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";
import { ShoppingCart, Eye } from "lucide-react"; // Thêm icon

const formatCurrency = (price) => {
  if (typeof price !== "number" && typeof price !== "string") return "N/A";
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) return "N/A";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numericPrice);
};

function ProductCard({ _id, ten, moTa, gia, giaCu, hinhAnh, badge, actions }) {
  const navigate = useNavigate();
  const { addToCart, fetchCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleViewDetail = () => {
    navigate(`/product/${_id}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài (để không nhảy vào trang chi tiết)
    setLoading(true);
    try {
      await addToCart({ _id, ten, moTa, gia, giaCu, hinhAnh, badge }, 1);
      await fetchCart();
      toast.success(`✅ Đã thêm "${ten}" vào giỏ hàng`);
    } catch (err) {
      console.error(err);
      toast.error("❌ Thêm giỏ hàng thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleViewDetail}
      // --- STYLE GLASSMORPHISM ---
      // bg-white/70: Nền trắng đục 70%
      // backdrop-blur-md: Làm mờ hậu cảnh
      // border-white/50: Viền kính
      className="group relative flex flex-col bg-white/30 backdrop-blur-md border border-white/50 rounded-3xl shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:bg-white/90 cursor-pointer"
    >
      {/* Badge Khuyến mãi */}
      {badge && (
        <span className="absolute top-3 right-3 z-10 px-3 py-1 bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-extrabold rounded-full shadow-md animate-pulse">
          {badge}
        </span>
      )}

      {/* Hình ảnh */}
      <div className="relative w-full h-56 overflow-hidden">
        <img
          src={hinhAnh}
          alt={ten}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://via.placeholder.com/400x300.png?text=Image+Not+Found";
          }}
        />
        {/* Lớp phủ khi hover vào ảnh */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white/90 text-red-600 px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Eye size={16} /> Xem chi tiết
          </span>
        </div>
      </div>

      {/* Nội dung */}
      <div className="p-5 flex flex-col flex-grow">
        <h3
          className="text-xl font-extrabold text-gray-800 line-clamp-2 group-hover:text-red-600 transition-colors mb-1"
          title={ten}
        >
          {ten}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2 font-medium">
          {moTa || "Món ngon tuyệt vời dành cho bạn!"}
        </p>

        <div className="mt-auto pt-3 border-t border-gray-200/50 flex flex-col gap-3">
          {/* Giá cả */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-red-600 drop-shadow-sm">
                {formatCurrency(gia)}
              </span>
              {giaCu && (
                <span className="text-gray-400 text-xs font-bold line-through">
                  {formatCurrency(giaCu)}
                </span>
              )}
            </div>
          </div>

          {/* Nút thêm vào giỏ */}
          {!actions && (
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 hover:shadow-lg"
              }`}
            >
              {loading ? (
                "Đang xử lý..."
              ) : (
                <>
                  <ShoppingCart size={18} /> Thêm vào giỏ
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Footer action (Nếu có props actions truyền vào) */}
      {actions && (
        <div className="p-4 border-t border-white/50 bg-white/30">
          {actions}
        </div>
      )}
    </div>
  );
}

export default ProductCard;
