import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// --- IMPORT HÌNH NỀN ---
// Đảm bảo đường dẫn này đúng với dự án của bạn
import pizzaBgImage from "../images/login.jpg";
// -----------------------

export default function Login() {
  const [formData, setFormData] = useState({ email: "", matKhau: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validate = () => {
    if (!formData.email || !formData.matKhau) {
      setError("Vui lòng nhập đầy đủ Email và Mật khẩu.");
      return false;
    }
    const re = /^\S+@\S+\.\S+$/;
    if (!re.test(formData.email)) {
      setError("Email không hợp lệ.");
      return false;
    }
    if (formData.matKhau.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/nguoidung/dangnhap",
        formData
      );
      const { token, user } = response.data;

      login(user, token);

      // Chuyển hướng theo role
      if (user.vaiTro === "quan_tri") {
        navigate("/admin/dashboard");
      } else {
        navigate("/"); // Người dùng bình thường
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // --- Wrapper chứa hình nền Pizza ---
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed flex items-center justify-center p-6"
      style={{ backgroundImage: `url(${pizzaBgImage})` }}
    >
      {/* --- Khung Form Glassmorphism Trong Suốt Hơn ---
          - bg-white/20: Nền trắng rất trong (cũ là /50)
          - backdrop-blur-md: Độ mờ vừa phải
          - border-white/30: Viền mỏng và mờ
      */}
      <div className="w-full max-w-md bg-white/20 backdrop-blur-md shadow-2xl rounded-3xl border border-white/30 p-8 relative overflow-hidden">
        {/* Hiệu ứng ánh sáng nhẹ ở góc (tuỳ chọn) */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2"
              />
            </svg>
          </div>

          <h1 className="mt-6 text-4xl font-extrabold text-gray-900 drop-shadow-sm tracking-tight">
            Đăng nhập
          </h1>
          <p className="text-base text-gray-800 mt-2 font-semibold">
            Chào mừng trở lại với Pizza Cool!
          </p>
        </div>

        {error && (
          <div className="mb-6 text-sm text-red-700 bg-red-100/90 border border-red-200 p-4 rounded-xl font-bold relative z-10">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-extrabold text-gray-800 mb-2 ml-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              // Input trong suốt hơn: bg-white/30
              className="mt-1 block w-full rounded-xl border border-white/40 bg-white/30 px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-gray-900 transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-extrabold text-gray-800 mb-2 ml-1">
              <span>Mật khẩu</span>
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-xs text-red-600 hover:text-red-800 font-bold uppercase"
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </label>
            <input
              name="matKhau"
              type={showPassword ? "text" : "password"}
              value={formData.matKhau}
              onChange={(e) =>
                setFormData({ ...formData, matKhau: e.target.value })
              }
              required
              // Input trong suốt hơn: bg-white/30
              className="mt-1 block w-full rounded-xl border border-white/40 bg-white/30 px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-gray-900 transition-all"
              placeholder="Nhập mật khẩu"
            />
            <div className="text-right mt-3">
              <Link
                to="/forgot-password"
                className="text-sm text-red-600 hover:text-red-800 font-extrabold"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 px-4 py-4 text-white font-extrabold text-lg shadow-xl hover:shadow-red-500/40 hover:from-red-700 hover:to-orange-700 disabled:opacity-60 transition-all duration-300 transform hover:scale-[1.02]"
          >
            {loading ? (
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
            ) : (
              "Đăng Nhập Ngay"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-800 font-bold relative z-10">
          <p>
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-red-600 font-extrabold hover:underline ml-1"
            >
              Đăng ký tại đây
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
