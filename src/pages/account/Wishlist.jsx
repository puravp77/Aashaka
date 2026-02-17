import "./Wishlist.css";
import { withPublicUrl } from "../../utils/assetPath";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";

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
          <div className="wishlist-empty">
            <h4>Your wishlist is empty</h4>
            <p>Save your favorite pieces and shop later.</p>
            <button className="wishlist-empty-btn" onClick={() => navigate("/")}
            >
              RETURN TO SHOP
            </button>
          </div>
        ) : (
          <div className="wishlist-list">
            <AnimatePresence>
              {wishlistItems.map((item) => (
                <motion.div
                  className="wishlist-item"
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <motion.button
                    className="wishlist-remove"
                    onClick={() => removeFromWishlist(item.id)}
                    aria-label="Remove from wishlist"
                    whileTap={{ scale: 0.9 }}
                  >
                    x
                  </motion.button>

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
                      <img src={withPublicUrl(item.images?.[0] || item.image)} alt={item.title} />
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
                      <motion.button
                        type="button"
                        onClick={() => setQty(item.id, Math.max(1, getQty(item.id) - 1))}
                        whileTap={{ scale: 0.9 }}
                      >
                        -
                      </motion.button>
                      <span>{getQty(item.id)}</span>
                      <motion.button
                        type="button"
                        onClick={() => {
                          const next = getQty(item.id) + 1;
                          if (next > 9) {
                            toast.error("Out of Stock", { toastId: "wishlist-out-of-stock" });
                            return;
                          }
                          setQty(item.id, next);
                        }}
                        whileTap={{ scale: 0.9 }}
                      >
                        +
                      </motion.button>
                    </div>
                    <motion.button
                      className="wishlist-cart-btn"
                      disabled={getQty(item.id) >= 9}
                      whileHover={{ y: -1 }}
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
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}

