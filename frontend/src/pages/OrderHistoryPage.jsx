import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Package,
  Calendar,
  ChevronRight,
  ShoppingBag,
  Loader,
} from "lucide-react";

// --- IMPORT HÌNH NỀN ---
import pizzaBgImage from "../images/lichsu.jpg";
// -----------------------

// ==========================================
// HÀM HỖ TRỢ (UTILS)
// ==========================================
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case "Thành công":
    case "Đã giao hàng":
    case "Đã hoàn thành":
      return "bg-green-100/90 text-green-800 border-green-200";
    case "Đã hủy":
      return "bg-red-100/90 text-red-800 border-red-200";
    case "Đang giao":
    case "VNPAY":
      return "bg-blue-100/90 text-blue-800 border-blue-200";
    case "Chờ xác nhận":
    default:
      return "bg-yellow-100/90 text-yellow-800 border-yellow-200";
  }
};

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          "http://localhost:5000/api/donhang/my-orders",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (data.success) {
          setOrders(data.data);
        }
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading)
    return (
      <div
        className="min-h-screen flex justify-center items-center bg-cover bg-center"
        style={{ backgroundImage: `url(${pizzaBgImage})` }}
      >
        {/* Loading cũng bỏ nền mờ khung to, chỉ mờ khung nhỏ */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg flex flex-col items-center border border-white/50">
          <Loader className="animate-spin text-red-600 mb-2" size={40} />
          <span className="font-bold text-gray-800">Đang tải đơn hàng...</span>
        </div>
      </div>
    );

  return (
    // --- Wrapper chứa hình nền Pizza ---
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed flex items-start justify-center py-12 px-4"
      style={{ backgroundImage: `url(${pizzaBgImage})` }}
    >
      {/* --- OUTER CONTAINER (KHUNG NGOÀI) ---
          Đã chỉnh: bg-transparent (Trong suốt hoàn toàn), bỏ border, bỏ shadow, bỏ backdrop-blur
      */}
      <div className="max-w-4xl w-full p-4 bg-transparent">
        {/* Tiêu đề: Màu trắng, Đổ bóng đậm để nổi trên nền ảnh */}
        <h1 className="text-4xl font-extrabold text-center text-white mb-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] uppercase tracking-wide flex items-center justify-center gap-3">
          <ShoppingBag size={36} className="text-white drop-shadow-md" /> Lịch
          sử đơn hàng
        </h1>

        {orders.length === 0 ? (
          // --- State: Chưa có đơn hàng ---
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-10 text-center shadow-xl border border-white/50">
            <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/60 shadow-inner">
              <Package size={40} className="text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Chưa có đơn hàng nào
            </h2>
            <p className="text-gray-700 mb-8 font-semibold">
              Bạn chưa mua sắm sản phẩm nào tại cửa hàng Pizza Cool.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg transform hover:scale-105 border border-red-500"
            >
              Đặt món ngay
            </button>
          </div>
        ) : (
          // --- State: Có đơn hàng ---
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/orders/${order._id}`)}
                // --- THẺ CARD: GIỮ HIỆU ỨNG KÍNH ---
                // Chỉ làm mờ bên trong thẻ card để chữ dễ đọc
                // bg-white/60: Màu trắng đục 60%
                // backdrop-blur-md: Làm mờ hình nền bên dưới thẻ
                className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-xl hover:shadow-2xl hover:bg-white/80 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  {/* Left: Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-extrabold text-xl text-gray-900">
                        #{order.orderCode || order._id.slice(-6).toUpperCase()}
                      </span>
                      <span
                        className={`text-xs px-3 py-1 rounded-full border font-bold shadow-sm ${getStatusColor(
                          order.trangThaiDonHang
                        )}`}
                      >
                        {order.trangThaiDonHang}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-800 text-sm gap-4 font-semibold">
                      <span className="flex items-center gap-1 bg-white/40 px-2 py-1 rounded-lg border border-white/30">
                        <Calendar size={16} className="text-red-600" />
                        {formatDate(order.createdAt)}
                      </span>
                      <span className="flex items-center gap-1 bg-white/40 px-2 py-1 rounded-lg border border-white/30">
                        <Package size={16} className="text-red-600" />
                        {order.items.length} sản phẩm
                      </span>
                    </div>
                  </div>

                  {/* Right: Total & Action */}
                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-gray-400/30 pt-4 md:pt-0 mt-2 md:mt-0">
                    <div className="text-right">
                      <p className="text-xs text-gray-700 font-bold uppercase tracking-wide">
                        Tổng tiền
                      </p>
                      <p className="text-2xl font-black text-red-600 drop-shadow-sm">
                        {formatCurrency(order.tongTien)}
                      </p>
                    </div>
                    <div className="bg-white/50 p-2.5 rounded-full border border-white/60 group-hover:bg-red-500 group-hover:text-white group-hover:border-red-400 transition shadow-md">
                      <ChevronRight size={22} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
