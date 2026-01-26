import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const ORDER_STATUSES = [
  "Chờ xác nhận",
  "Đã xác nhận",
  "Đang giao",
  "Đã hoàn thành",
  "Đã hủy",
];

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi lấy danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/admin/orders/${orderId}/status`,
        { trangThaiDonHang: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Cập nhật trạng thái thành công");
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  if (loading) return <p>Đang tải đơn hàng...</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Quản lý đơn hàng</h1>
      {orders.length === 0 ? (
        <p>Chưa có đơn hàng nào</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-4 rounded-lg shadow flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p>
                    <strong>Mã đơn hàng:</strong> {order.orderCode}
                  </p>
                  <p>
                    <strong>Khách hàng:</strong> {order.nguoiDung?.hoTen} (
                    {order.nguoiDung?.email})
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>{" "}
                    <select
                      value={order.trangThaiDonHang}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </p>
                </div>
              </div>

              <div className="mt-2">
                <p className="font-semibold">Sản phẩm:</p>
                <ul className="pl-4 list-disc">
                  {order.items.map((item) => (
                    <li key={item.sanPham}>
                      {item.ten} - {item.soLuong} x {item.gia.toLocaleString()}₫
                    </li>
                  ))}
                </ul>
                <p className="mt-1">
                  <strong>Tổng tiền:</strong> {order.tongTien.toLocaleString()}₫
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManager;
