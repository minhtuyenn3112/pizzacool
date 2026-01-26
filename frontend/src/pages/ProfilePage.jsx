import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Home, Lock, Trash2 } from "lucide-react";

// --- IMPORT HÌNH NỀN ---
import pizzaBgImage from "../images/anh.jpg";
// -----------------------

const ProfilePage = () => {
  const { isAuthenticated, token, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [passwords, setPasswords] = useState({ old: "", new: "" });

  // Lấy thông tin người dùng
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/nguoidung/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Lỗi tải hồ sơ:", err);
        alert("Không thể tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, token, navigate]);

  // Cập nhật thông tin
  const handleUpdate = async () => {
    try {
      const res = await axios.put(
        "http://localhost:5000/api/nguoidung/me",
        profile,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(res.data);
      setEditing(false);
      alert("Cập nhật thông tin thành công!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Cập nhật thất bại");
    }
  };

  // Đổi mật khẩu
  const handleChangePassword = async () => {
    if (!passwords.old || !passwords.new) return alert("Nhập đầy đủ mật khẩu");
    try {
      await axios.put(
        "http://localhost:5000/api/nguoidung/me/doimatkhau",
        { matKhauCu: passwords.old, matKhauMoi: passwords.new },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswords({ old: "", new: "" });
      alert("Đổi mật khẩu thành công!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  };

  // Xóa tài khoản
  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản?")) return;
    try {
      await axios.delete("http://localhost:5000/api/nguoidung/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Xóa tài khoản thành công!");
      logout();
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Xóa thất bại");
    }
  };

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${pizzaBgImage})` }}
      >
        <div className="bg-white/60 backdrop-blur-md px-6 py-3 rounded-xl shadow-lg border border-white/50">
          <p className="text-center text-gray-800 font-bold animate-pulse text-lg">
            Đang tải hồ sơ...
          </p>
        </div>
      </div>
    );

  return (
    // --- Wrapper Background ---
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed flex items-center justify-center py-12 px-4"
      style={{ backgroundImage: `url(${pizzaBgImage})` }}
    >
      {/* --- OUTER CONTAINER (KHUNG NGOÀI) ---
          Yêu cầu: Trong suốt hoàn toàn.
          - bg-transparent
          - Bỏ shadow, border, backdrop-blur
      */}
      <div className="max-w-3xl w-full p-4 bg-transparent">
        {/* Tiêu đề: Màu trắng + Drop shadow để nổi bật trên nền ảnh */}
        <h1 className="text-4xl font-extrabold text-center text-white mb-8 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] uppercase tracking-wide">
          Hồ sơ cá nhân
        </h1>

        {/* Thông tin cơ bản: Các thẻ con giữ hiệu ứng kính (Glassmorphism) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[
            { key: "hoTen", label: "Họ và tên", icon: <User size={20} /> },
            { key: "email", label: "Email", icon: <Mail size={20} /> },
            {
              key: "soDienThoai",
              label: "Số điện thoại",
              icon: <Phone size={20} />,
            },
            { key: "diaChi", label: "Địa chỉ", icon: <Home size={20} /> },
          ].map(({ key, label, icon }) => (
            <div
              key={key}
              // --- CARD NHỎ: GIỮ HIỆU ỨNG KÍNH ---
              // bg-white/60 + backdrop-blur-md + shadow-xl
              className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/80 hover:-translate-y-1"
            >
              <div className="text-red-600 bg-white/70 p-3 rounded-full shadow-sm">
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">
                  {label}
                </p>
                {editing ? (
                  <input
                    type={key === "email" ? "email" : "text"}
                    value={profile[key] || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, [key]: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-gray-300/50 bg-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition text-sm font-medium"
                  />
                ) : (
                  <p
                    className="text-gray-900 font-extrabold text-lg truncate"
                    title={profile[key]}
                  >
                    {profile[key] || "Chưa cập nhật"}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Nút chỉnh sửa / lưu */}
        <div className="flex justify-center mt-10 space-x-4">
          {editing ? (
            <>
              <button
                onClick={handleUpdate}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-105"
              >
                Lưu thay đổi
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-8 py-3 bg-gray-500/80 hover:bg-gray-600/90 text-white font-semibold rounded-xl shadow-md backdrop-blur-sm transition"
              >
                Hủy
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-105"
            >
              Chỉnh sửa thông tin
            </button>
          )}
        </div>

        {/* Đổi mật khẩu: KHUNG KÍNH */}
        <div className="mt-12 p-8 bg-white/60 backdrop-blur-md border border-white/50 rounded-3xl shadow-xl space-y-6 transition-all hover:bg-white/70">
          <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-3 border-b border-gray-400/20 pb-4">
            <Lock size={28} className="text-yellow-600" />
            <span>Bảo mật</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                placeholder="••••••"
                value={passwords.old}
                onChange={(e) =>
                  setPasswords({ ...passwords, old: e.target.value })
                }
                className="w-full px-4 py-3 border border-white/60 bg-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 transition placeholder-gray-400 shadow-inner"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                placeholder="••••••"
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
                className="w-full px-4 py-3 border border-white/60 bg-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 transition placeholder-gray-400 shadow-inner"
              />
            </div>
          </div>

          <button
            onClick={handleChangePassword}
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-md transition transform hover:scale-[1.01] mt-2"
          >
            Cập nhật mật khẩu
          </button>
        </div>

        {/* Xóa tài khoản */}
        <div className="mt-10 text-center">
          <button
            onClick={handleDelete}
            className="px-6 py-2 bg-red-600/90 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg backdrop-blur-sm flex items-center justify-center gap-2 mx-auto transition hover:scale-105 text-sm"
          >
            <Trash2 size={16} /> Xóa tài khoản vĩnh viễn
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
