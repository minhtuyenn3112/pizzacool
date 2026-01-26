import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const images = [
  "https://res.cloudinary.com/dj4qfnabu/image/upload/v1760701324/pizzacool/gdtepyvjhenxiykmv0ss.jpg",
  "https://res.cloudinary.com/dj4qfnabu/image/upload/v1760701338/pizzacool/f0stmocu3is6qk5o0q1k.jpg",
  "https://res.cloudinary.com/dj4qfnabu/image/upload/v1760701349/pizzacool/xehsntfevybjgaovvo4l.jpg",
  "https://res.cloudinary.com/dj4qfnabu/image/upload/v1760510475/pizzacool/djyc8e0a6niflnfqdvz8.png",
  "https://res.cloudinary.com/dsyluul3r/image/upload/v1764520756/ChatGPT_Image_23_38_43_30_thg_11_2025_goor3e.png",
];

export default function Banner() {
  const [current, setCurrent] = useState(0);

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (slideIndex) => {
    setCurrent(slideIndex);
  };

  return (
    // --- THAY ĐỔI Ở ĐÂY: Thêm 'mt-16' hoặc 'mt-20' ---
    // mt-16: Đẩy xuống khoảng 64px (bằng chiều cao Header)
    // mt-20: Đẩy xuống khoảng 80px (tạo một khoảng hở nhỏ)
    <div className="mt-16 relative w-full h-96 md:h-[500px] lg:h-[550px] overflow-hidden shadow-lg bg-gray-900 flex items-center justify-center group">
      {/* Slides */}
      {images.map((img, index) => (
        <Link
          to="/promo"
          key={index}
          className={`absolute w-full h-full transition-opacity duration-700 ${
            index === current
              ? "opacity-100 z-10 pointer-events-auto"
              : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <img
            src={img}
            alt={`slide-${index}`}
            className="w-full h-full object-cover cursor-pointer"
          />
        </Link>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute z-20 left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-12 h-12 flex items-center justify-center rounded-full transition focus:outline-none backdrop-blur-sm"
      >
        &#10094;
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute z-20 right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-12 h-12 flex items-center justify-center rounded-full transition focus:outline-none backdrop-blur-sm"
      >
        &#10095;
      </button>

      {/* Indicators */}
      <div className="absolute z-20 bottom-4 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
              index === current
                ? "bg-red-600 w-8"
                : "bg-white/70 w-3 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
