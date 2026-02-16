import "./Wishlist.css";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [qtyMap, setQtyMap] = useState({});

  const getQty = (id) => qtyMap[id] || 1;
  const setQty = (id, value) => {
    setQtyMap((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <section className="wishlist-page">
      <div className="wishlist-wrapper">
        <h2 className="wishlist-title">WISHLIST</h2>

        {wishlistItems.length === 0 ? (
          <p className="wishlist-empty">Your wishlist is empty</p>
        ) : (
          <div className="wishlist-list">
            {wishlistItems.map((item) => (
              <div className="wishlist-item" key={item.id}>
                <button
                  className="wishlist-remove"
                  onClick={() => removeFromWishlist(item.id)}
                  aria-label="Remove from wishlist"
                >
                  ×
                </button>

                <div
                  className="wishlist-image"
                  onClick={() => navigate(`/product/${item.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      navigate(`/product/${item.id}`);
                    }
                  }}
                >
                  {(item.images?.[0] || item.image) && (
                    <img src={item.images?.[0] || item.image} alt={item.title} />
                  )}
                </div>

                <div className="wishlist-info">
                  <h4 onClick={() => navigate(`/product/${item.id}`)}>
                    {item.title}
                  </h4>
                  {item.size && (
                    <div className="wishlist-size">Size: {item.size}</div>
                  )}
                  <div className="wishlist-price">
                    <span>Rs. {item.price}</span>
                    {item.oldPrice && <del>Rs. {item.oldPrice}</del>}
                  </div>
                </div>

                <div className="wishlist-actions">
                  <div className="wishlist-qty">
                    <button
                      type="button"
                      onClick={() => setQty(item.id, Math.max(1, getQty(item.id) - 1))}
                    >
                      –
                    </button>
                    <span>{getQty(item.id)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = getQty(item.id) + 1;
                        if (next > 9) {
                          toast.error("Out of Stock", { toastId: "wishlist-out-of-stock" });
                          return;
                        }
                        setQty(item.id, next);
                      }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="wishlist-cart-btn"
                    disabled={getQty(item.id) >= 9}
                    onClick={() =>
                      addToCart(
                        { ...item, images: item.images || [item.image] },
                        getQty(item.id),
                        item.size || null,
                        true
                      )
                    }
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
