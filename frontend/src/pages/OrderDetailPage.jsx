import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Package,
  Truck,
  CreditCard,
  MapPin,
  ArrowLeft,
  Loader,
  XCircle,
  AlertTriangle,
  X,
} from "lucide-react";

// --- IMPORT HÌNH NỀN ---
import pizzaBgImage from "../images/re.jpg";
// -----------------------

// =======================
// UTILS
// =======================
const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

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

const getPaymentStatusColor = (status) =>
  status === "Thành công"
    ? "text-green-700 font-extrabold"
    : "text-orange-600 font-extrabold";

// =======================
// MODAL XÁC NHẬN
// =======================
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isProcessing,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center border-2 border-white/80">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="text-red-600 w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold"
          >
            Đóng
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 font-bold"
          >
            {isProcessing && <Loader className="animate-spin w-4 h-4" />}
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

// =======================
// ORDER DETAIL PAGE
// =======================
const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);

  // Lấy chi tiết đơn hàng
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `http://localhost:5000/api/donhang/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (data.success) setOrder(data.data);
      } catch (error) {
        console.error(error);
        setAlertMessage({
          type: "error",
          text: "Không thể tải chi tiết đơn hàng",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  // Hủy đơn
  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `http://localhost:5000/api/donhang/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setOrder({ ...order, trangThaiDonHang: "Đã hủy" });
        setAlertMessage({ type: "success", text: "Đơn hàng đã hủy" });
      } else {
        setAlertMessage({
          type: "error",
          text: data.message || "Không thể hủy đơn",
        });
      }
    } catch (err) {
      console.error(err);
      setAlertMessage({ type: "error", text: "Lỗi kết nối server" });
    } finally {
      setCancelling(false);
      setShowConfirmModal(false);
      setTimeout(() => setAlertMessage(null), 3000);
    }
  };

  if (loading)
    return (
      <div
        className="min-h-screen flex justify-center items-center bg-cover bg-center"
        style={{ backgroundImage: `url(${pizzaBgImage})` }}
      >
        <div className="bg-white/80 p-6 rounded-2xl shadow-lg flex flex-col items-center border border-white">
          <Loader className="animate-spin text-red-600 mb-2" size={40} />
          <span className="font-bold text-gray-900">Đang tải đơn hàng...</span>
        </div>
      </div>
    );

  if (!order)
    return (
      <div
        className="min-h-screen flex justify-center items-center bg-cover bg-center"
        style={{ backgroundImage: `url(${pizzaBgImage})` }}
      >
        <div className="bg-white/80 p-8 rounded-2xl shadow-lg font-bold text-gray-900">
          Không tìm thấy đơn hàng
        </div>
      </div>
    );

  return (
    // --- Wrapper chứa hình nền Pizza ---
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed pt-28 pb-10 px-4"
      style={{ backgroundImage: `url(${pizzaBgImage})` }}
    >
      {/* ALERT */}
      {alertMessage && (
        <div
          className={`fixed top-24 right-5 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 font-bold border-2 ${
            alertMessage.type === "success"
              ? "bg-green-100 text-green-800 border-green-300"
              : "bg-red-100 text-red-800 border-red-300"
          }`}
        >
          {alertMessage.type === "success" ? (
            <Truck size={24} />
          ) : (
            <AlertTriangle size={24} />
          )}
          <span>{alertMessage.text}</span>
          <button
            onClick={() => setAlertMessage(null)}
            className="ml-2 hover:opacity-70"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleCancelOrder}
        title="Xác nhận hủy đơn?"
        message="Bạn có chắc chắn muốn hủy đơn hàng này không?"
        isProcessing={cancelling}
      />

      {/* --- Container Chính: Trong suốt hoàn toàn (bg-transparent) --- */}
      <div className="max-w-5xl mx-auto bg-transparent">
        {/* HEADER: Nút Back và Tiêu đề */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate("/orders-history")}
            className="p-3 bg-white/20 text-white rounded-full shadow-md hover:bg-white/40 transition border border-white/40"
          >
            <ArrowLeft size={24} className="drop-shadow-sm" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              Chi tiết đơn hàng #
              {order.orderCode || order._id.slice(-6).toUpperCase()}
            </h1>
            <p className="text-white/90 text-sm font-semibold drop-shadow-md mt-1">
              Ngày đặt: {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: PRODUCTS */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. ORDER STATUS */}
            {/* Style: bg-white/80 (không blur), border-white/60 */}
            <div className="bg-white/90 p-6 rounded-3xl shadow-xl border-2 border-white/60">
              <h3 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                <Truck className="text-blue-600" size={24} /> Trạng thái đơn
                hàng
              </h3>
              <span
                className={`px-5 py-2 rounded-xl text-base font-bold border-2 ${getStatusColor(
                  order.trangThaiDonHang
                )}`}
              >
                {order.trangThaiDonHang}
              </span>
            </div>

            {/* 2. PRODUCT LIST */}
            <div className="bg-white/90 rounded-3xl shadow-xl border-2 border-white/60 overflow-hidden">
              <div className="p-5 border-b-2 border-gray-200/50 bg-white/50 font-bold text-gray-800 text-lg">
                Sản phẩm ({order.items.length})
              </div>
              <div className="divide-y-2 divide-gray-200/50">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 flex gap-5 hover:bg-white/50 transition items-center"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 shrink-0 shadow-sm bg-white">
                      {item.hinhAnh ? (
                        <img
                          src={item.hinhAnh}
                          alt={item.ten}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="text-gray-400 w-full h-full p-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg leading-tight">
                        {item.ten}
                      </h4>
                      <p className="text-sm text-gray-600 font-semibold mt-1">
                        Số lượng: x{item.soLuong}
                      </p>
                    </div>
                    <div className="text-right font-black text-red-600 text-lg">
                      {formatCurrency(item.gia)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: INFO */}
          <div className="lg:col-span-1 space-y-6">
            {/* 3. CUSTOMER INFO */}
            <div className="bg-white/90 p-6 rounded-3xl shadow-xl border-2 border-white/60">
              <h3 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                <MapPin className="text-orange-500" size={24} /> Địa chỉ nhận
                hàng
              </h3>
              <div className="text-sm text-gray-800 space-y-3 font-medium">
                <p className="font-bold text-base">
                  {order.thongTinGiaoHang.hoTen}
                </p>
                <p>{order.thongTinGiaoHang.soDienThoai}</p>
                <p className="text-gray-600 leading-relaxed bg-white/50 p-2 rounded-lg border border-gray-200">
                  {order.thongTinGiaoHang.diaChi}
                </p>
              </div>
            </div>

            {/* 4. PAYMENT INFO */}
            <div className="bg-white/90 p-6 rounded-3xl shadow-xl border-2 border-white/60">
              <h3 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                <CreditCard className="text-purple-600" size={24} /> Thanh toán
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600 font-semibold">
                    Phương thức
                  </span>
                  <span className="font-bold text-gray-900 bg-purple-50 px-2 py-1 rounded border border-purple-100">
                    {order.hinhThucThanhToan}
                  </span>
                </div>
                <div className="flex justify-between text-sm items-center border-t border-gray-200 pt-2">
                  <span className="text-gray-600 font-semibold">
                    Trạng thái
                  </span>
                  <span
                    className={getPaymentStatusColor(order.trangThaiThanhToan)}
                  >
                    {order.trangThaiThanhToan}
                  </span>
                </div>
              </div>
            </div>

            {/* 5. TOTAL */}
            <div className="bg-white/90 p-6 rounded-3xl shadow-xl border-2 border-white/60">
              <h3 className="font-extrabold text-gray-900 mb-4 text-lg">
                Tổng cộng
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600 font-semibold">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(order.tienTruocGiam)}</span>
                </div>
                {order.tienGiam > 0 && (
                  <div className="flex justify-between text-green-700 font-bold bg-green-50 px-2 py-1 rounded">
                    <span>Voucher</span>
                    <span>- {formatCurrency(order.tienGiam)}</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-300 pt-3 mt-2 flex justify-between items-center">
                  <span className="font-bold text-lg text-gray-800">
                    Thành tiền
                  </span>
                  <span className="font-black text-2xl text-red-600 drop-shadow-sm">
                    {formatCurrency(order.tongTien)}
                  </span>
                </div>
              </div>
            </div>

            {/* 6. ACTION BUTTONS */}
            {order.trangThaiDonHang === "Chờ xác nhận" && (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="w-full py-4 rounded-2xl bg-white/90 border-2 border-red-200 text-red-600 font-bold hover:bg-red-50 flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <XCircle size={22} /> Hủy đơn hàng
              </button>
            )}

            {(order.trangThaiThanhToan === "Chưa thanh toán" ||
              order.trangThaiThanhToan === "Thất bại") &&
              order.trangThaiDonHang !== "Đã hủy" && (
                <button
                  onClick={() =>
                    navigate("/checkout", {
                      state: {
                        orderId: order._id,
                        items: order.items,
                        totalPrice: order.tongTien,
                        discount: order.tienGiam,
                        shippingInfo: order.thongTinGiaoHang,
                      },
                    })
                  }
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-transform active:scale-95 border-2 border-white/20"
                >
                  <CreditCard size={22} /> Thanh toán lại
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
