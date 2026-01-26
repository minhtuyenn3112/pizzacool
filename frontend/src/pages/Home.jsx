import React from "react";
import Banner from "../components/Banner";
import ProductList from "../components/ProductList";
import About from "./About";

import pizzaBgImage from "../images/menu.jpg";

function Home() {
  return (
    <>
      <div
        className="min-h-screen w-full bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${pizzaBgImage})` }}
      >
        <About />

        {/* --- 2. BANNER --- */}
        <div className="py-8">
          <Banner />
        </div>

        {/* --- 3. DANH SÁCH SẢN PHẨM --- */}
        <div className="container mx-auto px-4 pb-12">
          <ProductList />
        </div>
      </div>
    </>
  );
}

export default Home;
