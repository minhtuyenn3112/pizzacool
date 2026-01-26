// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { token, loading: authLoading } = useAuth();
  const [cart, setCart] = useState({ items: [], tongTien: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy giỏ hàng
  const fetchCart = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/giohang", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data || { items: [], tongTien: 0 });
    } catch (err) {
      console.error("Lỗi fetchCart:", err.response?.data || err);
      setCart({ items: [], tongTien: 0 });
      setError(err.response?.data?.message || "Lỗi lấy giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (product, soLuong = 1) => {
    if (!token) return Promise.reject("Chưa đăng nhập");

    const { _id: sanPham, ten, gia, hinhAnh } = product;

    if (!sanPham || !ten || !gia)
      return Promise.reject("Sản phẩm không hợp lệ");

    try {
      // Gọi API thêm vào giỏ
      const res = await axios.post(
        "http://localhost:5000/api/giohang/add",
        { sanPham, ten, gia, hinhAnh, soLuong },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Backend sẽ tự kiểm tra nếu sản phẩm đã tồn tại → cộng dồn
      setCart(res.data);
      return res.data;
    } catch (err) {
      console.error("Lỗi addToCart:", err.response?.data || err);
      throw err;
    }
  };

  // frontend context/CartContext.jsx
  const updateCartItem = async (item, soLuong) => {
    if (!token) return Promise.reject("Chưa đăng nhập");

    try {
      const res = await axios.put(
        "http://localhost:5000/api/giohang/update",
        {
          itemId: item._id, // dùng _id của item trong cart
          soLuong,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data);
      return res.data;
    } catch (err) {
      console.error("Lỗi updateCartItem:", err.response?.data || err);
      throw err;
    }
  };

  // Xóa từng sản phẩm
  const removeCartItem = async (productId) => {
    if (!token) return Promise.reject("Chưa đăng nhập");
    if (!productId) return Promise.reject("Sản phẩm không hợp lệ");

    try {
      const res = await axios.delete(
        "http://localhost:5000/api/giohang/remove",
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { sanPham: productId }, // DELETE cần body cho từng sản phẩm
        }
      );
      setCart(res.data);
      return res.data;
    } catch (err) {
      console.error("Lỗi removeCartItem:", err.response?.data || err);
      throw err;
    }
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    if (!token) return;
    try {
      await axios.delete("http://localhost:5000/api/giohang/clear", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart({ items: [], tongTien: 0 });
    } catch (err) {
      console.error("Lỗi clearCart:", err.response?.data || err);
    }
  };

  useEffect(() => {
    if (!authLoading && token) fetchCart();
  }, [authLoading, token]);

  const cartCount =
    cart.items?.reduce((sum, item) => sum + item.soLuong, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        fetchCart,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        cartCount,
      }}
    >
      {!authLoading && children}
    </CartContext.Provider>
  );
};
