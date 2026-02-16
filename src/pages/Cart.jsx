import "./Cart.css";
import { withPublicUrl } from "../utils/assetPath";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { FiMinus, FiPlus } from "react-icons/fi";

const MAX_QTY_PER_PRODUCT = 10;
const FREE_SHIPPING_THRESHOLD = 1999;
const SHIPPING_CHARGE = 100;

export default function Cart() {
  const navigate = useNavigate();

  const { cartItems, updateQty, removeFromCart } = useCart();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;

  const grandTotal = subtotal + shipping;

  const hasOutOfStockItem = cartItems.some(
    (item) => item.qty >= MAX_QTY_PER_PRODUCT
  );

  return (
    <section className="cart-page">
      <div className="cart-wrapper">
        <div className="cart-items">
          {cartItems.length === 0 && (
            <div className="empty-cart">
              <div className="empty-icon">Shop</div>
              <h4>Your cart is empty</h4>
              <p>Browse our collection and add something you love.</p>
              <button className="return-btn" onClick={() => navigate("/")}
              >
                RETURN TO SHOP
              </button>
            </div>
          )}

          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div
                className="cart-item"
                key={`${item.id}-${item.size || "nosize"}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <motion.button
                  className="remove"
                  onClick={() => removeFromCart(item.id, item.size)}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </motion.button>

                <img src={withPublicUrl(item.image)} alt={item.title} />

                <div className="cart-info">
                  <h4>{item.title}</h4>
                  {item.size && (
                    <p className="size">Size: {item.size}</p>
                  )}
                </div>

                <div className="cart-unit-price">Rs. {item.price}</div>

                <div className="qty-box horizontal">
                  <span className="qty-label">Qty</span>

                  <div className="qty-stepper">
                    <motion.button
                      onClick={() =>
                        updateQty(item.id, item.size, item.qty - 1)
                      }
                      disabled={item.qty === 1}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Decrease quantity"
                    >
                      <FiMinus />
                    </motion.button>

                    <span className="qty-value">{item.qty}</span>

                    <motion.button
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
                      whileTap={{ scale: 0.9 }}
                      aria-label="Increase quantity"
                    >
                      <FiPlus />
                    </motion.button>
                  </div>

                  {item.qty >= MAX_QTY_PER_PRODUCT && (
                    <p className="stock-warning">Out Of Stock</p>
                  )}
                </div>

                <div className="cart-line-total">
                  Rs. {item.price * item.qty}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.div
          className="cart-summary"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
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

          <div className="shipping-note">
            {shipping === 0
              ? "You unlocked free shipping."
              : `Add Rs. ${FREE_SHIPPING_THRESHOLD - subtotal} for free shipping.`}
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
        </motion.div>
      </div>
    </section>
  );
}
