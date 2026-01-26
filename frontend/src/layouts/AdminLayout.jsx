import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  LogOut,
  MessageCircleOff,
  House,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ---- Sidebar ---- */}
      <aside className="w-64 bg-gradient-to-b from-red-900 to-gray-800 text-white shadow-xl p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-10 tracking-wide">
          Admin PizzaCool
        </h2>

        <nav className="flex flex-col gap-3">
          <SidebarItem
            to="/admin/dashboard"
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
          />
          <SidebarItem
            to="/admin/users"
            icon={<Users size={20} />}
            label="Quản lý Users"
          />
          <SidebarItem
            to="/admin/orders"
            icon={<ShoppingBag size={20} />}
            label="Quản lý Đơn hàng"
          />
          <SidebarItem
            to="/admin/products"
            icon={<Package size={20} />}
            label="Quản lý Sản phẩm"
          />
          <SidebarItem
            to="/admin/reviews"
            icon={<MessageCircleOff size={20} />}
            label="Quản lý Đánh giá"
          />
          <SidebarItem
            to="/admin/discounts"
            icon={<DollarSign size={20} />}
            label="Quản lý Khuyến mãi"
          />
          <SidebarItem to="/" icon={<House size={20} />} label="Về trang chủ" />
          <LogoutButton />
        </nav>
      </aside>

      {/* ---- Main content ---- */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

const SidebarItem = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 rounded-lg transition-all cursor-pointer
         ${
           isActive
             ? "bg-gray-700 text-white shadow-md"
             : "text-gray-300 hover:bg-gray-700 hover:text-white"
         }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Đã đăng xuất");
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white`}
    >
      <LogOut size={20} />
      <span>Thoát Admin</span>
    </button>
  );
};

export default AdminLayout;
