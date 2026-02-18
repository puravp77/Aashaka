import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import "./WatchShopModal.css";
import { withPublicUrl } from "../../utils/assetPath";
import { useNavigate } from "react-router-dom";

export default function WatchShopModal({ items, index, setIndex }) {
  const navigate = useNavigate();
  const item = items[index];

  const prev = useCallback(() => {
    setIndex(index === 0 ? items.length - 1 : index - 1);
  }, [index, items.length, setIndex]);

  const next = useCallback(() => {
    setIndex(index === items.length - 1 ? 0 : index + 1);
  }, [index, items.length, setIndex]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIndex(null);
        return;
      }
      if (event.key === "ArrowLeft") {
        prev();
        return;
      }
      if (event.key === "ArrowRight") {
        next();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev, setIndex]);

  return createPortal(
    <div
      className="watch-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Watch and shop preview"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          setIndex(null);
        }
      }}
    >
      <button
        className="close"
        type="button"
        onClick={() => setIndex(null)}
        aria-label="Close preview"
      >
        &#10005;
      </button>

      <button className="nav left" type="button" onClick={prev} aria-label="Previous item">
        &#8249;
      </button>

      <div className="modal-card">
        <div className="modal-media">
          <video
            src={withPublicUrl(item.video)}
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="modal-pill">Watch & Shop</div>
        </div>

        <div className="modal-bottom">
          <p className="modal-title">{item.title}</p>
          <div className="modal-price-row">
            <span className="modal-price">{"\u20B9"}{item.price}</span>
            <span className="modal-discount">{item.discount}% off</span>
            <span className="modal-old-price">{"\u20B9"}{item.oldPrice}</span>
          </div>
          <p className="modal-counter">
            {index + 1} / {items.length}
          </p>
          <button
            className="buy-btn"
            type="button"
            onClick={() => navigate(`/product/${item.productId}`)}
          >
            Shop This Look
          </button>
        </div>
      </div>

      <button className="nav right" type="button" onClick={next} aria-label="Next item">
        &#8250;
      </button>
    </div>,
    document.body
  );
}
