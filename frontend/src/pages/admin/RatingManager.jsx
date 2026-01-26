import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const RatingManager = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [replyText, setReplyText] = useState("");

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "http://localhost:5000/api/admin/danhgia",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRatings(data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Lỗi khi lấy đánh giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const handleReply = (rating) => {
    setEditing(rating);
    setReplyText(rating.phanHoi || "");
  };

  const saveReply = async () => {
    if (!editing) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/admin/danhgia/${editing._id}/phanhoi`,
        { phanHoi: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Đã phản hồi");
      setEditing(null);
      setReplyText("");
      fetchRatings();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Lỗi khi lưu phản hồi");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý Đánh giá</h1>

      {loading ? (
        <p>Đang tải...</p>
      ) : ratings.length === 0 ? (
        <p>Chưa có đánh giá.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Sản phẩm</th>
                <th className="px-4 py-2 text-left">Người đánh</th>
                <th className="px-4 py-2 text-left">Điểm</th>
                <th className="px-4 py-2 text-left">Nhận xét</th>
                <th className="px-4 py-2 text-left">Phản hồi</th>
                <th className="px-4 py-2 text-left">Ngày</th>
                <th className="px-4 py-2 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((r) => (
                <tr key={r._id} className="border-b">
                  <td className="px-4 py-2">{r.sanPham?.ten || "-"}</td>
                  <td className="px-4 py-2">
                    {r.nguoiDung?.hoTen || r.nguoiDung?.email || "Khách"}
                  </td>
                  <td className="px-4 py-2">{r.diemDanhGia || "-"}</td>
                  <td className="px-4 py-2">{r.nhanXet || "-"}</td>
                  <td className="px-4 py-2">{r.phanHoi || "-"}</td>
                  <td className="px-4 py-2">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleReply(r)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                    >
                      Phản hồi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal reply */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-3">Phản hồi đánh giá</h2>
              <p className="text-sm text-slate-600 mb-3">
                Sản phẩm: {editing.sanPham?.ten}
              </p>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                className="w-full border rounded px-3 py-2 mb-3"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setEditing(null);
                    setReplyText("");
                  }}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Hủy
                </button>
                <button
                  onClick={saveReply}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Lưu phản hồi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingManager;
