import "./OrderSuccess.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { fetchOrderById } from "../../utils/orderApi";
import { withPublicUrl } from "../../utils/assetPath";

const CONFETTI_COLORS = [
  "#7f0d32",
  "#a71043",
  "#c9873d",
  "#f0c987",
  "#f5ede3",
  "#ffffff",
];

const createConfettiParticles = (count) =>
  Array.from({ length: count }, (_, idx) => ({
    id: idx,
    xStart: 3 + Math.random() * 94,
    xDrift: -90 + Math.random() * 180,
    duration: 2600 + Math.random() * 2200,
    delay: Math.random() * 900,
    spinDuration: 500 + Math.random() * 900,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 8,
    opacity: 0.6 + Math.random() * 0.4,
    shape: idx % 3,
  }));

export default function OrderSuccess() {
  const { user } = useAuth();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(true);
  const celebrationTimerRef = useRef(null);
  const confettiParticles = useMemo(() => createConfettiParticles(56), []);

  useEffect(() => {
    celebrationTimerRef.current = setTimeout(() => {
      setShowCelebration(false);
      celebrationTimerRef.current = null;
    }, 6000);

    return () => {
      if (celebrationTimerRef.current) {
        clearTimeout(celebrationTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadOrder = async () => {
      if (!user || !orderId) {
        if (!ignore) {
          setOrder(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        if (!ignore) {
          setOrder(await fetchOrderById(orderId));
        }
      } catch (error) {
        if (!ignore) {
          setOrder(null);
          toast.error(error.message || "Unable to load your latest order.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadOrder();
    return () => {
      ignore = true;
    };
  }, [orderId, user]);

  const shippingAddressLines = useMemo(() => {
    if (!order?.shippingAddress) return [];

    const { name, phone, addressLine, city, state, pincode } = order.shippingAddress;
    return [
      name,
      phone,
      addressLine,
      [city, state].filter(Boolean).join(", "),
      pincode,
    ].filter(Boolean);
  }, [order]);

  const paymentStatusLabel = useMemo(() => {
    if (!order) return "Pending";
    if (order.isPaid) return "Paid";
    return order.paymentMode?.toLowerCase() === "cod" ? "Pending" : "Pending";
  }, [order]);

  const orderStatusLabel = useMemo(() => {
    if (!order) return "Pending";
    if (order.isDelivered) return "Delivered";
    return order.statusLabel || "Pending";
  }, [order]);

  return (
    <section className="order-success-page">
      {showCelebration && (
        <div className="order-success-confetti" aria-hidden="true">
          <div className="order-success-confetti-flash" />
          {confettiParticles.map((particle) => (
            <span
              key={particle.id}
              className={`order-success-piece shape-${particle.shape}`}
              style={{
                "--x-start": `${particle.xStart}%`,
                "--x-drift": `${particle.xDrift}px`,
                "--fall-duration": `${particle.duration}ms`,
                "--fall-delay": `${particle.delay}ms`,
                "--spin-duration": `${particle.spinDuration}ms`,
                "--piece-color": particle.color,
                "--piece-size": `${particle.size}px`,
                "--piece-opacity": particle.opacity,
              }}
            />
          ))}
        </div>
      )}

      <div className="order-success-shell">
        <p className="order-success-eyebrow">Aashaka Checkout</p>

        <div className="order-success-head">
          <span className="order-success-icon" aria-hidden="true">
            <span className="order-success-icon-mark" />
          </span>
          <h1>Order Confirmed</h1>
          <p>Thank you for shopping with Aashaka Fashion.</p>
          <p>We will contact you shortly to confirm your order details.</p>
        </div>

        {loading ? (
          <div className="order-success-note">Loading your order details...</div>
        ) : !order ? (
          <div className="order-success-note">We could not load this order right now.</div>
        ) : (
          <>
            <div className="order-success-meta">
              <div className="meta-card">
                <span className="meta-label">Order ID</span>
                <strong className="meta-value">{order.orderId}</strong>
              </div>

              <div className="meta-card">
                <span className="meta-label">Total Amount</span>
                <strong className="meta-value">Rs. {order.total}</strong>
              </div>

              <div className="meta-card">
                <span className="meta-label">Order Status</span>
                <strong className="meta-value">{orderStatusLabel}</strong>
              </div>

              <div className="meta-card">
                <span className="meta-label">Payment Status</span>
                <strong className="meta-value">{paymentStatusLabel}</strong>
              </div>
            </div>

            <div className="order-success-grid">
              <div className="order-success-panel">
                <h3>Items</h3>
                <div className="order-success-items">
                  {order.items.map((item, index) => (
                    <div
                      className="order-success-item"
                      key={`${order.orderId}-${item.id}-${item.size || "nosize"}-${index}`}
                    >
                      <img src={withPublicUrl(item.image)} alt={item.title} />
                      <div>
                        <div className="order-success-item-title">{item.title}</div>
                        {item.size && <div className="order-success-item-meta">Size: {item.size}</div>}
                        <div className="order-success-item-meta">Qty: {item.qty}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-success-panel">
                <h3>Shipping Address</h3>
                <div className="order-success-address">
                  {shippingAddressLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="order-success-note">
          You can track updates from your order history after confirmation.
        </div>

        <div className="order-success-actions">
          <Link to="/" className="btn-primary">
            CONTINUE SHOPPING
          </Link>
          {user && (
            <Link to="/order-history" className="btn-secondary">
              VIEW ORDER HISTORY
            </Link>
          )}
        </div>

        <div className="order-success-chips">
          <span>Secure Checkout</span>
          <span>COD Supported</span>
          <span>Trusted Delivery</span>
        </div>
      </div>
    </section>
  );
}
