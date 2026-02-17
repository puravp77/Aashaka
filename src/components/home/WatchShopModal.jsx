import { useEffect } from "react";
import { createPortal } from "react-dom";
import "./WatchShopModal.css";
import { withPublicUrl } from "../../utils/assetPath";
import { useNavigate } from "react-router-dom";

export default function WatchShopModal({ items, index, setIndex }) {
  const navigate = useNavigate();
  const item = items[index];

  const prev = () => {
    setIndex(index === 0 ? items.length - 1 : index - 1);
  };

  const next = () => {
    setIndex(index === items.length - 1 ? 0 : index + 1);
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <div className="watch-modal">
      <span className="close" onClick={() => setIndex(null)}>&#10005;</span>

      <button className="nav left" onClick={prev}>&#8249;</button>

      <div className="modal-card">
        <video
          src={withPublicUrl(item.video)}
          autoPlay
          muted
          loop
          playsInline
        />

        <div className="modal-bottom">
          <p className="modal-title">{item.title}</p>
          <button
            className="buy-btn"
            onClick={() => navigate(`/product/${item.productId}`)}
          >
            Buy Now
          </button>
        </div>
      </div>

      <button className="nav right" onClick={next}>&#8250;</button>
    </div>,
    document.body
  );
}
