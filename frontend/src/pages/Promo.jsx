// src/pages/Promo.jsx
import React, { useEffect, useState } from "react";
import maGiamGiaApi from "../api/maGiamGiaApi.js";
import { Ticket, Clock, Copy, CheckCircle, Tag } from "lucide-react";
import { toast } from "react-hot-toast";

// --- IMPORT HÌNH NỀN ---
import pizzaBgImage from "../images/giamgia.jpg";
// -----------------------

export default function Promo() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    maGiamGiaApi
      .getAllPromos()
      .then((data) => {
        setPromos(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Lỗi tải mã giảm giá:", err);
        setError(err.message || "Lỗi tải dữ liệu");
        setPromos([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã: ${code}`);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${pizzaBgImage})` }}
      >
        {/* Loading cũng bỏ blur, làm trong suốt */}
        <div className="bg-white/20 px-8 py-4 rounded-2xl shadow border border-white/30">
          <p className="text-gray-900 font-bold animate-pulse text-lg">
            Đang tải ưu đãi...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed py-12 px-4"
      style={{ backgroundImage: `url(${pizzaBgImage})` }}
    >
      {/*
          Container chính:
          - Bỏ backdrop-blur-lg
          - bg-white/30 -> bg-white/10 (Rất trong suốt)
          - Giảm shadow
      */}
      <div className="max-w-5xl mx-auto p-8 bg-white/10 border border-white/30 rounded-[2rem] shadow-xl">
        <h1 className="text-4xl font-extrabold mb-8 text-red-700 flex items-center gap-3 drop-shadow-sm border-b border-white/30 pb-4">
          <Ticket size={40} className="text-red-600" /> Kho Voucher & Ưu Đãi
        </h1>

        {error && (
          <div className="bg-red-100/90 text-red-700 p-4 rounded-xl border border-red-200 mb-6">
            Lỗi: {error}
          </div>
        )}

        {!error && (
          <>
            {promos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {promos.map((p) => (
                  <div
                    key={p._id}
                    // --- Card dạng trong suốt (Clear Glass) ---
                    // - Bỏ backdrop-blur-md
                    // - bg-white/70 -> bg-white/20 (Trong suốt hơn nhiều)
                    // - hover:bg-white/90 -> hover:bg-white/40 (Hover chỉ sáng lên nhẹ)
                    className="relative group bg-white/20 border border-white/40 rounded-2xl p-6 shadow-md hover:shadow-xl hover:bg-white/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    {/* Background decoration (hình tròn trang trí cũng làm mờ đi) */}
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-red-500/5 blur-xl group-hover:bg-red-500/10 transition"></div>

                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        {/* Tăng độ đậm của chữ để dễ đọc trên nền trong suốt */}
                        <h3 className="font-extrabold text-xl text-gray-900 flex items-center gap-2 drop-shadow-sm">
                          <Tag size={18} className="text-red-600" /> {p.tenMa}
                        </h3>
                        <div
                          // Nút mã code cũng trong suốt hơn
                          className="mt-2 inline-flex items-center gap-2 bg-red-50/50 border border-red-200/60 text-red-700 px-3 py-1 rounded-lg cursor-pointer hover:bg-red-100/70 transition shadow-sm"
                          onClick={() => handleCopyCode(p.maCode)}
                          title="Nhấn để sao chép"
                        >
                          <span className="font-mono font-bold text-lg tracking-wide">
                            {p.maCode}
                          </span>
                          <Copy size={14} />
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-3xl font-extrabold text-red-600 drop-shadow-sm">
                          -{p.giaTriGiam.toLocaleString()}đ
                        </div>
                        <span className="text-xs text-gray-700 font-bold bg-white/40 px-2 py-1 rounded-md border border-white/40">
                          Voucher giảm giá
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-800 mb-4 text-sm font-semibold line-clamp-2 drop-shadow-sm">
                      {p.Mota || "Áp dụng cho các đơn hàng thỏa mãn điều kiện."}
                    </p>

                    {/* Điều kiện - Khung trong suốt bên trong */}
                    {/* bg-white/50 -> bg-white/20 */}
                    <div className="bg-white/20 border border-white/40 rounded-xl p-3 text-sm text-gray-900 space-y-2 shadow-sm font-medium">
                      {p.dieuKienToiThieu > 0 && (
                        <p className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-green-700" />
                          Đơn tối thiểu:{" "}
                          <b className="text-black">
                            {p.dieuKienToiThieu.toLocaleString()}đ
                          </b>
                        </p>
                      )}

                      {p.soLuotSuDung > 0 ? (
                        <div className="flex justify-between items-center">
                          <p className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-blue-700" />
                            Còn lại:{" "}
                            <b>
                              {p.soLuotSuDung - (p.soLuotDaSuDung || 0)}
                            </b>{" "}
                            lượt
                          </p>
                          {/* Thanh progress bar */}
                          <div className="w-20 h-1.5 bg-white/40 rounded-full overflow-hidden border border-white/20">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{
                                width: `${Math.min(
                                  ((p.soLuotDaSuDung || 0) / p.soLuotSuDung) *
                                    100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        p.soLuotSuDung === -1 && (
                          <p className="flex items-center gap-2 text-green-800 font-bold">
                            <CheckCircle size={14} /> Không giới hạn lượt dùng
                          </p>
                        )
                      )}
                    </div>

                    {/* Hạn sử dụng */}
                    {(p.ngayBatDau || p.ngayKetThuc) && (
                      <div className="mt-4 pt-3 border-t border-white/30 flex items-center justify-between text-xs text-gray-700 font-bold">
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-orange-600" />
                          <span>Thời gian hiệu lực:</span>
                        </div>
                        <div className="text-right">
                          {p.ngayBatDau && (
                            <span>
                              {new Date(p.ngayBatDau).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                          )}
                          {p.ngayBatDau && p.ngayKetThuc && <span> - </span>}
                          {p.ngayKetThuc && (
                            <span className="text-red-600 font-extrabold">
                              {new Date(p.ngayKetThuc).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // State trống cũng làm trong suốt
              <div className="text-center py-16 bg-white/10 rounded-3xl border border-white/30 shadow-sm">
                <Ticket
                  size={64}
                  className="text-gray-200 mx-auto mb-4 opacity-80"
                />
                <p className="text-xl font-bold text-gray-100 drop-shadow-md">
                  Hiện chưa có mã giảm giá nào
                </p>
                <p className="text-gray-200 drop-shadow-sm">
                  Hãy quay lại sau nhé!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
