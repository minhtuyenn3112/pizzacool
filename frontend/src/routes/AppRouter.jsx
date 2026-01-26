import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Menu from "../pages/Menu";
import Promo from "../pages/Promo";
import Register from "../pages/Register";
import Login from "../pages/Login";
import ProductDetailPage from "../pages/ProductDetailPage";
import ProfilePage from "../pages/ProfilePage";
import CartPage from "../pages/Cart";
import CheckoutPage from "../pages/Checkout";
import ThanhToanPage from "../pages/ThanhToanPage";
import OrderHistoryPage from "../pages/OrderHistoryPage";
import OrderDetailPage from "../pages/OrderDetailPage";
import About from "../pages/About";

import ScrollToTop from "../components/ScrollToTop";

import PrivateRoute from "../components/PrivateRoute";
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";
import Dashboard from "../pages/admin/Dashboard";
import UserManager from "../pages/admin/UserManager";
import OrderManager from "../pages/admin/OrderManager";
import ProductManager from "../pages/admin/ProductManager";
import RatingManager from "../pages/admin/RatingManager";
import DiscountManager from "../pages/admin/DiscountManager";

function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ================== USER LAYOUT ================== */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/promo" element={<Promo />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/about" element={<About />} />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <PrivateRoute>
                <CartPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <PrivateRoute>
                <CheckoutPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/donhang/vnpay-return"
            element={
              <PrivateRoute>
                <ThanhToanPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders-history"
            element={
              <PrivateRoute>
                <OrderHistoryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <PrivateRoute>
                <OrderDetailPage />
              </PrivateRoute>
            }
          />
        </Route>

        {/* ================== ADMIN LAYOUT ================== */}
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={["quan_tri"]}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UserManager />} />
          <Route path="orders" element={<OrderManager />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="reviews" element={<RatingManager />} />
          <Route path="discounts" element={<DiscountManager />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
