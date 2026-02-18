import "./ExploreCollection.css";
import { withPublicUrl } from "../../utils/assetPath";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const QUICK_LINKS = [
  {
    title: "Oxidised",
    subtitle: "Statement artisan finish",
    path: "/jewellery/oxidised",
  },
  {
    title: "Bangles",
    subtitle: "Layered festive stacks",
    path: "/jewellery/bangles",
  },
  {
    title: "Earrings",
    subtitle: "From subtle to bold",
    path: "/jewellery/earrings",
  },
  {
    title: "Necklace",
    subtitle: "Wedding-ready highlights",
    path: "/jewellery/necklace",
  },
];

export default function ExploreCollection() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const visibilityRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio || 0;
        const wasVisible = visibilityRef.current;
        let nextVisible = wasVisible;

        if (!entry.isIntersecting) {
          nextVisible = false;
        } else if (!wasVisible && ratio >= 0.32) {
          nextVisible = true;
        } else if (wasVisible && ratio <= 0.14) {
          nextVisible = false;
        }

        if (nextVisible !== wasVisible) {
          visibilityRef.current = nextVisible;
          setIsVisible(nextVisible);
        }
      },
      { threshold: [0, 0.14, 0.32, 0.6] }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={`explore-collection ${isVisible ? "is-visible" : ""}`}
      ref={sectionRef}
    >
      <img
        src={withPublicUrl("images/bannernewasaga2.jpeg")}
        alt="Explore Collection"
        className="explore-image"
      />
      <div className="explore-overlay" aria-hidden="true" />
      <div className="explore-grid">
        <div className="explore-content">
          <p className="explore-kicker">Aashaka's</p>
          <h2>Curated for You</h2>
          <p className="explore-subtitle">
            Handpicked festive looks, timeless silhouettes, and statement
            detailing crafted for every celebration.
          </p>
          <div className="explore-actions">
            <button
              type="button"
              className="explore-btn primary"
              onClick={() =>navigate("/kurti")}
            >
              Shop Kurti
            </button>           
            
          </div>
          <div className="explore-meta">
            <span>Handcrafted Pieces</span>
            <span>Premium Fabrics</span>
            <span>Fast Dispatch</span>
          </div>
          <div className="explore-stats">
            <div>
              <strong>500+</strong>
              <span>Designs</span>
            </div>
            <div>
              <strong>4.8/5</strong>
              <span>Customer Rating</span>
            </div>
            <div>
              <strong>48h</strong>
              <span>Dispatch</span>
            </div>
          </div>
        </div>

        <aside className="explore-quickshop" aria-label="Quick shop categories">
          <p className="explore-quickshop-kicker">Quick Shop</p>
          <h3>Pick Your Style</h3>
          <div className="explore-quickshop-list">
            {QUICK_LINKS.map((link) => (
              <button
                key={link.title}
                type="button"
                className="explore-quickshop-card"
                onClick={() => navigate(link.path)}
              >
                <span>{link.title}</span>
                <small>{link.subtitle}</small>
              </button>
            ))}
          </div>
        </aside>

        <div className="explore-glow" aria-hidden="true" />
      </div>

      <div className="explore-scroll-note" aria-hidden="true">
        <span />
        Curated for your festive wardrobe
      </div>

      <div className="explore-mobile-quickshop">
        {QUICK_LINKS.map((link) => (
          <button
            key={`mobile-${link.title}`}
            type="button"
            className="explore-mobile-chip"
            onClick={() => navigate(link.path)}
          >
            {link.title}
          </button>
        ))}
      </div>

      <div className="explore-mobile-strip">
        <div className="explore-mobile-stat">
          <strong>500+</strong>
          <span>Designs</span>
        </div>
        <div className="explore-mobile-stat">
          <strong>4.8/5</strong>
          <span>Rating</span>
        </div>
        <div className="explore-mobile-stat">
          <strong>48h</strong>
          <span>Dispatch</span>
        </div>
      </div>
    </section>
  );
}
