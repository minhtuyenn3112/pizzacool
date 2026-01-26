import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

// --- IMPORT HÌNH NỀN ---
import pizzaBgImage from "../images/anh.jpg";
// -----------------------

const formatCurrency = (price) => {
  if (typeof price !== "number" && typeof price !== "string") return "N/A";
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numericPrice);
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [related, setRelated] = useState([]);
  const [relLoading, setRelLoading] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");

  // Helper: compute average rating and render star UI
  const getAverageRating = () => {
    if (ratings && ratings.length) {
      return (
        ratings.reduce((s, r) => s + (r.diemDanhGia || 0), 0) / ratings.length
      );
    }
    return product && product.danhGia ? Number(product.danhGia) : 0;
  };

  const renderStars = (value) => {
    const v = Number(value) || 0;
    const rounded = Math.round(v);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`inline-block text-xl leading-none mr-0.5 ${
            i <= rounded ? "text-yellow-400" : "text-gray-300/70"
          }`}
          aria-hidden
        >
          ★
        </span>
      );
    }
    return <span className="inline-flex items-center">{stars}</span>;
  };

  const { addToCart, fetchCart } = useCart();
  const { user, token } = useAuth();

  useEffect(() => {
    if (!id) {
      setError("Không xác định sản phẩm.");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`http://localhost:5000/api/sanpham/${id}`);
        setProduct(res.data);

        if (Array.isArray(res.data.hinhAnh) && res.data.hinhAnh.length) {
          setMainImage(res.data.hinhAnh[0]);
        } else if (res.data.hinhAnh) {
          setMainImage(res.data.hinhAnh);
        } else {
          setMainImage(null);
        }

        if (res.data.soLuong !== undefined && res.data.soLuong > 0) {
          setQty((q) => Math.min(q, res.data.soLuong));
        }
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message || "Không thể tải thông tin sản phẩm."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;

    const fetchRelated = async () => {
      setRelLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/sanpham/related/${product._id}`
        );
        setRelated(res.data || []);
      } catch (err) {
        console.warn("Không lấy được sản phẩm liên quan:", err.message);
        setRelated([]);
      } finally {
        setRelLoading(false);
      }
    };

    fetchRelated();
  }, [product]);

  // Fetch ratings for this product
  useEffect(() => {
    if (!product) return;

    const fetchRatings = async () => {
      setRatingLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/danhgia/sanpham/${product._id}`
        );
        setRatings(res.data || []);
      } catch (err) {
        console.warn("Không lấy được đánh giá:", err.message);
        setRatings([]);
      } finally {
        setRatingLoading(false);
      }
    };

    fetchRatings();
  }, [product]);

  const handleAddToCart = async () => {
    if (!product) {
      toast.error("❌ Sản phẩm chưa tải xong");
      return;
    }

    try {
      setAdding(true);
      await addToCart(product, qty);
      await fetchCart();
      toast.success(`✅ Đã thêm ${qty} "${product.ten}" vào giỏ`);
    } catch (err) {
      console.error(err);
      toast.error("❌ Thêm vào giỏ thất bại");
    } finally {
      setAdding(false);
    }
  };

  const totalPrice = product ? Number(product.gia || 0) * Number(qty || 1) : 0;

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${pizzaBgImage})` }}
      >
        <div className="text-center bg-white/60 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/50">
          <div className="animate-pulse h-6 w-48 bg-slate-200/70 rounded mb-3 mx-auto" />
          <div className="animate-pulse h-40 w-80 bg-slate-200/70 rounded mx-auto" />
          <p className="mt-4 text-gray-700 font-bold">
            Đang tải chi tiết sản phẩm...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed p-6"
        style={{ backgroundImage: `url(${pizzaBgImage})` }}
      >
        <div className="text-center bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-red-200">
          <p className="text-red-600 font-bold text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-md"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed p-6"
        style={{ backgroundImage: `url(${pizzaBgImage})` }}
      >
        <div className="text-center bg-white/60 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/50">
          <p className="text-gray-800 font-bold text-lg">
            Không tìm thấy sản phẩm.
          </p>
          <Link
            to="/"
            className="text-indigo-600 font-bold underline mt-4 inline-block hover:text-indigo-800"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const images = Array.isArray(product.hinhAnh)
    ? product.hinhAnh
    : product.hinhAnh
    ? [product.hinhAnh]
    : [];

  return (
    // --- Wrapper chứa hình nền Pizza (Đã thêm pt-24 để tránh Header) ---
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed pt-24 pb-10 px-4"
      style={{ backgroundImage: `url(${pizzaBgImage})` }}
    >
      {/* --- Container Trong Suốt --- */}
      <div className="max-w-6xl mx-auto bg-transparent">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm text-white hover:text-yellow-300 transition-colors font-bold drop-shadow-md bg-black/30 px-3 py-2 rounded-full backdrop-blur-sm hover:bg-black/50"
        >
          ← Quay lại
        </button>

        {/* KHỐI CHI TIẾT SẢN PHẨM (Glassmorphism) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white/50 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/40">
          {/* Left: gallery */}
          <div>
            <div className="w-full rounded-2xl overflow-hidden border-2 border-white/60 shadow-lg">
              <img
                src={
                  mainImage ||
                  "https://via.placeholder.com/800x600.png?text=No+Image+Available"
                }
                alt={product.ten}
                className="w-full h-[480px] object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/800x600.png?text=No+Image";
                }}
              />
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`flex-none w-24 h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-sm hover:shadow-md ${
                      mainImage === img
                        ? "ring-4 ring-red-500/50 border-red-500 scale-105"
                        : "border-white/50 hover:border-red-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`thumb-${idx}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/160x120.png?text=No+Image";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: details */}
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                {product.badge && (
                  <div className="inline-block px-3 py-1 bg-gradient-to-r from-rose-600 to-orange-500 text-white rounded-full text-xs font-extrabold uppercase shadow-md">
                    {product.badge}
                  </div>
                )}
                <h1 className="text-4xl font-extrabold text-gray-900 mt-4 drop-shadow-sm">
                  {product.ten}
                </h1>
                <p className="text-base text-gray-800 mt-3 font-medium leading-relaxed">
                  {product.moTa}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  {ratingLoading ? (
                    <div className="text-sm text-gray-600 font-semibold">
                      Đang tải đánh giá...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-white/30 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/40 shadow-sm">
                      {renderStars(getAverageRating())}
                      <div className="text-sm text-gray-800 font-bold">
                        {getAverageRating()
                          ? getAverageRating().toFixed(1)
                          : "-"}{" "}
                        / 5
                        <span className="text-xs text-gray-600 ml-2 font-semibold">
                          ({ratings.length} đánh giá)
                        </span>
                      </div>
                    </div>
                  )}
                  {product.soLuong !== undefined && (
                    <div
                      className={`text-sm font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm border shadow-sm ${
                        product.soLuong > 0
                          ? "text-green-700 bg-green-100/50 border-green-200"
                          : "text-red-700 bg-red-100/50 border-red-200"
                      }`}
                    >
                      {product.soLuong > 0
                        ? `Còn ${product.soLuong}`
                        : "Hết hàng"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Price card */}
            <div className="mt-8 p-6 rounded-2xl border border-white/50 bg-white/40 backdrop-blur-sm shadow-lg">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <div className="text-3xl font-black text-red-600 drop-shadow-sm">
                    {formatCurrency(product.gia)}
                  </div>
                  {product.giaCu && (
                    <div className="text-sm line-through text-gray-500 font-semibold mt-1">
                      {formatCurrency(product.giaCu)}
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-700 text-right font-semibold">
                  <div>Giá / 1 sản phẩm</div>
                  <div className="mt-1 font-extrabold text-gray-900">
                    {formatCurrency(product.gia)}
                  </div>
                </div>
              </div>

              {/* quantity & total */}
              <div className="mt-6 flex items-center justify-between gap-4 bg-white/30 p-4 rounded-xl backdrop-blur-sm border border-white/40">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setQty((q) => {
                        const next = Math.max(1, q - 1);
                        return product.soLuong !== undefined
                          ? Math.min(next, product.soLuong)
                          : next;
                      })
                    }
                    className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-white/60 bg-white/50 text-red-600 font-bold text-xl hover:bg-red-100 transition-colors shadow-sm"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => {
                      const v = Number(e.target.value || 1);
                      if (isNaN(v)) return;
                      const clamped = Math.max(1, v);
                      if (product.soLuong !== undefined) {
                        setQty(Math.min(clamped, product.soLuong));
                      } else {
                        setQty(clamped);
                      }
                    }}
                    className="w-16 text-center rounded-lg border-2 border-white/60 bg-white/50 px-2 py-2 font-extrabold text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    min={1}
                  />
                  <button
                    onClick={() =>
                      setQty((q) => {
                        const next = q + 1;
                        return product.soLuong !== undefined
                          ? Math.min(next, product.soLuong)
                          : next;
                      })
                    }
                    className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-white/60 bg-white/50 text-red-600 font-bold text-xl hover:bg-red-100 transition-colors shadow-sm"
                  >
                    +
                  </button>
                  <div className="ml-4 text-sm text-gray-700 font-bold">
                    Số lượng
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-600 font-bold uppercase">
                    Tổng cộng
                  </div>
                  <div className="text-2xl font-black text-red-600 mt-1 drop-shadow-sm">
                    {formatCurrency(totalPrice)}
                  </div>
                  {product.giaCu && (
                    <div className="text-xs text-gray-500 line-through font-semibold">
                      {formatCurrency(Number(product.giaCu || 0) * qty)}
                    </div>
                  )}
                </div>
              </div>

              {/* actions */}
              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={
                    adding ||
                    (product.soLuong !== undefined && product.soLuong === 0)
                  }
                  className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-extrabold text-lg shadow-xl hover:shadow-red-500/40 hover:from-red-700 hover:to-orange-700 disabled:opacity-60 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 border-2 border-white/20"
                >
                  {adding ? (
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
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
                    <>Thêm vào giỏ hàng</>
                  )}
                </button>

                <button
                  onClick={() => navigate("/cart")}
                  className="px-6 py-4 rounded-2xl border-2 border-white/60 bg-white/40 text-gray-800 font-bold text-lg hover:bg-white/70 hover:text-red-600 transition-all shadow-md hover:shadow-lg backdrop-blur-sm"
                >
                  Xem giỏ
                </button>
              </div>
            </div>

            {/* Full description */}
            {product.moTaChiTiet && (
              <div className="mt-8 border-t border-white/40 pt-6 text-sm text-gray-800 bg-white/30 p-6 rounded-2xl backdrop-blur-sm shadow-inner">
                <h3 className="font-extrabold mb-4 text-xl text-gray-900">
                  Mô tả chi tiết
                </h3>
                <div className="prose max-w-none font-medium leading-relaxed">
                  {typeof product.moTaChiTiet === "string" ? (
                    <p>{product.moTaChiTiet}</p>
                  ) : (
                    <pre className="whitespace-pre-wrap bg-white/50 p-4 rounded-xl border border-white/40">
                      {JSON.stringify(product.moTaChiTiet, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KHỐI ĐÁNH GIÁ (Glassmorphism) */}
      <div className="max-w-6xl mx-auto mt-10 bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/40">
        <h3 className="text-2xl font-extrabold mb-6 text-gray-900 drop-shadow-sm">
          Đánh giá & Nhận xét
        </h3>

        {/* Submit rating (only for logged-in users) */}
        {user ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const body = {
                  sanPham: product._id,
                  nguoiDung: user._id,
                  diemDanhGia: Number(userRating),
                  nhanXet: userComment,
                };
                const headers = token
                  ? { Authorization: `Bearer ${token}` }
                  : {};
                await axios.post("http://localhost:5000/api/danhgia", body, {
                  headers,
                });
                toast.success("Cảm ơn bạn đã đánh giá!");
                // refresh ratings
                const res = await axios.get(
                  `http://localhost:5000/api/danhgia/sanpham/${product._id}`
                );
                setRatings(res.data || []);
                setUserComment("");
                setUserRating(5);
              } catch (err) {
                console.error(err);
                toast.error(
                  err.response?.data?.message || "Gửi đánh giá thất bại"
                );
              }
            }}
            className="mb-8 bg-white/40 p-6 rounded-2xl backdrop-blur-sm border border-white/50 shadow-md"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="text-base font-bold text-gray-800">
                Chọn điểm:
              </div>
              <div className="flex items-center gap-1 bg-white/50 px-3 py-1 rounded-full border border-white/40 shadow-inner">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setUserRating(s)}
                    className={`text-3xl leading-none transition-transform hover:scale-125 ${
                      userRating >= s
                        ? "text-yellow-400 drop-shadow-sm"
                        : "text-gray-300/70 hover:text-yellow-200"
                    }`}
                    aria-label={`Đánh ${s} sao`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Viết nhận xét của bạn (tùy chọn)"
                className="w-full px-4 py-3 border-2 border-white/60 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-800 placeholder-gray-500 transition-all shadow-sm"
                rows={3}
              />
            </div>
            <div className="text-right">
              <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-blue-600 transition-all transform hover:scale-[1.02] active:scale-95 border border-white/20">
                Gửi đánh giá
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-8 text-base text-gray-700 font-bold bg-white/40 p-4 rounded-xl text-center border border-white/50 shadow-sm">
            Vui lòng{" "}
            <Link
              to="/login"
              className="text-indigo-600 underline hover:text-indigo-800"
            >
              đăng nhập
            </Link>{" "}
            để đánh giá sản phẩm.
          </div>
        )}

        {/* List of ratings */}
        {ratingLoading ? (
          <div className="text-base text-gray-600 font-semibold text-center py-6 bg-white/40 rounded-xl border border-white/50">
            Đang tải đánh giá...
          </div>
        ) : ratings.length === 0 ? (
          <div className="text-base text-gray-700 font-bold text-center py-8 bg-white/40 rounded-xl border border-white/50 shadow-inner">
            Chưa có đánh giá nào. Hãy là người đầu tiên!
          </div>
        ) : (
          <div className="space-y-6">
            {ratings.map((r) => (
              <div
                key={r._id}
                className="border border-white/50 rounded-2xl p-6 bg-white/40 backdrop-blur-sm shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="font-extrabold text-lg text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-blue-400 flex items-center justify-center text-white shadow-sm">
                      {(r.nguoiDung?.hoTen || "U").charAt(0).toUpperCase()}
                    </div>
                    {r.nguoiDung?.hoTen || "Người dùng"}
                  </div>
                  <div className="text-sm text-gray-600 font-semibold bg-white/50 px-2 py-1 rounded-lg border border-white/30">
                    {new Date(r.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm mb-3 flex items-center gap-2 bg-white/30 w-fit px-3 py-1.5 rounded-lg border border-white/30 shadow-sm">
                  {renderStars(r.diemDanhGia)}
                  <span className="text-gray-800 font-bold">
                    {r.diemDanhGia} / 5
                  </span>
                </div>
                {r.nhanXet && (
                  <div className="text-base text-gray-800 font-medium bg-white/50 p-4 rounded-xl border border-white/40 leading-relaxed shadow-inner">
                    "{r.nhanXet}"
                  </div>
                )}

                {r.phanHoi && (
                  <div className="mt-4 p-4 bg-indigo-50/70 border-l-4 border-indigo-500 rounded-xl backdrop-blur-sm shadow-sm">
                    <div className="text-sm font-extrabold text-indigo-700 flex items-center gap-2">
                      <span className="text-xl">💬</span> Phản hồi từ Admin
                    </div>
                    <div className="text-base text-gray-800 mt-2 font-medium leading-relaxed">
                      {r.phanHoi}
                    </div>
                    {r.phanHoiAt && (
                      <div className="text-xs text-gray-500 mt-2 font-semibold text-right">
                        {new Date(r.phanHoiAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* KHỐI SẢN PHẨM LIÊN QUAN (Glassmorphism) */}
      <div className="max-w-6xl mx-auto mt-12 bg-white/20 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/10 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-extrabold text-gray-900 drop-shadow-sm">
            Sản phẩm liên quan
          </h3>
          <Link
            to="/menu"
            className="text-base text-indigo-600 font-bold hover:underline hover:text-indigo-800 bg-white/50 px-3 py-1.5 rounded-lg border border-white/40 shadow-sm"
          >
            Xem tất cả
          </Link>
        </div>

        {relLoading ? (
          <div className="flex gap-6 overflow-hidden pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="min-w-[240px] bg-white/40 rounded-2xl shadow-md p-4 flex-none border border-white/50 animate-pulse"
              >
                <div className="h-40 bg-slate-200/70 rounded-xl mb-3" />
                <div className="h-6 bg-slate-200/70 rounded w-3/4 mb-2" />
                <div className="h-5 bg-slate-200/70 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : related.length === 0 ? (
          <div className="text-base text-gray-700 font-bold text-center py-8 bg-white/40 rounded-xl border border-white/50 shadow-inner">
            Chưa có sản phẩm liên quan.
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-red-500/50 scrollbar-track-white/30">
            {related.map((p) => (
              <div
                key={p._id || p.id}
                className="min-w-[240px] bg-white/60 rounded-2xl shadow-lg p-4 flex-none border border-white/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer backdrop-blur-sm"
                onClick={() => navigate(`/product/${p._id || p.id}`)}
              >
                <div className="h-40 rounded-xl overflow-hidden border-2 border-white/60 shadow-sm group-hover:border-red-300 transition-colors">
                  <img
                    src={Array.isArray(p.hinhAnh) ? p.hinhAnh[0] : p.hinhAnh}
                    alt={p.ten}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/320x240.png?text=No+Image";
                    }}
                  />
                </div>
                <div className="mt-4">
                  <div className="font-bold text-base line-clamp-2 text-gray-900 group-hover:text-red-600 transition-colors">
                    {p.ten}
                  </div>
                  <div className="text-lg text-red-600 font-black mt-2 drop-shadow-sm">
                    {formatCurrency(p.gia)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
