import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import watchShopData from "../../data/WatchShopData";
import WatchShopModal from "./WatchShopModal";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "./WatchShopSection.css";
import { withPublicUrl } from "../../utils/assetPath";

const WatchShopSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isSectionVisible, setIsSectionVisible] = useState(false);

  const sectionRef = useRef(null);
  const videoRefs = useRef(new Map());

  const navigate = useNavigate();
  const location = useLocation();

  // Auto-close modal on route change.
  useEffect(() => {
    setActiveIndex(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!sectionRef.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionVisible(entry.isIntersecting && entry.intersectionRatio >= 0.2);
      },
      { threshold: [0, 0.2, 0.4, 0.6] }
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((videoEl) => {
      if (!videoEl) return;

      if (isSectionVisible) {
        const playPromise = videoEl.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      } else {
        videoEl.pause();
      }
    });
  }, [isSectionVisible]);

  return (
    <section className="watchshop" ref={sectionRef}>
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
              <div
                className="watchshop-video-wrapper"
                onClick={() => setActiveIndex(index)}
              >
                <video
                  ref={(el) => {
                    if (el) {
                      videoRefs.current.set(index, el);
                    } else {
                      videoRefs.current.delete(index);
                    }
                  }}
                  src={withPublicUrl(item.video)}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              </div>

              <div className="watchshop-info">
                <div className="watchshop-price">
                  <span className="price">{"\u20B9"}{item.price}</span>
                  <span className="discount">{item.discount}% off</span>
                  <span className="old-price">{"\u20B9"}{item.oldPrice}</span>
                </div>

                <h3 className="watchshop-name">{item.title}</h3>

                <button
                  className="watchshop-btn"
                  onClick={() => {
                    setActiveIndex(null);
                    navigate(`/product/${item.productId}`);
                  }}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}

        <div className="watchshop-prev">&#8249;</div>
        <div className="watchshop-next">&#8250;</div>
      </Swiper>

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
