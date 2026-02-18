import "./AboutSection.css";
import { withPublicUrl } from "../../utils/assetPath";
import { useNavigate } from "react-router-dom";

const HIGHLIGHTS = [
  "Handpicked Craftsmanship",
  "Tradition with Modern Grace",
  "Made for Everyday Celebration",
];

export default function AboutSection() {
  const navigate = useNavigate();

  return (
    <section className="about-section">
      <div className="about-shell">
        <div className="about-copy">
          <p className="about-kicker">Our Story –</p>
          <h2 className="about-title">About Aashaka </h2>
          <p className="about-lead">
            Jewellery and clothing that feel personal, rooted in culture, and
            effortlessly contemporary.
          </p>

          <div className="about-content">
            <span className="quote" aria-hidden="true">
              "
            </span>
            <p>
              The word "AASHAKA" draws from Sanskrit roots, symbolizing hope,
              desire & auspicious beginnings. It reflects the spirit of optimism
              & beauty, capturing the essence of Clothing & Jewellery that blends
              timeless tradition with modern elegance. At "AASHAKA", we believe
              jewelry is more than just an outfit; it's a piece of your story, a
              celebration of your spirit.
              "AASHAKA" is more than a name – its a celebration of artistry,
              culture & the moments that matter.
            </p>
          </div>

          <div className="about-highlights">
            {HIGHLIGHTS.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <div className="about-actions">
            <button
              type="button"
              className="about-btn primary"
              onClick={() => navigate("/kurti")}
            >
              Explore Collection
            </button>
            <button
              type="button"
              className="about-btn ghost"
              onClick={() => navigate("/contact-us")}
            >
              Contact Us
            </button>
          </div>
        </div>

        <div className="about-media">
          <div className="about-image-wrap">
            <img
              src={withPublicUrl("images/About-Aashaka.jpg")}
              alt="About Aashaka"
            />
            <div className="about-badge">
              <strong>Crafted with Hope</strong>
              <span>Tradition. Elegance. Story.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
