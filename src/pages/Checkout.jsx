import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Checkout.css";
import { withPublicUrl } from "../utils/assetPath";

export default function Checkout() {
  const { cartItems, total } = useCart();
  const navigate = useNavigate();

  /* =======================
     EMPTY CART
  ======================= */
  if (cartItems.length === 0) {
    return (
      <section className="checkout-page empty">
        <h2>Your cart is empty</h2>
        <button
          className="back-btn"
          onClick={() => navigate("/")}
        >
          CONTINUE SHOPPING
        </button>
      </section>
    );
  }
  
  /* =======================
     CHECKOUT PAGE
  ======================= */
  return (
    <section className="checkout-page">
      <h2 className="checkout-title">Checkout</h2>

      <div className="checkout-wrapper">
        {/* LEFT: ITEMS */}
        <div className="checkout-items">
          {cartItems.map((item) => (
            <div
              className="checkout-item"
              key={`${item.id}-${item.size || "free"}`}
            >
              <img
                src={withPublicUrl(item.image || "/placeholder.png")}
                alt={item.title}
              />

              <div className="checkout-info">
                <h4>{item.title}</h4>
                <p>Size: {item.size || "Free Size"}</p>
                <p>Qty: {item.qty}</p>
              </div>

              <div className="checkout-price">
                Rs. {item.price * item.qty}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: SUMMARY */}
        <div className="checkout-summary">
          <h3>Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>Rs. {total}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>

          <div className="summary-row total">
            <span>Total</span>
            <span>Rs. {total}</span>
          </div>

          {/* 🔥 FIXED BUTTON */}
          <button
            className="place-order-btn"
            onClick={() => navigate("/place-order")}
          >
            CONTINUE TO PLACE ORDER
          </button>
        </div>
      </div>
    </section>
  );
}
