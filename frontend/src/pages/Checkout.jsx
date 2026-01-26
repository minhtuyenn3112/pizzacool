import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  User,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  Loader,
  Ticket,
} from "lucide-react";

const CheckoutPage = () => {
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // ------------------- CHECK IF "PAY AGAIN" -------------------
  const orderState = location.state; // { orderId, items, totalPrice, discount, shippingInfo }

  // ------------------- FORM STATE -------------------
  const [formData, setFormData] = useState({
    name: orderState?.shippingInfo?.name || "",
    phone: orderState?.shippingInfo?.phone || "",
    address: orderState?.shippingInfo?.address || "",
  });
  const [errors, setErrors] = useState({});

  // ------------------- PAYMENT -------------------
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);

  // ------------------- VOUCHER -------------------
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(
    orderState?.discount || 0,
  );
  const [voucherInfo, setVoucherInfo] = useState(null);

  // ------------------- CART OR ORDER ITEMS -------------------
  const itemsToShow = orderState?.items || cart.items || [];
  const totalToShow = orderState?.totalPrice || cart.tongTien || 0;
  const finalTotal = Math.max(0, totalToShow - appliedDiscount);

  // ------------------- FETCH USER PROFILE IF NO ORDER -------------------
  useEffect(() => {
    if (!orderState) {
      const fetchUserProfile = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;
          const { data } = await axios.get(
            "http://localhost:5000/api/users/profile",
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (data) {
            setFormData({
              name: data.name || "",
              phone: data.phone || "",
              address: data.address || "",
            });
          }
        } catch (err) {
          console.error("Lỗi lấy thông tin user:", err);
        }
      };
      fetchUserProfile();
    }
  }, [orderState]);

  // ------------------- VALIDATE FORM -------------------
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập họ tên";
    if (!/^[0-9]{10,11}$/.test(formData.phone))
      newErrors.phone = "Số điện thoại không hợp lệ";
    if (formData.address.trim().length < 5)
      newErrors.address = "Vui lòng nhập địa chỉ cụ thể";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  // ------------------- VOUCHER -------------------
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/magiamgia/apply",
        {
          ma: voucherCode,
          tongTien: totalToShow,
        },
      );
      if (data.success) {
        setAppliedDiscount(data.discountAmount);
        setVoucherInfo(data.thongTinMa);
        Swal.fire({
          icon: "success",
          title: "Áp dụng thành công!",
          text: `Giảm ${data.discountAmount.toLocaleString()}đ`,
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        setAppliedDiscount(0);
        setVoucherInfo(null);
        Swal.fire({ icon: "error", title: data.message });
      }
    } catch (err) {
      setAppliedDiscount(0);
      setVoucherInfo(null);
      Swal.fire({
        icon: "error",
        title: err.response?.data?.message || "Mã không hợp lệ",
      });
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode("");
    setAppliedDiscount(0);
    setVoucherInfo(null);
  };

  // ------------------- PLACE ORDER -------------------
  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      Swal.fire({
        icon: "warning",
        title: "Vui lòng kiểm tra lại thông tin giao hàng",
      });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:5000/api/donhang",
        {
          paymentMethod,
          voucherCode: voucherInfo?.maCode || null,
          shippingInfo: formData,
          orderId: orderState?.orderId || null, // nếu thanh toán lại, gửi orderId để backend xử lý
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (paymentMethod === "COD") {
        Swal.fire({ icon: "success", title: "Đặt hàng thành công!" }).then(
          () => {
            navigate(`/don-hang/${data.order._id}`);
          },
        );
      }

      if (paymentMethod === "VNPAY" && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Lỗi",
        err.response?.data?.message || "Có lỗi khi tạo đơn hàng",
        "error",
      );
    } finally {
      if (paymentMethod !== "VNPAY") setLoading(false);
    }
  };

  if (!itemsToShow.length)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500 bg-white m-4 rounded-xl shadow-sm">
        <p className="text-2xl font-bold mb-4">Giỏ hàng của bạn đang trống</p>
        <button
          onClick={() => navigate("/products")}
          className="bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    );

  // ------------------- RENDER -------------------
  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-10 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-8 uppercase tracking-wide">
          Thanh toán
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: FORM & PAYMENT */}
          <div className="lg:col-span-7 space-y-6">
            {/* Shipping Info */}
            <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <div className="bg-black p-2 rounded-full text-white">
                  <User size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Thông tin nhận hàng
                </h2>
              </div>
              <div className="space-y-5">
                <InputField
                  label="Họ và tên"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  icon={<User size={18} />}
                  error={errors.name}
                  placeholder="Nguyễn Văn A"
                />
                <InputField
                  label="Số điện thoại"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  icon={<Phone size={18} />}
                  error={errors.phone}
                  placeholder="0912345678"
                />
                <InputField
                  label="Địa chỉ nhận hàng"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  icon={<MapPin size={18} />}
                  error={errors.address}
                  placeholder="Số nhà, tên đường, phường/xã..."
                  textarea
                />
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <div className="bg-black p-2 rounded-full text-white">
                  <CreditCard size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Thanh toán</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <PaymentOption
                  label="Thanh toán khi nhận hàng (COD)"
                  description="Bạn chỉ phải thanh toán khi nhận được hàng"
                  icon={<Truck size={24} />}
                  selected={paymentMethod === "COD"}
                  onSelect={() => setPaymentMethod("COD")}
                  color="blue"
                />
                <PaymentOption
                  label="Ví điện tử VNPAY / Ngân hàng"
                  description="Quét mã QR hoặc thẻ ATM nội địa"
                  icon={
                    <img
                      src="https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/ed/d7/99/edd7990b-3a38-48a1-156e-46225abf6657/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/400x400ia-75.webp"
                      alt="VNPAY"
                      className="h-8 w-auto object-contain"
                    />
                  }
                  selected={paymentMethod === "VNPAY"}
                  onSelect={() => setPaymentMethod("VNPAY")}
                  color="blue"
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY */}
          <div className="lg:col-span-5">
            <OrderSummary
              items={itemsToShow}
              voucherCode={voucherCode}
              setVoucherCode={setVoucherCode}
              appliedDiscount={appliedDiscount}
              handleApplyVoucher={handleApplyVoucher}
              handleRemoveVoucher={handleRemoveVoucher}
              finalTotal={finalTotal}
              totalToShow={totalToShow}
              paymentMethod={paymentMethod}
              handlePlaceOrder={handlePlaceOrder}
              loading={loading}
              voucherLoading={voucherLoading}
              voucherInfo={voucherInfo}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------- COMPONENTS -------------------

const InputField = ({
  label,
  name,
  value,
  onChange,
  icon,
  error,
  placeholder,
  textarea,
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-3 top-3.5 text-gray-400">{icon}</div>
      {textarea ? (
        <textarea
          name={name}
          rows={3}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border ${
            error
              ? "border-red-500 bg-red-50"
              : "border-gray-200 focus:border-black"
          } outline-none transition resize-none`}
        />
      ) : (
        <input
          type="text"
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border ${
            error
              ? "border-red-500 bg-red-50"
              : "border-gray-200 focus:border-black"
          } outline-none transition`}
        />
      )}
    </div>
    {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
  </div>
);

const PaymentOption = ({
  label,
  description,
  icon,
  selected,
  onSelect,
  color,
}) => (
  <label
    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
      selected
        ? `border-${color}-500 bg-${color}-50`
        : "border-gray-100 hover:border-gray-300"
    }`}
    onClick={onSelect}
  >
    <input type="radio" className="hidden" checked={selected} readOnly />
    <div
      className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
        selected ? `border-${color}-500` : "border-gray-300"
      }`}
    >
      {selected && (
        <div className={`w-2.5 h-2.5 bg-${color}-500 rounded-full`} />
      )}
    </div>
    <div className="mr-4">{icon}</div>
    <div>
      <p
        className={`font-bold ${
          color === "blue" ? "text-blue-700" : "text-gray-800"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-sm ${
          color === "blue" ? "text-blue-600/70" : "text-gray-500"
        }`}
      >
        {description}
      </p>
    </div>
  </label>
);

const OrderSummary = ({
  items,
  voucherCode,
  setVoucherCode,
  appliedDiscount,
  handleApplyVoucher,
  handleRemoveVoucher,
  finalTotal,
  totalToShow,
  paymentMethod,
  handlePlaceOrder,
  loading,
  voucherLoading,
  voucherInfo,
}) => (
  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-4">
    <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-4 mb-4">
      Đơn hàng ({items.length} sản phẩm)
    </h2>
    <div className="max-h-80 overflow-y-auto pr-2 space-y-4 mb-6 custom-scrollbar">
      {items.map((item) => (
        <div key={item._id} className="flex gap-4">
          <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 shrink-0">
            <img
              src={item.hinhAnh}
              alt={item.ten}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-800 line-clamp-2 text-sm">
              {item.ten}
            </h4>
            <div className="flex justify-between mt-1">
              <span className="text-gray-500 text-sm">x{item.soLuong}</span>
              <span className="font-semibold text-sm">
                {(item.gia * item.soLuong).toLocaleString()}đ
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Voucher */}
    <div className="mb-6">
      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <Ticket size={16} /> Mã giảm giá
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nhập mã voucher"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:border-black outline-none uppercase"
          value={voucherCode}
          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
        />
        <button
          onClick={handleApplyVoucher}
          disabled={voucherLoading || !voucherCode}
          className="bg-gray-900 text-white px-4 rounded-lg text-sm font-medium hover:bg-black disabled:opacity-50"
        >
          {voucherLoading ? "..." : "Áp dụng"}
        </button>
      </div>
      {appliedDiscount > 0 && (
        <div className="mt-2 space-y-2">
          <div className="flex justify-between items-center text-sm bg-green-50 text-green-700 p-2 rounded-lg border border-green-200">
            <span>
              Đã giảm: <b>{appliedDiscount.toLocaleString()}đ</b>
            </span>
            <button
              onClick={handleRemoveVoucher}
              className="text-red-500 hover:underline text-xs"
            >
              Xóa
            </button>
          </div>
          {voucherInfo && voucherInfo.dieuKienToiThieu > 0 && (
            <p className="text-xs text-gray-500 italic">
              💡 Điều kiện: Tối thiểu{" "}
              {voucherInfo.dieuKienToiThieu.toLocaleString()}đ
            </p>
          )}
          {voucherInfo && voucherInfo.soLuotSuDung > 0 && (
            <p className="text-xs text-gray-500 italic">
              ⏱️ Còn {voucherInfo.soLuotSuDung - voucherInfo.soLuotDaSuDung}{" "}
              lượt
            </p>
          )}
        </div>
      )}
    </div>
    <div>
      <p className="text-xs text-gray-500 italic">
        Đơn hàng chỉ được áp dụng 1 Mã Giảm Giá
      </p>
    </div>
    {/* Total */}
    <div className="space-y-3 border-t border-gray-100 pt-4">
      <div className="flex justify-between text-gray-600">
        <span>Tạm tính</span>
        <span>{totalToShow.toLocaleString()}đ</span>
      </div>
      <div className="flex justify-between text-green-600">
        <span>Giảm giá</span>
        <span>-{appliedDiscount.toLocaleString()}đ</span>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-dashed">
        <span className="font-bold text-lg text-gray-800">Tổng cộng</span>
        <span className="font-bold text-2xl text-blue-600">
          {finalTotal.toLocaleString()}đ
        </span>
      </div>
    </div>

    <button
      onClick={handlePlaceOrder}
      disabled={loading}
      className="w-full bg-black text-white py-4 rounded-xl mt-6 text-lg font-bold hover:bg-gray-800 transition shadow-lg flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader className="animate-spin" size={20} /> Đang xử lý...
        </>
      ) : (
        <>
          {paymentMethod === "VNPAY" ? "Thanh toán VNPAY" : "Đặt hàng"}{" "}
          <Truck size={20} />
        </>
      )}
    </button>
  </div>
);

export default CheckoutPage;
