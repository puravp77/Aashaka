import "./Cart.css";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


const MAX_QTY_PER_PRODUCT = 10;
const FREE_SHIPPING_THRESHOLD = 1999;
const SHIPPING_CHARGE = 100;

export default function Cart() {
  const navigate = useNavigate();

  /* 🔥 MUST COME FIRST */
  const { cartItems, updateQty, removeFromCart } = useCart();

  /* -------- DERIVED VALUES -------- */
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;

  const grandTotal = subtotal + shipping;

  /* 🔥 SAFE TO USE cartItems HERE */
  const hasOutOfStockItem = cartItems.some(
    (item) => item.qty >= MAX_QTY_PER_PRODUCT
  );

  return (
    <section className="cart-page">
      <div className="cart-wrapper">

        {/* ================= LEFT : CART ITEMS ================= */}
        <div className="cart-items">
          {cartItems.length === 0 && (
            <p className="empty-cart">Your cart is empty</p>
          )}

          {cartItems.map((item) => (
            <div
              className="cart-item"
              key={`${item.id}-${item.size || "nosize"}`}
            >
              {/* REMOVE */}
              <button
                className="remove"
                onClick={() => removeFromCart(item.id, item.size)}
              >
                ×
              </button>

              {/* PRODUCT IMAGE */}
              <img src={item.image} alt={item.title} />

              {/* PRODUCT INFO */}
              <div className="cart-info">
                <h4>{item.title}</h4>

                {/* ✅ SIZE DISPLAY (FIXED) */}
                {item.size && (
                  <p className="size">Size: {item.size}</p>
                )}
              </div>

              {/* UNIT PRICE */}
              <div className="cart-unit-price">
                Rs. {item.price}
              </div>

              {/* QUANTITY */}
              <div className="qty-box horizontal">
                <span className="qty-label">QUANTITY</span>

                <button
                  onClick={() =>
                    updateQty(item.id, item.size, item.qty - 1)
                  }
                  disabled={item.qty === 1}
                >
                  −
                </button>

                <span>{item.qty}</span>

                <button
                  onClick={() => {
                    if (item.qty >= MAX_QTY_PER_PRODUCT) {
                      toast.error("Out of stock", {
                        toastId: "cart-out-of-stock",
                      });
                      return;
                    }
                    updateQty(item.id, item.size, item.qty + 1);
                  }}
                  disabled={item.qty >= MAX_QTY_PER_PRODUCT}
                >
                  +
                </button>

                {item.qty >= MAX_QTY_PER_PRODUCT && (
                  <p className="stock-warning">Out Of Stock</p>
                )}
              </div>

              {/* LINE TOTAL */}
              <div className="cart-line-total">
                Rs. {item.price * item.qty}
              </div>
            </div>
          ))}
        </div>

        {/* ================= RIGHT : SUMMARY ================= */}
        <div className="cart-summary">
          <h3>Cart Total</h3>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>Rs. {subtotal}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `Rs. ${shipping}`}</span>
          </div>

          <div className="summary-divider" />

          <div className="summary-row total">
            <span>Total</span>
            <span>Rs. {grandTotal}</span>
          </div>

          <div className="summary-actions">
            <button
              className="checkout-btn"
              disabled={hasOutOfStockItem}
              onClick={() => {
                if (cartItems.length === 0) {
                  toast.info("Your cart is empty", {
                    toastId: "cart-empty",
                  });
                  return;
                }
                if (hasOutOfStockItem) {
                  toast.error("One or more items are out of stock", {
                    toastId: "cart-has-out-of-stock",
                  });
                  return;
                }
                navigate("/place-order");
              }}
            >
              PROCEED TO CHECKOUT
            </button>

            <button
              className="return-btn"
              onClick={() => navigate("/")}
            >
              RETURN TO SHOP
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
