import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import watchShopData from "../data/WatchShopData";
import WatchShopModal from "./WatchShopModal";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "./WatchShopSection.css";

const WatchShopSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  /* 🔥 AUTO-CLOSE MODAL ON ROUTE CHANGE */
  useEffect(() => {
    setActiveIndex(null);
  }, [location.pathname]);

  return (
    <section className="watchshop">
      <h2 className="watchshop-title">Watch & Shop</h2>

      <Swiper
        modules={[Navigation]}
        navigation={{
          nextEl: ".watchshop-next",
          prevEl: ".watchshop-prev",
        }}
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          480: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 5 },
        }}
      >
        {watchShopData.map((item, index) => (
          <SwiperSlide key={item.id}>
            <div className="watchshop-card">
              {/* VIDEO CLICK → OPEN MODAL */}
              <div
                className="watchshop-video-wrapper"
                onClick={() => setActiveIndex(index)}
              >
                <video
                  src={item.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </div>

              {/* INFO */}
              <div className="watchshop-info">
                <div className="watchshop-price">
                  <span className="price">₹{item.price}</span>
                  <span className="discount">{item.discount}% off</span>
                  <span className="old-price">₹{item.oldPrice}</span>
                </div>

                <h3 className="watchshop-name">{item.title}</h3>

                <button
                  className="watchshop-btn"
                  onClick={() => {
                    setActiveIndex(null);               // ✅ close modal
                    navigate(`/product/${item.productId}`);
                  }}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* CUSTOM ARROWS */}
        <div className="watchshop-prev">‹</div>
        <div className="watchshop-next">›</div>
      </Swiper>

      {/* MODAL */}
      {activeIndex !== null && (
        <WatchShopModal
          items={watchShopData}
          index={activeIndex}
          setIndex={setActiveIndex}
        />
      )}
    </section>
  );
};

export default WatchShopSection;
