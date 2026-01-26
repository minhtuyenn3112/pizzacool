// src/pages/ThanhToanPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Loader,
  CheckCircle,
  XCircle,
  ArrowRight,
  Home,
  RefreshCw,
} from "lucide-react";

const ThanhToanPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // State quản lý trạng thái
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("Đang xử lý thanh toán..."); // Lưu thông báo từ Server
  const [orderId, setOrderId] = useState(null);

  // QUAN TRỌNG: Dùng useRef để chặn việc gọi API 2 lần trong React.StrictMode
  const isCalled = useRef(false);

  useEffect(() => {
    const checkPayment = async () => {
      // Nếu đã gọi rồi thì không gọi lại nữa
      if (isCalled.current) return;
      isCalled.current = true;

      try {
        // Lấy toàn bộ params từ URL
        const params = Object.fromEntries([...searchParams]);
        const txnRef = params.vnp_TxnRef;

        if (!txnRef) {
          setStatus("error");
          setMessage("Không tìm thấy mã giao dịch.");
          return;
        }

        setOrderId(txnRef);

        // Gọi API backend xác thực
        // Lưu ý: Đảm bảo port 5000 là đúng port backend của bạn
        const response = await axios.get(
          "http://localhost:5000/api/donhang/vnpay-return",
          { params }
        );

        // Xử lý kết quả trả về
        if (response.data.code === "00") {
          setStatus("success");
          setMessage("Giao dịch đã được ghi nhận thành công.");
        } else {
          setStatus("error");
          // Lấy tin nhắn lỗi từ backend trả về (nếu có) hoặc hiển thị mặc định
          setMessage(
            response.data.message || "Giao dịch thất bại hoặc bị hủy."
          );
        }
      } catch (error) {
        console.error("Lỗi xác thực:", error);
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Có lỗi kết nối đến server. Vui lòng liên hệ CSKH."
        );
      }
    };

    // Chỉ chạy khi có params trên URL
    if ([...searchParams].length > 0) {
      checkPayment();
    } else {
      setStatus("error");
      setMessage("Không tìm thấy thông tin thanh toán.");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100 transition-all duration-300">
        {/* ================= TRẠNG THÁI LOADING ================= */}
        {status === "loading" && (
          <div className="flex flex-col items-center py-6">
            <Loader className="w-16 h-16 text-blue-600 animate-spin mb-6" />
            <h2 className="text-xl font-bold text-gray-800">
              Đang xác thực giao dịch...
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Hệ thống đang kết nối với VNPAY, vui lòng đợi trong giây lát.
            </p>
          </div>
        )}

        {/* ================= TRẠNG THÁI THÀNH CÔNG ================= */}
        {status === "success" && (
          <div className="flex flex-col items-center animate-fade-in-up">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">
              Thanh toán thành công!
            </h2>
            <p className="text-gray-600 mb-1">
              Mã đơn hàng:{" "}
              <span className="font-bold text-black">#{orderId}</span>
            </p>
            <p className="text-sm text-gray-500 mb-8">{message}</p>

            <button
              onClick={() => navigate(`/don-hang/${orderId}`)} // Sửa lại đường dẫn chi tiết đơn hàng cho đúng router của bạn
              className="w-full bg-black text-white py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Xem chi tiết đơn hàng <ArrowRight size={18} />
            </button>

            <button
              onClick={() => navigate("/")}
              className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-black transition"
            >
              <Home size={16} /> Về trang chủ
            </button>
          </div>
        )}

        {/* ================= TRẠNG THÁI THẤT BẠI ================= */}
        {status === "error" && (
          <div className="flex flex-col items-center animate-fade-in-up">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Thanh toán thất bại
            </h2>
            <p className="text-gray-600 mb-8 px-4">{message}</p>

            <div className="flex flex-col w-full gap-3">
              <button
                onClick={() => navigate("/checkout")} // Quay lại trang thanh toán
                className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition shadow-md flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} /> Thử thanh toán lại
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThanhToanPage;
