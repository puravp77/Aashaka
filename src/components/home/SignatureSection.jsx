import { useEffect, useRef } from "react";
import "./SignatureSection.css";
import { withPublicUrl } from "../../utils/assetPath";

const SIGNATURE_IMAGES = [
  {
    src: "images/sig1.jpg",
    alt: "Model in a curated handcrafted look",
    className: "frame-top",
    label: "Curated Layers",
  },
  {
    src: "images/sig2.jpg",
    alt: "Model in an elevated signature outfit",
    className: "frame-main",
    label: "Signature Silhouette",
  },
  {
    src: "images/sig3.jpg",
    alt: "Model showcasing detailed craftsmanship",
    className: "frame-bottom",
    label: "Artisan Detail",
  },
];

export default function SignatureSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const sectionNode = sectionRef.current;
    if (!sectionNode) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        sectionNode.classList.toggle("animate", entry.isIntersecting);
      },
      { threshold: 0.3, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(sectionNode);

    return () => observer.disconnect();
  }, []);

  return (
    <section className="signature-section" ref={sectionRef}>
      <div className="signature-shell">
        <div className="signature-copy">
          <div className="signature-copy-head">
            <p className="signature-kicker">Signature Edit</p>
            <span className="signature-tag">Curated Capsule</span>
          </div>
          <h2 className="signature-heading">
            Hues of <span className="signature-brand">Aashaka</span>
          </h2>
          <p className="signature-lead">
            Hand-finished styles, made to feel effortless and elevated.
          </p>
          <p className="signature-description">
            Where design becomes emotion and craftsmanship tells a story.
            Every silhouette is curated with intention, blending modern
            aesthetics with comfort-driven luxury to create pieces that feel
            as beautiful as they look.
          </p>

          <div className="signature-pill-row" aria-hidden="true">
            <span>Modern Heirloom</span>
            <span>Wearable Art</span>
            <span>Made to Move</span>
          </div>

          <div className="signature-highlights">
            <article className="signature-highlight">
              <span className="signature-highlight-index">01</span>
              <strong>Hand-finished</strong>
              <span className="signature-highlight-text">
                Each piece is refined with artisan-level precision.
              </span>
            </article>
            <article className="signature-highlight">
              <span className="signature-highlight-index">02</span>
              <strong>Effortless Luxury</strong>
              <span className="signature-highlight-text">
                Balanced drapes and textures built for all-day wear.
              </span>
            </article>
          </div>
        </div>

        <div className="signature-gallery" aria-label="Signature style gallery">
          <span className="signature-orbit" aria-hidden="true" />
          {SIGNATURE_IMAGES.map((image) => (
            <figure
              key={image.src}
              className={`signature-frame ${image.className}`}
            >
              <img src={withPublicUrl(image.src)} alt={image.alt} />
              <figcaption>{image.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
