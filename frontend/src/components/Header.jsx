import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaGift, FaUserCircle, FaChevronDown } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import logoImage from "../assets/logo.png";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // State ẩn hiện và cuộn
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // --- Xử lý sự kiện cuộn (Logic cũ) ---
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Đổi màu nền khi không ở đỉnh trang
      setIsScrolled(currentScrollY > 10);

      // Logic ẩn/hiện Header (Smart Navbar)
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false); // Cuộn xuống -> Ẩn
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
      } else {
        setIsVisible(true); // Cuộn lên -> Hiện
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `block md:inline-block px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 ${
      isActive
        ? "bg-white text-red-600 shadow-sm transform scale-105"
        : "text-white hover:bg-white/20 hover:text-white hover:shadow-inner"
    }`;

  const welcomeClass =
    "flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-bold text-white cursor-pointer hover:bg-white/20 transition-all duration-300 border border-transparent hover:border-white/30";

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-500 ease-in-out border-b border-white/20 shadow-lg
      ${
        // Ẩn/Hiện
        isVisible ? "translate-y-0" : "-translate-y-full"
      }
      ${
        // Màu nền: Khi cuộn thì padding=0, chưa cuộn thì padding=1 (nhỏ hơn cũ)
        isScrolled
          ? "bg-gradient-to-r from-red-700/95 to-orange-600/95 backdrop-blur-xl py-0"
          : "bg-gradient-to-r from-red-600/85 to-orange-500/85 backdrop-blur-md py-1"
      }`}
    >
      <div className="container mx-auto px-4">
        {/* --- CHIỀU CAO HEADER (Đã chỉnh nhỏ lại) ---
            - Bình thường (chưa cuộn): h-16 (64px) -> Thay vì h-20 cũ
            - Khi cuộn (isScrolled): h-12 (48px) -> Thay vì h-14 cũ
        */}
        <div
          className={`flex justify-between items-center transition-all duration-500 ease-in-out ${
            isScrolled ? "h-10" : "h-12"
          }`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <img
              src={logoImage}
              alt="PizzaCool Logo"
              // Logo nhỏ hơn: h-10 (40px) xuống h-8 (32px)
              className={`w-auto object-contain drop-shadow-lg transition-all duration-500 ease-in-out group-hover:scale-110 ${
                isScrolled ? "h-8" : "h-10"
              }`}
            />
            <div className="hidden sm:flex flex-col">
              <span
                // Chữ nhỏ hơn: text-2xl xuống text-xl
                className={`ml-auto font-extrabold text-white drop-shadow-md tracking-wide transition-all duration-500 ${
                  isScrolled ? "text-lg" : "text-2xl"
                }`}
              >
                Pizza Cool
              </span>
            </div>
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            <NavLink to="/" className={linkClass}>
              Trang chủ
            </NavLink>
            <NavLink to="/menu" className={linkClass}>
              Menu
            </NavLink>
            <NavLink to="/promo" className={linkClass}>
              <FaGift className="inline text-base mb-0.5 mr-1" /> Ưu đãi
            </NavLink>
            <NavLink to="/cart" className={linkClass}>
              Giỏ hàng
            </NavLink>

            {isAuthenticated ? (
              <>
                {user?.vaiTro === "quan_tri" && (
                  <NavLink to="/admin/dashboard" className={linkClass}>
                    Quản Lý
                  </NavLink>
                )}

                {/* Dropdown User Wrapper */}
                <div
                  className="relative ml-1 h-full flex items-center"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <div className={welcomeClass}>
                    <FaUserCircle className="inline text-lg" />
                    <span>Chào, {user.hoTen.split(" ").pop()}!</span>
                    <FaChevronDown
                      className={`text-[10px] transition-transform duration-300 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute top-full right-0 w-56 pt-1 animate-fadeIn">
                      <div className="bg-white/95 backdrop-blur-xl rounded-lg shadow-2xl py-1 overflow-hidden border border-white/50 text-sm">
                        <div className="px-4 py-2 border-b border-gray-200/50 mb-1">
                          <p className="text-xs text-gray-500 font-semibold">
                            Tài khoản
                          </p>
                          <p className="text-sm font-bold text-gray-800 truncate">
                            {user.email}
                          </p>
                        </div>

                        {user?.vaiTro === "quan_tri" && (
                          <Link
                            to="/admin/dashboard"
                            className="block px-4 py-2 text-red-600 font-bold hover:bg-red-50 transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            ⚙️ Trang Quản Trị
                          </Link>
                        )}

                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Thông tin cá nhân
                        </Link>
                        <Link
                          to="/orders-history"
                          className="block px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Lịch sử mua hàng
                        </Link>
                        <div className="border-t border-gray-200/50 mt-1">
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              handleLogout();
                            }}
                            className="w-full text-left block px-4 py-2 text-red-600 font-bold hover:bg-red-50 transition-colors"
                          >
                            Đăng xuất
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex space-x-2 ml-4">
                <NavLink to="/login" className={linkClass}>
                  Đăng Nhập
                </NavLink>
                <NavLink
                  to="/register"
                  className="bg-white text-red-600 px-3 py-1.5 rounded-lg text-sm font-bold shadow-md hover:bg-gray-100 transition transform hover:-translate-y-0.5"
                >
                  Đăng Ký
                </NavLink>
              </div>
            )}
          </div>

          {/* Nút Hamburger cho Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg text-white hover:bg-white/20 focus:outline-none transition"
            >
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6 drop-shadow-md"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6 drop-shadow-md"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        } bg-gradient-to-b from-red-700/95 to-orange-600/95 backdrop-blur-xl border-t border-white/10`}
      >
        <div className="px-4 pt-2 pb-6 space-y-1">
          <NavLink
            to="/"
            className={linkClass}
            onClick={() => setIsMenuOpen(false)}
          >
            Trang chủ
          </NavLink>
          <NavLink
            to="/menu"
            className={linkClass}
            onClick={() => setIsMenuOpen(false)}
          >
            Menu
          </NavLink>
          <NavLink
            to="/promo"
            className={linkClass}
            onClick={() => setIsMenuOpen(false)}
          >
            <FaGift className="inline text-base mr-2" /> Ưu đãi
          </NavLink>
          <NavLink
            to="/cart"
            className={linkClass}
            onClick={() => setIsMenuOpen(false)}
          >
            Giỏ hàng
          </NavLink>

          {isAuthenticated ? (
            <div className="mt-3 pt-3 border-t border-white/20">
              {user?.vaiTro === "quan_tri" && (
                <NavLink
                  to="/admin/dashboard"
                  className={`${linkClass} text-yellow-300`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  QUẢN LÝ (Admin)
                </NavLink>
              )}
              <div className="flex items-center px-3 py-2 text-white font-bold text-base">
                <FaUserCircle className="inline text-xl mr-2" />
                {user.hoTen}
              </div>
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-white/90 hover:bg-white/20 rounded-lg ml-2 text-sm"
              >
                Thông tin tài khoản
              </Link>
              <Link
                to="/orders-history"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-white/90 hover:bg-white/20 rounded-lg ml-2 text-sm"
              >
                Lịch sử mua hàng
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 text-red-200 hover:text-white hover:bg-red-500/50 rounded-lg font-bold ml-2 mt-1 transition text-sm"
              >
                Đăng Xuất
              </button>
            </div>
          ) : (
            <div className="mt-3 pt-3 border-t border-white/20 grid grid-cols-2 gap-3">
              <NavLink
                to="/login"
                className="text-center block px-3 py-2 text-white hover:bg-white/20 rounded-lg font-bold border border-white/30 text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Đăng Nhập
              </NavLink>
              <NavLink
                to="/register"
                className="text-center block px-3 py-2 bg-white text-red-600 rounded-lg font-bold shadow-md text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Đăng Ký
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
