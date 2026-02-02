import "./WatchShopModal.css";
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

  return (
    <div className="watch-modal">
      <span className="close" onClick={() => setIndex(null)}>✕</span>

      <button className="nav left" onClick={prev}>‹</button>

      <div className="modal-card">
        <video
          src={item.video}
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

      <button className="nav right" onClick={next}>›</button>
    </div>
  );
}
