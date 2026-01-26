import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

// --- IMPORT HÌNH NỀN ---
import pizzaBgImage from "../images/re.jpg";
// -----------------------

export default function Register() {
  const [formData, setFormData] = useState({
    hoTen: "",
    email: "",
    matKhau: "",
    soDienThoai: "",
    diaChi: "",
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const emailRe = /^\S+@\S+\.\S+$/;
  const phoneRe = /^\d{9,11}$/;

  const validateField = (name, value) => {
    switch (name) {
      case "hoTen":
        if (!value || value.trim().length === 0) return "Họ tên là bắt buộc.";
        if (value.trim().length < 2) return "Họ tên quá ngắn.";
        return "";
      case "email":
        if (!value) return "Email là bắt buộc.";
        if (!emailRe.test(value)) return "Email không hợp lệ.";
        return "";
      case "matKhau":
        if (!value) return "Mật khẩu là bắt buộc.";
        if (value.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
        return "";
      case "soDienThoai":
        if (!value) return "";
        if (!phoneRe.test(value)) return "Số điện thoại phải là 9-11 chữ số.";
        return "";
      case "diaChi":
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    setGlobalError(null);
    setSuccess(null);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError(null);
    setSuccess(null);

    if (!validateAll()) {
      setGlobalError("Vui lòng sửa các lỗi trước khi tiếp tục.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/nguoidung/dangky", formData);
      setSuccess("Đăng ký thành công! Chuyển hướng tới trang đăng nhập...");
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      setGlobalError(message);
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
      {/* --- Khung Đăng Ký Trong Suốt (Very Transparent Glass) ---
          - bg-white/20: Nền cực trong
          - backdrop-blur-md: Độ mờ vừa phải để đọc chữ
          - border-white/30: Viền kính mỏng
      */}
      <div className="w-full max-w-md bg-white/20 backdrop-blur-md shadow-2xl rounded-3xl border border-white/30 p-8 relative overflow-hidden">
        {/* Hiệu ứng ánh sáng góc (Gradient overlay nhẹ) */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

        <div className="flex flex-col items-center mb-6 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white"
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

          <h1 className="mt-4 text-3xl font-extrabold text-gray-900 drop-shadow-sm tracking-tight">
            Tạo tài khoản mới
          </h1>
          <p className="text-sm text-gray-800 mt-1 font-bold">
            Nhanh chóng, an toàn và dễ dàng
          </p>
        </div>

        {globalError && (
          <div className="mb-4 text-sm text-red-700 bg-red-100/90 border border-red-200 p-3 rounded-xl font-bold relative z-10">
            {globalError}
          </div>
        )}

        {success && (
          <div className="mb-4 text-sm text-green-800 bg-green-100/90 border border-green-200 p-3 rounded-xl font-bold relative z-10">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 relative z-10"
          noValidate
        >
          {/* Họ tên */}
          <div>
            <label className="block text-sm font-extrabold text-gray-800 ml-1 mb-1">
              Họ tên *
            </label>
            <input
              name="hoTen"
              value={formData.hoTen}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              // Input trong suốt: bg-white/30
              className={`mt-1 block w-full rounded-xl border px-4 py-2.5 placeholder-gray-600 bg-white/30 focus:outline-none focus:ring-2 font-bold text-gray-900 transition-all ${
                errors.hoTen
                  ? "border-red-400 focus:ring-red-300 bg-red-50/40"
                  : "border-white/40 focus:ring-red-500"
              }`}
              placeholder="Nguyễn Văn A"
            />
            {errors.hoTen && (
              <p className="mt-1 text-xs text-red-700 font-bold bg-red-100/50 px-2 py-0.5 rounded inline-block">
                {errors.hoTen}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-extrabold text-gray-800 ml-1 mb-1">
              Email *
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`mt-1 block w-full rounded-xl border px-4 py-2.5 placeholder-gray-600 bg-white/30 focus:outline-none focus:ring-2 font-bold text-gray-900 transition-all ${
                errors.email
                  ? "border-red-400 focus:ring-red-300 bg-red-50/40"
                  : "border-white/40 focus:ring-red-500"
              }`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-700 font-bold bg-red-100/50 px-2 py-0.5 rounded inline-block">
                {errors.email}
              </p>
            )}
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="flex items-center justify-between text-sm font-extrabold text-gray-800 ml-1 mb-1">
              <span>Mật khẩu *</span>
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
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`mt-1 block w-full rounded-xl border px-4 py-2.5 placeholder-gray-600 bg-white/30 focus:outline-none focus:ring-2 font-bold text-gray-900 transition-all ${
                errors.matKhau
                  ? "border-red-400 focus:ring-red-300 bg-red-50/40"
                  : "border-white/40 focus:ring-red-500"
              }`}
              placeholder="Ít nhất 6 ký tự"
              autoComplete="new-password"
            />
            {errors.matKhau && (
              <p className="mt-1 text-xs text-red-700 font-bold bg-red-100/50 px-2 py-0.5 rounded inline-block">
                {errors.matKhau}
              </p>
            )}
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-sm font-extrabold text-gray-800 ml-1 mb-1">
              Số điện thoại
            </label>
            <input
              name="soDienThoai"
              value={formData.soDienThoai}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-1 block w-full rounded-xl border px-4 py-2.5 placeholder-gray-600 bg-white/30 focus:outline-none focus:ring-2 font-bold text-gray-900 transition-all ${
                errors.soDienThoai
                  ? "border-red-400 focus:ring-red-300 bg-red-50/40"
                  : "border-white/40 focus:ring-red-500"
              }`}
              placeholder="Ví dụ: 0912345678"
            />
            {errors.soDienThoai && (
              <p className="mt-1 text-xs text-red-700 font-bold bg-red-100/50 px-2 py-0.5 rounded inline-block">
                {errors.soDienThoai}
              </p>
            )}
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="block text-sm font-extrabold text-gray-800 ml-1 mb-1">
              Địa chỉ
            </label>
            <input
              name="diaChi"
              value={formData.diaChi}
              onChange={handleChange}
              className="mt-1 block w-full rounded-xl border border-white/40 bg-white/30 px-4 py-2.5 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-gray-900 transition-all"
              placeholder="Số nhà, đường, quận..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 px-4 py-3.5 text-white font-extrabold text-lg shadow-xl hover:shadow-red-500/40 hover:from-red-700 hover:to-orange-700 disabled:opacity-60 transition-all duration-300 transform hover:scale-[1.02]"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
              "Đăng Ký Ngay"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-800 font-bold relative z-10">
          <p>
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-red-600 font-extrabold hover:underline ml-1"
            >
              Đăng nhập
            </Link>
          </p>
          <p className="mt-2 text-xs text-gray-700">
            Bằng việc đăng ký bạn đồng ý với Điều khoản và Chính sách bảo mật.
          </p>
        </div>
      </div>
    </div>
  );
}
