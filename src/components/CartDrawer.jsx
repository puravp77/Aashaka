import "./CartDrawer.css";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-toastify"; // ✅ added

export default function CartDrawer({ open, onClose }) {
  const {
    cartItems,
    removeFromCart,
    updateQty,
    total,
  } = useCart();

  const navigate = useNavigate();

  /* 🔒 LOCK BACKGROUND SCROLL */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <aside
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= EMPTY CART ================= */}
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p className="empty-title">No products in the cart.</p>

            <button
              className="drawer-checkout"
              onClick={onClose}
            >
              CONTINUE SHOPPING
            </button>
          </div>
        ) : (
          <>
            {/* ================= ITEMS ================= */}
            <div className="drawer-items">
              {cartItems.map((item) => (
                <div
                  className="drawer-item"
                  key={`${item.id}-${item.size || "free"}`}
                >
                  <img src={item.image} alt={item.title} />

                  <div className="drawer-text">
                    <h4>{item.title}</h4>

                    {/* ✅ QUANTITY CONTROLS */}
                    <div className="drawer-qty">
                      <button
                        onClick={() =>
                          updateQty(
                            item.id,
                            item.size,
                            Math.max(1, item.qty - 1)
                          )
                        }
                      >
                        −
                      </button>

                      <span>{item.qty}</span>

                      <button
                        onClick={() => {
                          if (item.qty >= 9) {
                            toast.error("Out of stock", {
                              toastId: "out-of-stock-cart",
                            });
                            return;
                          }

                          updateQty(item.id, item.size, item.qty + 1);
                        }}
                      >
                        +
                      </button>
                    </div>

                    <p className="drawer-size">
                      SIZE {item.size || "FREE SIZE"}
                    </p>
                  </div>

                  <div className="drawer-right">
                    <button
                      className="drawer-remove"
                      onClick={() =>
                        removeFromCart(item.id, item.size)
                      }
                    >
                      ×
                    </button>

                    <div className="drawer-price">
                      Rs. {item.price * item.qty}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ================= FOOTER ================= */}
            <div className="drawer-footer">
              <div className="drawer-total">
                <span>Total:</span>
                <span>Rs. {total}</span>
              </div>

              {/* ✅ CONTINUE SHOPPING (ADDED) */}
              <button
                className="drawer-checkout"
                onClick={() => {
                  onClose();
                  navigate("/"); // always go to Home
                }}
              >
                CONTINUE SHOPPING
              </button>  
<br></br> <br></br>
              <button
                className="drawer-checkout"
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
