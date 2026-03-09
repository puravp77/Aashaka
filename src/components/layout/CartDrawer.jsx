import "./CartDrawer.css";
import { withPublicUrl } from "../../utils/assetPath";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useProducts } from "../../context/ProductContext";

export default function CartDrawer({ open, onClose }) {
  const { cartItems, removeFromCart, updateQty, total } = useCart();
  const { products } = useProducts();
  const navigate = useNavigate();

  const getAvailableStock = (item) => {
    const product = products.find(
      (candidate) => String(candidate.id) === String(item.id)
    );

    if (!product) return item.qty;
    if (!product.sizes || !item.size) return Number.POSITIVE_INFINITY;

    return Math.max(0, Number(product.sizes[item.size]) || 0);
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div className="drawer-head-copy">
            <h3>Your Cart</h3>
            <p>
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
            </p>
          </div>

          <button
            type="button"
            className="drawer-close"
            onClick={onClose}
            aria-label="Close cart drawer"
          >
            x
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p className="empty-title">Your cart feels empty</p>
            <p className="empty-copy">
              Add products you love and they will appear here.
            </p>

            <button
              className="drawer-btn drawer-btn-primary"
              onClick={() => {
                onClose();
                navigate("/");
              }}
            >
              CONTINUE SHOPPING
            </button>
          </div>
        ) : (
          <>
            <div className="drawer-items">
              {cartItems.map((item) => {
                const availableStock = getAvailableStock(item);

                return (
                  <div className="drawer-item" key={`${item.id}-${item.size || "free"}`}>
                    <img src={withPublicUrl(item.image)} alt={item.title} />

                    <div className="drawer-text">
                      <h4>{item.title}</h4>
                      <p className="drawer-size">
                        Size <span>{item.size || "Free Size"}</span>
                      </p>

                      <div className="drawer-meta-row">
                        <div className="drawer-qty">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() =>
                              updateQty(item.id, item.size, Math.max(1, item.qty - 1))
                            }
                          >
                            -
                          </button>

                          <span>{item.qty}</span>

                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => {
                              if (
                                Number.isFinite(availableStock) &&
                                item.qty >= availableStock
                              ) {
                                toast.error("Out of stock for this size", {
                                  toastId: "out-of-stock-cart",
                                });
                                return;
                              }

                              updateQty(item.id, item.size, item.qty + 1);
                            }}
                            disabled={
                              Number.isFinite(availableStock) &&
                              item.qty >= availableStock
                            }
                          >
                            +
                          </button>
                        </div>

                        <div className="drawer-price">Rs. {item.price * item.qty}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="drawer-remove"
                      onClick={() => removeFromCart(item.id, item.size)}
                      aria-label={`Remove ${item.title}`}
                    >
                      x
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="drawer-footer">
              <div className="drawer-total">
                <span>Total</span>
                <strong>Rs. {total}</strong>
              </div>

              <button
                className="drawer-btn drawer-btn-secondary"
                onClick={() => {
                  onClose();
                  navigate("/");
                }}
              >
                CONTINUE SHOPPING
              </button>

              <button
                className="drawer-btn drawer-btn-primary"
                onClick={() => {
                  onClose();
                  navigate("/cart");
                }}
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
