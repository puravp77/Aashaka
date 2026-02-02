import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import "./CategorySection.css";

export default function CategorySection() {
  const navigate = useNavigate();
  const gridRef = useRef(null);

  const scrollLeft = () => {
    gridRef.current.scrollBy({ left: -180, behavior: "smooth" });
  };

  const scrollRight = () => {
    gridRef.current.scrollBy({ left: 180, behavior: "smooth" });
  };

  return (
    <section className="category-section">
      <div className="category-wrapper">

        {/* 🔥 MOBILE ARROWS */}
        <button className="cat-arrow left" onClick={scrollLeft}>
          ‹
        </button>

        <button className="cat-arrow right" onClick={scrollRight}>
          ›
        </button>

        <div className="category-grid" ref={gridRef}>

          <div
            className="category-card"
            onClick={() => navigate("/jewellery/oxidised")}
          >
            <img src="/images/oxidisedSet.jpeg" alt="Oxidised Set" />
            <p><b>Oxidised set</b></p>
          </div>

          <div
            className="category-card"
            onClick={() => navigate("/jewellery/bangles")}
          >
            <img src="/images/kada.jpeg" alt="Bangles Kada" />
            <p><b>Bangles-Kada</b></p>
          </div>

          <div
            className="category-card"
            onClick={() => navigate("/jewellery/earrings")}
          >
            <img src="/images/Earrings.jpeg" alt="Earrings" />
            <p><b>Earrings</b></p>
          </div>

          <div
            className="category-card"
            onClick={() => navigate("/jewellery/necklace")}
          >
            <img src="/images/neckless.jpeg" alt="Necklace" />
            <p><b>Necklace</b></p>
          </div>

          <div
            className="category-card"
            onClick={() => navigate("/kurti")}
          >
            <img src="/images/kurti.jpeg" alt="Kurti Set" />
            <p><b>Kurti Set</b></p>
          </div>

        </div>
      </div>
    </section>
  );
}
