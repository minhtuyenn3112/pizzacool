import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

// --- IMPORT ASSETS ---
import logoImage from "../assets/logo.png";
// Bạn hãy chắc chắn có file ảnh nền này
import footerBg from "../images/menu.jpg";
// ---------------------

function Footer() {
  return (
    <footer
      className="relative bg-cover bg-center bg-no-repeat mt-0 text-gray-300 font-sans"
      style={{
        backgroundImage: `url(${footerBg})`,
      }}
    >
      {/* --- LỚP PHỦ TỐI (Overlay) --- */}
      <div className="absolute inset-0 bg-black/90"></div>

      {/* --- NỘI DUNG CHÍNH --- */}
      <div className="relative z-10 container mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* CỘT 1: VỀ CHÚNG TÔI */}
          <div>
            <h3 className="text-white text-lg font-bold uppercase mb-6 relative inline-block">
              Về Pizza Cool
              <span className="absolute bottom-[-8px] left-0 w-full h-[2px] bg-red-600"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/about"
                  className="hover:text-red-500 transition-colors"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-red-500 transition-colors">
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-red-500 transition-colors">
                  Tin tức & Sự kiện
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 2: THỰC ĐƠN */}
          <div>
            <h3 className="text-white text-lg font-bold uppercase mb-6 relative inline-block">
              Thực đơn
              <span className="absolute bottom-[-8px] left-0 w-full h-[2px] bg-red-600"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/menu?loai=pizza"
                  className="hover:text-red-500 transition-colors"
                >
                  Pizza Hảo Hạng
                </Link>
              </li>
              <li>
                <Link
                  // Đã sửa 'type' thành 'loai'
                  to="/menu?loai=my"
                  className="hover:text-red-500 transition-colors"
                >
                  Mỳ Ý & Cơm
                </Link>
              </li>
              <li>
                <Link
                  // Đã sửa 'type' thành 'loai'
                  to="/menu?loai=ga"
                  className="hover:text-red-500 transition-colors"
                >
                  Gà Rán & Khai Vị
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: BẢN ĐỒ (Thay thế Hỗ trợ) */}
          <div>
            <h3 className="text-white text-lg font-bold uppercase mb-6 relative inline-block">
              Bản đồ
              <span className="absolute bottom-[-8px] left-0 w-full h-[2px] bg-red-600"></span>
            </h3>
            <div className="w-full h-40 rounded-lg overflow-hidden border border-gray-600 shadow-lg">
              {/* Iframe Google Maps: 44 Đào Cam Mộc, Phường 4, Quận 8 (Phường Chánh Hưng cũ) */}
              <iframe
                title="Pizza Cool Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.664875323924!2d106.67732937451702!3d10.75949215949162!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f0413c56363%3A0x8b377b2f0a0d9c0!2zNDQgxJDDoG8gQ2FtIE3hu5ljLCBQaMaw4budbmcgNCwgUXXhuq1uIDgsIEjhu5MgQ2jDrSBNaW5oLCBWaWV0bmFt!5e0!3m2!1sen!2s!4v1709600000000!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              <FaMapMarkerAlt className="inline mr-1 text-red-500" />
              44 Đào Cam Mộc, P.4 (Chánh Hưng), Q.8
            </p>
          </div>

          {/* CỘT 4: THÔNG TIN LIÊN HỆ & MXH */}
          <div className="lg:text-right flex flex-col lg:items-end">
            <Link to="/" className="mb-4 inline-block">
              <img
                src={logoImage}
                alt="Logo"
                className="h-25 w-auto object-contain lg:ml-auto filter brightness-100"
              />
            </Link>

            <div className="space-y-2 text-sm mb-6">
              <p className="flex items-center lg:justify-end gap-2">
                <span className="lg:hidden">
                  <FaMapMarkerAlt className="text-red-500" />
                </span>
                44 Đào Cam Mộc, Q.8, TP.HCM
                <span className="hidden lg:inline">
                  <FaMapMarkerAlt className="text-red-500" />
                </span>
              </p>
              <p className="flex items-center lg:justify-end gap-2">
                <span className="lg:hidden">
                  <FaPhoneAlt className="text-red-500" />
                </span>
                0904317373
                <span className="hidden lg:inline">
                  <FaPhoneAlt className="text-red-500" />
                </span>
              </p>
              <p className="flex items-center lg:justify-end gap-2">
                <span className="lg:hidden">
                  <FaEnvelope className="text-red-500" />
                </span>
                pizzacool@.com
                <span className="hidden lg:inline">
                  <FaEnvelope className="text-red-500" />
                </span>
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3 justify-start lg:justify-end">
              {[
                {
                  icon: <FaFacebookF />,
                  link: "https://www.facebook.com/?locale=vi_VN",
                },
                {
                  icon: <FaInstagram />,
                  link: "https://www.instagram.com/phunguenduy?igsh=ZjlpZmF1OHpuYXZo",
                },
                { icon: <FaTwitter />, link: "#" },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={item.link}
                  className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center hover:bg-white hover:text-red-600 hover:border-white transition-all duration-300"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* --- DÒNG KẺ NGANG --- */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* --- FOOTER BOTTOM --- */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          {/* Copyright */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <span className="font-bold text-gray-300 text-lg">
              Pizza Cool Nhóm 10
            </span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
            <span className="hidden md:inline">|</span>
            <Link to="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white">
              Terms & Conditions
            </Link>
          </div>

          {/* Payment Icons */}
          <div className="flex gap-4 text-2xl text-gray-400">
            <FaCcVisa className="hover:text-white transition-colors" />
            <FaCcMastercard className="hover:text-white transition-colors" />
            <FaCcPaypal className="hover:text-white transition-colors" />
          </div>
        </div>

        <div className="text-center mt-4 text-[10px] text-gray-600">
          Designed with ❤️ for Pizza Lovers
        </div>
      </div>
    </footer>
  );
}

export default Footer;
