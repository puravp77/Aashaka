import { useEffect, useRef } from "react";
import "./SignatureSection.css";

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
            src="images/sig1.jpg"
            className="img img-left"
            alt="Signature Left"
          />
          <img
            src="images/sig2.jpg"
            className="img img-center"
            alt="Signature Center"
          />
          <img
            src="images/sig3.jpg"
            className="img img-right"
            alt="Signature Right"
          />
        </div>

        <div className="signature-text">
          <h4>SIGNATURE</h4>
          <h1>Hue's Of Aashaka</h1>
          <p>
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

