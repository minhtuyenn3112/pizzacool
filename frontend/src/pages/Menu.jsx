import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";
import { Search, Filter, ArrowUpDown, Loader, Menu } from "lucide-react";
import pizzaBgImage from "../images/menu.jpg";

const API_BASE_URL = import.meta.env.VITE_API_BASE;
const API_URL = `${API_BASE_URL}/sanpham`;

function TrangSanPham() {
  const [sanPhams, setSanPhams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [loaiFilter, setLoaiFilter] = useState("tatca");
  const [sortOrder, setSortOrder] = useState("none");
  const [searchTerm, setSearchTerm] = useState("");
  const { addToCart, fetchCart } = useCart();
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    fetchSanPhams();
  }, []);

  const fetchSanPhams = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setSanPhams(response.data);
    } catch (err) {
      setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 👉 Lọc + Tìm kiếm + Sắp xếp
  const filteredSanPhams = sanPhams
    .filter((sp) => {
      const matchLoai = loaiFilter === "tatca" || sp.loai === loaiFilter;
      const matchSearch = sp.ten
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());
      return matchLoai && matchSearch;
    })
    .sort((a, b) => {
      if (sortOrder === "asc") return a.gia - b.gia;
      if (sortOrder === "desc") return b.gia - a.gia;
      return 0;
    });

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${pizzaBgImage})` }}
      >
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-lg flex flex-col items-center border border-white/50">
          <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-red-600 mb-4"></div>
          <p className="text-lg font-bold text-gray-800">
            Đang tải thực đơn...
          </p>
        </div>
      </div>
    );
  }

  return (
    // --- Wrapper chứa hình nền Pizza ---
    // THAY ĐỔI Ở ĐÂY: Thay 'py-8' thành 'pt-28 pb-10'
    // pt-28: Tạo khoảng cách phía trên để tránh Header che mất nội dung
    // pb-10: Tạo khoảng cách phía dưới chân trang
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed pt-28 pb-10 px-4"
      style={{ backgroundImage: `url(${pizzaBgImage})` }}
    >
      <div className="container mx-auto bg-transparent">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-white mb-10 drop-shadow-[0_3px_3px_rgba(0,0,0,0.9)] flex items-center justify-center gap-3 uppercase tracking-wide">
          <Menu size={40} className="text-white drop-shadow-md" /> Menu
          PizzaCool
        </h1>

        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-10 bg-white/30 backdrop-blur-lg p-6 rounded-3xl border border-white/40 shadow-2xl">
          {/* Ô tìm kiếm */}
          <div className="relative w-full md:w-1/3 group">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 group-focus-within:text-red-600 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm món ăn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/50 bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-gray-800 placeholder-gray-500 transition-all shadow-sm"
            />
          </div>

          <div className="flex w-full md:w-auto gap-4">
            {/* Lọc theo loại */}
            <div className="relative w-1/2 md:w-auto group">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 group-focus-within:text-red-600 transition-colors"
                size={20}
              />
              <select
                value={loaiFilter}
                onChange={(e) => setLoaiFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-3 rounded-xl border border-white/50 bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-gray-800 appearance-none cursor-pointer transition-all shadow-sm"
              >
                <option value="tatca">Tất cả món</option>
                <option value="pizza">Pizza</option>
                <option value="ga">Gà rán</option>
                <option value="my">Mỳ Ý</option>
              </select>
            </div>

            {/* Sắp xếp theo giá */}
            <div className="relative w-1/2 md:w-auto group">
              <ArrowUpDown
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 group-focus-within:text-red-600 transition-colors"
                size={20}
              />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full pl-10 pr-8 py-3 rounded-xl border border-white/50 bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-gray-800 appearance-none cursor-pointer transition-all shadow-sm"
              >
                <option value="none">Sắp xếp giá</option>
                <option value="asc">Thấp đến Cao</option>
                <option value="desc">Cao đến Thấp</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- Thông báo lỗi --- */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-100/90 border border-red-400 text-red-800 px-4 py-3 rounded-xl mb-6 text-center font-bold backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* --- Danh sách sản phẩm --- */}
        {filteredSanPhams.length === 0 ? (
          <div className="text-center py-20 bg-white/20 backdrop-blur-md rounded-3xl border border-white/30 shadow-lg">
            <p className="text-xl font-bold text-white drop-shadow-md">
              Không tìm thấy món nào phù hợp.
            </p>
            <p className="text-white/80">Hãy thử tìm từ khóa khác nhé!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredSanPhams.map((sp) => (
              <ProductCard
                key={sp._id}
                _id={sp._id}
                ten={sp.ten}
                moTa={sp.moTa}
                gia={sp.gia}
                hinhAnh={sp.hinhAnh}
                badge={sp.khuyenMai ? `-${sp.khuyenMai}%` : null}
                actions={
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();

                      if (addingId) return;
                      setAddingId(sp._id);
                      try {
                        await addToCart(
                          {
                            _id: sp._id,
                            ten: sp.ten,
                            moTa: sp.moTa,
                            gia: sp.gia,
                            hinhAnh: sp.hinhAnh,
                          },
                          1,
                        );
                        await fetchCart();
                        toast.success(`✅ Đã thêm "${sp.ten}" vào giỏ hàng`);
                      } catch (err) {
                        console.error(err);
                        toast.error("❌ Thêm giỏ hàng thất bại!");
                      } finally {
                        setAddingId(null);
                      }
                    }}
                    disabled={addingId === sp._id}
                    className={`w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors ${
                      addingId === sp._id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {addingId === sp._id ? "Đang thêm..." : "Thêm vào giỏ"}
                  </button>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TrangSanPham;
