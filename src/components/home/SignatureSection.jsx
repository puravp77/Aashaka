import { useEffect, useRef, useState } from "react";
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

const SLOT_CLASSES = ["slot-left", "slot-center", "slot-right"];
const INITIAL_SLOT_ORDER = [2, 0, 1];

export default function SignatureSection() {
  const sectionRef = useRef(null);
  const cycleRef = useRef(null);
  const [slotOrder, setSlotOrder] = useState(INITIAL_SLOT_ORDER);
  const [isCycling, setIsCycling] = useState(false);

  const rotateSlots = () => {
    setSlotOrder(([left, center, right]) => [center, right, left]);
  };

  const handleGalleryEnter = () => {
    if (cycleRef.current) return;
    setIsCycling(true);
    rotateSlots();
    cycleRef.current = setInterval(rotateSlots, 3500);
  };

  const handleGalleryLeave = () => {
    if (cycleRef.current) {
      clearInterval(cycleRef.current);
      cycleRef.current = null;
    }
    setIsCycling(false);
  };

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

    return () => {
      observer.disconnect();
      if (cycleRef.current) {
        clearInterval(cycleRef.current);
        cycleRef.current = null;
      }
    };
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

        <div
          className={`signature-gallery ${isCycling ? "is-cycling" : ""}`}
          aria-label="Signature style gallery"
          onMouseEnter={handleGalleryEnter}
          onMouseLeave={handleGalleryLeave}
        >
          <span className="signature-orbit" aria-hidden="true" />
          {slotOrder.map((imageIndex, slotIndex) => {
            const image = SIGNATURE_IMAGES[imageIndex];
            const slotClass = SLOT_CLASSES[slotIndex];
            return (
              <figure
                key={image.src}
                className={`signature-frame ${slotClass}`}
              >
                <img
                  src={withPublicUrl(image.src)}
                  alt={image.alt}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>{image.label}</figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
