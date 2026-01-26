import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    revenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/dashboard");

      setStats(res.data.stats);
      setRecentOrders(res.data.recentOrders);
    } catch (err) {
      console.error("Lỗi load Dashboard", err);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Bảng điều khiển</h1>

      {/* Cards thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-white rounded-xl shadow">
          <h3 className="text-gray-600">Người dùng</h3>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow">
          <h3 className="text-gray-600">Sản phẩm</h3>
          <p className="text-3xl font-bold">{stats.totalProducts}</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow">
          <h3 className="text-gray-600">Đơn hàng</h3>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow">
          <h3 className="text-gray-600">Doanh thu</h3>
          <p className="text-3xl font-bold">
            {stats.revenue.toLocaleString()}₫
          </p>
        </div>
      </div>

      {/* Đơn hàng gần đây */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Đơn hàng gần đây</h2>

        <table className="w-full border">
          <thead>
            <tr className="bg-red-200">
              <th className="p-2 border">Mã đơn</th>
              <th className="p-2 border">Khách hàng</th>
              <th className="p-2 border">Tổng tiền</th>
              <th className="p-2 border">Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {recentOrders.map((order) => (
              <tr key={order._id} className="text-center">
                <td className="p-2 border">{order._id}</td>
                <td className="p-2 border">{order.khachHang}</td>
                <td className="p-2 border">
                  {order.tongTien.toLocaleString()}₫
                </td>
                <td className="p-2 border">
                  <span
                    className={`px-2 py-1 rounded text-white text-sm ${
                      order.trangThai === "thanh_cong"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {order.trangThai}
                  </span>
                </td>
              </tr>
            ))}

            {recentOrders.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  Không có đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
