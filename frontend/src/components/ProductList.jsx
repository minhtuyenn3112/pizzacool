import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import axios from "axios";
import { Link } from "react-router-dom";

// --- IMPORT HÌNH NỀN ---
import pizzaBgImage from "../images/menu.jpg";
// -----------------------

// --- Cấu hình API Backend ---
const API_BASE_URL = "http://localhost:5000/api/sanpham";
const productTypes = [
  { key: "pizza", label: "Pizza" },
  { key: "my", label: "Mì Ý" },
  { key: "ga", label: "Gà & Món Phụ" },
];

// --- Component Chính: ProductList ---
function ProductList() {
  const [sanPhams, setSanPhams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pizza");

  const fetchProducts = async (tab) => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = `${API_BASE_URL}?loai=${tab}`;
      const response = await axios.get(apiUrl);
      setSanPhams(response.data);
    } catch (err) {
      if (err.response) {
        console.error("Lỗi từ server:", err.response.data);
      } else {
        console.error("Lỗi request:", err.message);
      }
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(activeTab);
  }, [activeTab]);

  // --- Giao diện Tải dữ liệu / Lỗi (Glassmorphism) ---
  if (loading) {
    return (
      <div
        className="flex flex-col justify-center items-center h-screen bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${pizzaBgImage})` }}
      >
        <div className="bg-white/60 backdrop-blur-md p-8 rounded-2xl shadow-lg flex flex-col items-center border border-white/50">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-red-600"></div>
          <p className="mt-4 text-lg font-bold text-gray-800">
            Đang tải menu...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col justify-center items-center h-screen bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${pizzaBgImage})` }}
      >
        <div className="text-center py-10 px-6 text-red-700 bg-red-100/90 backdrop-blur-md rounded-2xl border border-red-200 shadow-xl max-w-md font-bold">
          {error}
        </div>
      </div>
    );
  }

  // --- Giao diện Chính (Glassmorphism) ---
  return (
    // --- Wrapper chứa hình nền Pizza ---
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed py-12"
      style={{ backgroundImage: `url(${pizzaBgImage})` }}
    >
      {/* --- Container Trong Suốt --- */}
      <div className="container mx-auto px-4 bg-transparent">
        {/* Thanh Tabs */}
        <div className="flex justify-center border-b border-white/40 mb-10 backdrop-blur-sm bg-white/20 p-2 rounded-2xl shadow-sm">
          {productTypes.map((type) => (
            <button
              key={type.key}
              onClick={() => setActiveTab(type.key)}
              className={`py-3 px-6 text-lg font-bold transition-all duration-300 rounded-xl ${
                activeTab === type.key
                  ? "bg-white/90 text-red-600 shadow-md"
                  : "text-white hover:text-red-600 hover:bg-white/40"
              } focus:outline-none`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Danh sách sản phẩm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {sanPhams.length > 0 ? (
            sanPhams.map((sp) => (
              <ProductCard
                key={sp._id}
                _id={sp._id}
                ten={sp.ten}
                moTa={sp.moTa}
                gia={sp.gia}
                hinhAnh={sp.hinhAnh}
                loai={sp.loai}
                // Thêm class để làm trong suốt thẻ Card nếu cần
                // className="bg-white/70 backdrop-blur-md border border-white/50 ..."
              />
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-white/30 backdrop-blur-md rounded-3xl border border-white/40 shadow-lg">
              <p className="text-xl font-bold text-white drop-shadow-md">
                Không có sản phẩm nào để hiển thị trong mục này.
              </p>
              <p className="text-white/80 mt-2">Hãy thử chọn mục khác nhé!</p>
            </div>
          )}
        </div>

        {/* Nút Xem Thêm */}
        <div className="text-center mt-12">
          <Link
            to="/menu"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl text-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-95 border border-white/20"
          >
            Xem Thêm
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductList;
