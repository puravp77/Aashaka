import { useEffect, useRef } from "react";
import "./SignatureSection.css";
import { withPublicUrl } from "../../utils/assetPath";

export default function   SignatureSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // add animation class when visible
          sectionRef.current.classList.add("animate");
        } else {
          // remove animation class when out of view
          sectionRef.current.classList.remove("animate");
        }
      },
      { threshold: 0.35 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="signature-section" ref={sectionRef}>
      <div className="signature-inner">

        <div className="signature-images">
          <img
            src={withPublicUrl("images/sig1.jpg")}
            className="img img-left"
            alt="Signature Left"
          />
          <img
            src={withPublicUrl("images/sig2.jpg")}
            className="img img-center"
            alt="Signature Center"
          />
          <img
            src={withPublicUrl("images/sig3.jpg")}
            className="img img-right"
            alt="Signature Right"
          />
        </div>

        <div className="signature-text">
          <h4 className="signature-kicker">Signature </h4>
          <h1 className="signature-heading">
            Hues of <span className="signature-brand">Aashaka</span>
          </h1>
          <p className="signature-lead">
            Hand-finished styles, made to feel effortless and elevated.
          </p>
          <p className="signature-description">
            Where design becomes emotion and craftsmanship tells a story.
            Every silhouette is curated with intention, blending modern
            aesthetics with comfort-driven luxury to create pieces that feel
            as beautiful as they look.
          </p>
        </div>

      </div>
    </section>
  );
}

