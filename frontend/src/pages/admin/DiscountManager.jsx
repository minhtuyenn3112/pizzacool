import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Edit2, Trash2, Plus, X } from "lucide-react";

const DiscountManager = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    tenMa: "",
    maCode: "",
    giaTriGiam: "",
    ngayBatDau: "",
    ngayKetThuc: "",
    conHieuLuc: true,
    Mota: "",
    dieuKienToiThieu: "",
    soLuotSuDung: "",
    chiTietDieuKien: "",
  });

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:5000/api/magiamgia");
      setDiscounts(data);
    } catch (err) {
      toast.error("Lỗi khi lấy danh sách khuyến mãi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const filteredDiscounts = discounts.filter(
    (d) =>
      d.tenMa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.maCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAddDiscount = () => {
    setEditingDiscount(null);
    setFormData({
      tenMa: "",
      maCode: "",
      giaTriGiam: "",
      ngayBatDau: "",
      ngayKetThuc: "",
      conHieuLuc: true,
      Mota: "",
      dieuKienToiThieu: "",
      soLuotSuDung: "",
      chiTietDieuKien: "",
    });
    setShowModal(true);
  };

  const handleEditDiscount = (discount) => {
    setEditingDiscount(discount);
    setFormData({
      tenMa: discount.tenMa || "",
      maCode: discount.maCode || "",
      giaTriGiam: discount.giaTriGiam || "",
      ngayBatDau: discount.ngayBatDau ? discount.ngayBatDau.split("T")[0] : "",
      ngayKetThuc: discount.ngayKetThuc
        ? discount.ngayKetThuc.split("T")[0]
        : "",
      conHieuLuc: discount.conHieuLuc !== false,
      Mota: discount.Mota || "",
      dieuKienToiThieu: discount.dieuKienToiThieu || "",
      soLuotSuDung: discount.soLuotSuDung || "",
      chiTietDieuKien: discount.chiTietDieuKien || "",
    });
    setShowModal(true);
  };

  const handleSaveDiscount = async (e) => {
    e.preventDefault();

    if (!formData.tenMa || !formData.maCode || formData.giaTriGiam === "") {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      };

      if (editingDiscount) {
        await axios.put(
          `http://localhost:5000/api/magiamgia/${editingDiscount._id}`,
          formData,
          config
        );
        toast.success("Cập nhật khuyến mãi thành công");
      } else {
        await axios.post(
          "http://localhost:5000/api/magiamgia",
          formData,
          config
        );
        toast.success("Thêm khuyến mãi thành công");
      }

      setShowModal(false);
      fetchDiscounts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu khuyến mãi");
      console.error(err);
    }
  };

  const handleDeleteDiscount = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khuyến mãi này?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/magiamgia/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast.success("Xóa khuyến mãi thành công");
      fetchDiscounts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xóa khuyến mãi thất bại");
      console.error(err);
    }
  };

  const isActive = (discount) => {
    const now = new Date();
    const start = discount.ngayBatDau ? new Date(discount.ngayBatDau) : null;
    const end = discount.ngayKetThuc ? new Date(discount.ngayKetThuc) : null;
    return (
      discount.conHieuLuc && (!start || now >= start) && (!end || now <= end)
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Quản lý Khuyến mãi
          </h1>
          <button
            onClick={handleAddDiscount}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Plus size={20} />
            Thêm khuyến mãi
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã khuyến mãi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Discounts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Đang tải danh sách khuyến mãi...
            </div>
          ) : filteredDiscounts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Không tìm thấy khuyến mãi nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Tên
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Mã
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Giá trị giảm
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Điều kiện tối thiểu
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Số lượt sử dụng
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Ngày bắt đầu
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Ngày kết thúc
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDiscounts.map((discount) => (
                    <tr
                      key={discount._id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {discount.tenMa}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {discount.maCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        -{discount.giaTriGiam.toLocaleString()}₫
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {discount.dieuKienToiThieu
                          ? `${discount.dieuKienToiThieu.toLocaleString()}₫`
                          : "Không giới hạn"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {discount.soLuotSuDung === -1
                          ? "Không giới hạn"
                          : discount.soLuotSuDung}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {discount.ngayBatDau
                          ? new Date(discount.ngayBatDau).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {discount.ngayKetThuc
                          ? new Date(discount.ngayKetThuc).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            isActive(discount)
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isActive(discount)
                            ? "Đang hoạt động"
                            : "Không hoạt động"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditDiscount(discount)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteDiscount(discount._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal for Add/Edit Discount */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">
                    {editingDiscount
                      ? "Chỉnh sửa khuyến mãi"
                      : "Thêm khuyến mãi mới"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSaveDiscount} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tên khuyến mãi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên khuyến mãi *
                      </label>
                      <input
                        type="text"
                        name="tenMa"
                        value={formData.tenMa}
                        onChange={handleInputChange}
                        placeholder="Nhập tên khuyến mãi"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>

                    {/* Mã khuyến mãi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mã khuyến mãi *
                      </label>
                      <input
                        type="text"
                        name="maCode"
                        value={formData.maCode}
                        onChange={handleInputChange}
                        placeholder="Nhập mã (VD: SAVE10)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>

                    {/* Giá trị giảm */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giá trị giảm (₫) *
                      </label>
                      <input
                        type="number"
                        name="giaTriGiam"
                        value={formData.giaTriGiam}
                        onChange={handleInputChange}
                        placeholder="Nhập giá trị giảm"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>

                    {/* Điều kiện tối thiểu */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Điều kiện tối thiểu (₫)
                      </label>
                      <input
                        type="number"
                        name="dieuKienToiThieu"
                        value={formData.dieuKienToiThieu}
                        onChange={handleInputChange}
                        placeholder="Nhập số tiền tối thiểu (0 = không giới hạn)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    {/* Số lượt sử dụng */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số lượt sử dụng
                      </label>
                      <input
                        type="number"
                        name="soLuotSuDung"
                        value={formData.soLuotSuDung}
                        onChange={handleInputChange}
                        placeholder="Nhập số lượt (-1 = không giới hạn)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    {/* Ngày bắt đầu */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày bắt đầu
                      </label>
                      <input
                        type="date"
                        name="ngayBatDau"
                        value={formData.ngayBatDau}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    {/* Ngày kết thúc */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày kết thúc
                      </label>
                      <input
                        type="date"
                        name="ngayKetThuc"
                        value={formData.ngayKetThuc}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    {/* Trạng thái */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="conHieuLuc"
                        checked={formData.conHieuLuc}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded"
                      />
                      <label className="ml-2 text-sm font-medium text-gray-700">
                        Còn hiệu lực
                      </label>
                    </div>
                  </div>

                  {/* Chi tiết điều kiện */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chi tiết điều kiện sử dụng
                    </label>
                    <textarea
                      name="chiTietDieuKien"
                      value={formData.chiTietDieuKien}
                      onChange={handleInputChange}
                      placeholder="Nhập chi tiết điều kiện sử dụng (ví dụ: Áp dụng cho đơn hàng online, không áp dụng cùng chương trình khác...)"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Mô tả */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả
                    </label>
                    <textarea
                      name="Mota"
                      value={formData.Mota}
                      onChange={handleInputChange}
                      placeholder="Nhập mô tả khuyến mãi"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      {editingDiscount ? "Cập nhật" : "Thêm"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountManager;
