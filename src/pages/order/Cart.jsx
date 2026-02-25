import "./Cart.css";
import { withPublicUrl } from "../../utils/assetPath";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useProducts } from "../../context/ProductContext";
import {
  FiChevronDown,
  FiMinus,
  FiPlus,
  FiRefreshCw,
  FiShield,
  FiTruck,
} from "react-icons/fi";
import { useSettings } from "../../context/SettingsContext";




const MAX_QTY_PER_PRODUCT = 10;
const RECENTLY_VIEWED_STORAGE_KEY = "aashaka_recently_viewed";

export default function Cart() {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { settings } = useSettings();
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  const { cartItems, updateQty, removeFromCart } = useCart();
  const isCartEmpty = cartItems.length === 0;

  const { flatRate, freeShippingThreshold } = settings.shippingRates;

  const cartIds = useMemo(
    () => new Set(cartItems.map((item) => String(item.id))),
    [cartItems]
  );

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const shipping = isCartEmpty
    ? 0
    : subtotal >= freeShippingThreshold
      ? 0
      : flatRate;

  const grandTotal = subtotal + shipping;
  const freeShippingRemaining = Math.max(
    0,
    freeShippingThreshold - subtotal
  );
  const shippingProgress = isCartEmpty
    ? 0
    : Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));


  const shippingMessage = isCartEmpty
    ? "Add items to your bag to start checkout."
    : shipping === 0
      ? "You unlocked free shipping."
      : `Add Rs. ${freeShippingRemaining} for free shipping.`;

  const hasOutOfStockItem = cartItems.some(
    (item) => item.qty >= MAX_QTY_PER_PRODUCT
  );

  const disableCheckout = isCartEmpty || hasOutOfStockItem;

  const recentlyViewedProducts = useMemo(() => {
    if (products.length === 0) return [];

    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];

      return parsed
        .map((id) =>
          products.find((product) => String(product.id) === String(id))
        )
        .filter(Boolean)
        .filter((product) => !cartIds.has(String(product.id)))
        .slice(0, 4);
    } catch (err) {
      return [];
    }
  }, [products, cartIds]);

  const trendingProducts = useMemo(() => {
    if (products.length === 0) return [];

    return [...products]
      .filter((product) => !cartIds.has(String(product.id)))
      .sort((a, b) => {
        const discountA = Math.max(
          0,
          (Number(a.oldPrice) || Number(a.price) || 0) - (Number(a.price) || 0)
        );
        const discountB = Math.max(
          0,
          (Number(b.oldPrice) || Number(b.price) || 0) - (Number(b.price) || 0)
        );
        return discountB - discountA;
      })
      .slice(0, 4);
  }, [products, cartIds]);

  const openProduct = (id) => navigate(`/product/${id}`);

  const goToCheckout = () => {
    if (isCartEmpty) {
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
  };

  return (
    <section className={`cart-page ${!isCartEmpty ? "has-mobile-bar" : ""}`}>
      <div className="cart-wrapper">
        <div className="cart-items">
          {isCartEmpty && (
            <div className="empty-cart-shell">
              <div className="empty-cart">
                <div className="empty-icon">Shop</div>
                <h4>Your cart is empty</h4>
                <p>Browse our collection and add something you love.</p>
                <button
                  className="return-btn empty-return-btn"
                  onClick={() => navigate("/")}
                >
                  START SHOPPING
                </button>
              </div>

              {recentlyViewedProducts.length > 0 && (
                <div className="suggestion-section">
                  <div className="suggestion-head">
                    <h5>Recently Viewed</h5>
                    <button type="button" onClick={() => navigate("/")}>
                      View All
                    </button>
                  </div>
                  <div className="suggestion-grid">
                    {recentlyViewedProducts.map((product) => (
                      <article
                        key={`recent-${product.id}`}
                        className="suggestion-card"
                        onClick={() => openProduct(product.id)}
                      >
                        <div className="suggestion-image">
                          <img
                            src={withPublicUrl(product.images?.[0] || product.image)}
                            alt={product.title}
                          />
                        </div>
                        <div className="suggestion-copy">
                          <h6>{product.title}</h6>
                          <p>Rs. {product.price}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {trendingProducts.length > 0 && (
                <div className="suggestion-section">
                  <div className="suggestion-head">
                    <h5>Trending Now</h5>
                  </div>
                  <div className="suggestion-grid">
                    {trendingProducts.map((product) => (
                      <article
                        key={`trend-${product.id}`}
                        className="suggestion-card"
                        onClick={() => openProduct(product.id)}
                      >
                        <div className="suggestion-image">
                          <img
                            src={withPublicUrl(product.images?.[0] || product.image)}
                            alt={product.title}
                          />
                        </div>
                        <div className="suggestion-copy">
                          <h6>{product.title}</h6>
                          <p>Rs. {product.price}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
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
                  aria-label={`Remove ${item.title}`}
                >
                  x
                </motion.button>

                <div className="cart-image-wrap">
                  <img src={withPublicUrl(item.image)} alt={item.title} />
                </div>

                <div className="cart-info">
                  <h4>{item.title}</h4>
                  <div className="cart-meta-chips">
                    <span className="cart-chip">
                      {item.size ? `Size ${item.size}` : "Free Size"}
                    </span>
                    <span className="cart-chip subtle">Unit Rs. {item.price}</span>
                  </div>
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
          <p className="summary-kicker">Order Summary</p>
          <h3>Cart Total</h3>

          <button
            type="button"
            className="mobile-summary-toggle"
            onClick={() => setMobileSummaryOpen((prev) => !prev)}
          >
            <span>Order details</span>
            <FiChevronDown className={mobileSummaryOpen ? "open" : ""} />
          </button>

          <div className={`summary-body ${mobileSummaryOpen ? "open" : ""}`}>
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

            <div className="shipping-note">{shippingMessage}</div>

            <div className="shipping-progress" aria-hidden="true">
              <div
                className="shipping-progress-bar"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>

            <div className="summary-actions">
              <button
                className="checkout-btn"
                disabled={disableCheckout}
                onClick={goToCheckout}
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

            <div className="trust-strip">
              <div className="trust-item">
                <FiShield />
                <span>Secure Checkout</span>
              </div>
              <div className="trust-item">
                <FiTruck />
                <span>COD Available</span>
              </div>
              <div className="trust-item">
                <FiRefreshCw />
                <span>Easy 7-day Return</span>
              </div>
            </div>
          </div>
        </motion.div>

        {!isCartEmpty && (
          <div className="mobile-checkout-bar">
            <div className="mobile-checkout-total">
              <span>Total</span>
              <strong>Rs. {grandTotal}</strong>
            </div>
            <button
              type="button"
              className="mobile-checkout-btn"
              disabled={disableCheckout}
              onClick={goToCheckout}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
