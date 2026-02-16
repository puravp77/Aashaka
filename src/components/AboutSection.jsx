import "./AboutSection.css";
import { withPublicUrl } from "../utils/assetPath";

export default function AboutSection() {
  return (
    <section className="about-section">
      
      <div className="about-inner">

        <div className="about-left">
          <h4 className="about-label">ABOUT</h4>
          <h2 className="about-title">Aashaka today</h2>

          <div className="about-content">
            <span className="quote">“</span>
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
        </div>

        <div className="about-right">
          <img src={withPublicUrl("images/About-Aashaka.jpg")} alt="About Aashaka" />
        </div>

      </div>
    </section>
  );
}

