import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Edit2, Trash2, Plus, X } from "lucide-react";

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [soLuongDaBan, setSoLuongDaBan] = useState({});
  const [formData, setFormData] = useState({
    ten: "",
    moTa: "",
    gia: "",
    loai: "pizza",
    kichThuoc: "",
    trangThai: true,
    sl: "",
    hinhAnh: "",
  });

  //lấy danh sách sản phẩm từ API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:5000/api/sanpham");
      setProducts(data);

      // Lấy dữ liệu số lượng đã bán
      try {
        const { data: salesData } = await axios.get(
          "http://localhost:5000/api/sanpham/sales/total"
        );
        setSoLuongDaBan(salesData);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu bán hàng:", err);
      }
    } catch (err) {
      toast.error("Lỗi khi lấy danh sách sản phẩm");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Lọc sản phẩm dựa trên từ khóa tìm kiếm và loại
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product._id.includes(searchTerm);
    const matchesType = !filterType || product.loai === filterType;
    return matchesSearch && matchesType;
  });

  // Xử lý thay đổi input trong form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Xử lý mở modal để tạo sản phẩm mới
  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      ten: "",
      moTa: "",
      gia: "",
      loai: "pizza",
      kichThuoc: "",
      trangThai: true,
      sl: "",
      hinhAnh: "",
    });
    setShowModal(true);
  };

  // Xử lý mở modal để chỉnh sửa sản phẩm
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      ten: product.ten || "",
      moTa: product.moTa || "",
      gia: product.gia || "",
      loai: product.loai || "pizza",
      kichThuoc: product.kichThuoc || "",
      trangThai: product.trangThai !== false,
      sl: product.sl || "",
      hinhAnh: product.hinhAnh || "",
    });
    setShowModal(true);
  };

  // Xử lý lưu sản phẩm (tạo mới hoặc cập nhật)
  const handleSaveProduct = async (e) => {
    e.preventDefault();

    // Kiểm tra dữ liệu đầu vào
    if (!formData.ten || !formData.gia || !formData.loai) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      if (editingProduct) {
        // Cập nhật sản phẩm hiện có
        await axios.put(
          `http://localhost:5000/api/sanpham/${editingProduct._id}`,
          formData,
          config
        );
        toast.success("Cập nhật sản phẩm thành công");
      } else {
        // Tạo sản phẩm mới
        await axios.post("http://localhost:5000/api/sanpham", formData, config);
        toast.success("Thêm sản phẩm thành công");
      }

      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu sản phẩm");
      console.error(err);
    }
  };

  // Xử lý xóa sản phẩm
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/sanpham/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Xóa sản phẩm thành công");
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xóa sản phẩm thất bại");
      console.error(err);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
          <button
            onClick={handleAddProduct}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Plus size={20} />
            Thêm sản phẩm
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Tìm theo tên hoặc ID sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại sản phẩm
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tất cả</option>
                <option value="pizza">Pizza</option>
                <option value="my">Mỳ</option>
                <option value="ga">Gà</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Đang tải danh sách sản phẩm...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Không tìm thấy sản phẩm nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Tên sản phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Giá
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Hàng tồn kho
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Đã Bán
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Cập nhật
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-3">
                          {product.hinhAnh && (
                            <img
                              src={`http://localhost:5000${product.hinhAnh}`}
                              alt={product.ten}
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          <div>
                            <p className="font-medium">{product.ten}</p>
                            <p className="text-xs text-gray-500">
                              {product._id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {product.loai}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {product.gia?.toLocaleString()}₫
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {product.sl || 0}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-green-700">
                        {soLuongDaBan[product._id] || 0}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {(() => {
                          // Determine status label and classes
                          let label = product.trangThai
                            ? "Còn bán"
                            : "Ngưng bán";
                          let classes =
                            "px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-500";

                          const soldQuantity = soLuongDaBan[product._id] || 0;

                          // If explicitly turned off by admin (highest priority)
                          if (!product.trangThai) {
                            label = "Ngưng bán";
                            classes =
                              "px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600";
                          } else if (Number(soldQuantity) > 15) {
                            // If sold quantity greater than 15 => Bán chạy
                            label = "Bán chạy";
                            classes =
                              "px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700";
                          } else if (product.trangThai) {
                            // If product is active => Còn bán
                            label = "Còn bán";
                            classes =
                              "px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-500";
                          }

                          return <span className={classes}>{label}</span>;
                        })()}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {product.createdAt
                          ? new Date(product.createdAt).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {product.updatedAt
                          ? new Date(product.updatedAt).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
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

        {/* Modal cho chỉnh sửa/xóa sản phẩm */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">
                    {editingProduct
                      ? "Chỉnh sửa sản phẩm"
                      : "Thêm sản phẩm mới"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tên sản phẩm */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên sản phẩm *
                      </label>
                      <input
                        type="text"
                        name="ten"
                        value={formData.ten}
                        onChange={handleInputChange}
                        placeholder="Nhập tên sản phẩm"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>

                    {/* Giá */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giá *
                      </label>
                      <input
                        type="number"
                        name="gia"
                        value={formData.gia}
                        onChange={handleInputChange}
                        placeholder="Nhập giá"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>

                    {/* Loại sản phẩm */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loại sản phẩm *
                      </label>
                      <select
                        name="loai"
                        value={formData.loai}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="pizza">Pizza</option>
                        <option value="my">Mỳ</option>
                        <option value="ga">Gà</option>
                      </select>
                    </div>

                    {/* Số lượng */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tồn kho
                      </label>
                      <input
                        type="number"
                        name="sl"
                        value={formData.sl}
                        onChange={handleInputChange}
                        placeholder="Nhập số lượng tồn kho"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    {/* Kích thước */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kích thước
                      </label>
                      <input
                        type="text"
                        name="kichThuoc"
                        value={formData.kichThuoc}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: nhỏ, vừa, lớn"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    {/* Link hình ảnh */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Link hình ảnh
                      </label>
                      <input
                        type="text"
                        name="hinhAnh"
                        value={formData.hinhAnh}
                        onChange={handleInputChange}
                        placeholder="Nhập link hình ảnh"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Mô tả */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả
                    </label>
                    <textarea
                      name="moTa"
                      value={formData.moTa}
                      onChange={handleInputChange}
                      placeholder="Nhập mô tả sản phẩm"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Trạng thái */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="trangThai"
                      checked={formData.trangThai}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700">
                      Còn bán
                    </label>
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
                      {editingProduct ? "Cập nhật" : "Thêm"}
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

export default ProductManager;
