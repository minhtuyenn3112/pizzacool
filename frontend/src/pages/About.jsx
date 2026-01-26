import React from "react";
import { Link } from "react-router-dom";
import {
  ChefHat,
  Utensils,
  Truck,
  Heart,
  ArrowRight,
  Award,
} from "lucide-react";

// --- IMPORT BACKGROUND IMAGE ---
import pizzaBgImage from "../images/menu.jpg";

// Example images (Replace these with your actual assets later)
const images = {
  chef: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=2560&auto=format&fit=crop",
  ingredients:
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2670&auto=format&fit=crop",
  oven: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2562&auto=format&fit=crop",
};

export default function About() {
  return (
    // --- MAIN WRAPPER (Full Screen Background) ---
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed pt-24 pb-12 px-4"
      style={{ backgroundImage: `url(${pizzaBgImage})` }}
    >
      {/* --- CONTENT CONTAINER --- */}
      <div className="max-w-6xl mx-auto bg-transparent text-white">
        {/* --- SECTION 1: HERO HEADER --- 
            Style: Minimalist text centered
        */}
        <div className="text-center mb-20 relative z-10 animate-fadeIn">
          <h3 className="text-lg md:text-xl font-bold tracking-[0.3em] text-orange-400 mb-4 uppercase drop-shadow-md">
            Câu chuyện & Đam mê
          </h3>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.9)] leading-tight tracking-tight">
            PIZZA COOL
          </h1>
          <p className="mt-4 text-lg font-medium text-gray-200 italic drop-shadow-md">
            "Từ những người yêu Pizza, dành cho người yêu Pizza"
          </p>
          {/* Decorative line */}
          <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-orange-500 mx-auto mt-8 rounded-full shadow-lg"></div>
        </div>

        {/* --- SECTION 2: ABOUT US TEXT --- 
            Style: "ABOUT ME" text block
        */}
        <div className="max-w-4xl mx-auto bg-white/20 backdrop-blur-md rounded-[2rem] p-8 md:p-16 text-center border border-white/30 shadow-2xl mb-24 relative overflow-hidden">
          {/* Decorative Icon Background */}
          <ChefHat className="absolute -top-10 -right-10 text-white/5 w-64 h-64 rotate-12 pointer-events-none" />

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 drop-shadow-md relative z-10 uppercase tracking-widest">
            Về Chúng Tôi
          </h2>
          <p className="text-base md:text-lg text-white/90 leading-loose font-medium drop-shadow-sm relative z-10">
            Pizza Cool không chỉ là một tiệm bánh, đó là nơi niềm đam mê ẩm thực
            bùng cháy. Được thành lập vào năm 2024, chúng tôi tin rằng một chiếc
            Pizza ngon bắt đầu từ những nguyên liệu tươi sạch nhất. Từ bột bánh
            được ủ thủ công 48 giờ, nước sốt cà chua bí truyền, cho đến phô mai
            Mozzarella hảo hạng nhập khẩu. Chúng tôi ở đây để mang đến cho bạn
            những bữa ăn không chỉ ngon miệng mà còn tràn đầy niềm vui.
          </p>
        </div>

        {/* --- SECTION 3: SPLIT LAYOUT (IMAGES & TEXT) --- 
            Style: Alternating grid
        */}
        <div className="space-y-24 mb-24">
          {/* Block 1: Ingredients (Image Left, Text Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Image Side */}
            <div className="group relative h-[450px] rounded-3xl overflow-hidden border-2 border-white/40 shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-all duration-500">
              <img
                src={images.ingredients}
                alt="Fresh Ingredients"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
            </div>

            {/* Text Side */}
            <div className="bg-white/20 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-white/30 shadow-xl text-right md:text-left">
              <div className="text-orange-400 font-bold tracking-widest text-sm mb-2 uppercase">
                Tươi Ngon & Hữu Cơ
              </div>
              <h3 className="text-3xl font-extrabold text-white mb-4 drop-shadow-md uppercase">
                Nguyên Liệu Tươi Sạch
              </h3>
              <p className="text-white/90 font-medium mb-6 leading-relaxed">
                Rau củ được thu hoạch trong ngày, thịt tươi không chất bảo quản.
                Chúng tôi cam kết sức khỏe và chất lượng tuyệt hảo trong từng
                miếng bánh.
              </p>
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-red-500/50"
              >
                XEM THỰC ĐƠN <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Block 2: Craftsmanship (Text Left, Image Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Text Side (Order 2 on mobile, Order 1 on desktop) */}
            <div className="order-2 md:order-1 bg-white/20 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-white/30 shadow-xl">
              <div className="text-orange-400 font-bold tracking-widest text-sm mb-2 uppercase">
                Giá Trị Cốt Lõi
              </div>
              <h3 className="text-3xl font-extrabold text-white mb-6 drop-shadow-md uppercase">
                Thủ Công & Tận Tâm
              </h3>
              <p className="text-white/90 font-medium mb-8 leading-relaxed">
                Mỗi chiếc bánh Pizza Cool là một tác phẩm nghệ thuật. Chúng tôi
                nói không với sản xuất công nghiệp đại trà. Đầu bếp chăm chút
                từng lớp nhân, canh chỉnh nhiệt độ lò chính xác để tạo ra lớp vỏ
                giòn tan và hương vị khói đặc trưng.
              </p>
              <div className="flex gap-4">
                <div className="flex flex-col items-center bg-black/30 p-4 rounded-2xl border border-white/10 min-w-[100px]">
                  <Heart className="text-red-500 mb-2" />
                  <span className="font-bold text-xl">100%</span>
                  <span className="text-xs text-gray-300">Tình yêu</span>
                </div>
                <div className="flex flex-col items-center bg-black/30 p-4 rounded-2xl border border-white/10 min-w-[100px]">
                  <Truck className="text-blue-400 mb-2" />
                  <span className="font-bold text-xl">30p</span>
                  <span className="text-xs text-gray-300">Giao nhanh</span>
                </div>
              </div>
            </div>

            {/* Image Side (Order 1 on mobile, Order 2 on desktop) */}
            <div className="order-1 md:order-2 group relative h-[450px] rounded-3xl overflow-hidden border-2 border-white/40 shadow-2xl transform rotate-[2deg] hover:rotate-0 transition-all duration-500">
              <img
                src={images.chef}
                alt="Our Chef"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
            </div>
          </div>
        </div>

        {/* --- SECTION 4: CALL TO ACTION BANNER --- 
            Style: Full width banner
        */}
        <div className="relative h-96 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/30 group">
          <div className="absolute inset-0 bg-black/60 z-10 group-hover:bg-black/50 transition-all duration-500"></div>
          <img
            src={images.oven}
            alt="Pizza Oven"
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6">
            <Award className="text-yellow-400 w-16 h-16 mb-4 drop-shadow-lg animate-bounce" />
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] tracking-tight uppercase">
              Sẵn Sàng Thưởng Thức?
            </h2>
            <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl font-medium drop-shadow-md">
              Đừng chỉ nghe chúng tôi kể chuyện. Hãy để vị giác của bạn tự mình
              trải nghiệm.
            </p>
            <Link
              to="/menu"
              className="px-10 py-4 bg-white text-red-600 font-extrabold text-lg rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] hover:bg-red-600 hover:text-white hover:shadow-red-500/50 transition-all transform hover:scale-105"
            >
              ĐẶT HÀNG NGAY
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
