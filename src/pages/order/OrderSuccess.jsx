import "./OrderSuccess.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getLocalOrders, shouldUseLocalCheckoutStore } from "../../utils/localCheckoutData";

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
  const [latestOrder, setLatestOrder] = useState(null);
  const [showCelebration, setShowCelebration] = useState(true);
  const celebrationTimerRef = useRef(null);

  const fallbackUser = useMemo(() => {
    try {
      const raw = localStorage.getItem("store_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const userId = user?.id || fallbackUser?.id || null;
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

    const getLastOrder = (orders) => {
      if (!Array.isArray(orders) || orders.length === 0) return null;
      return [...orders].sort((a, b) => {
        const aTime = new Date(a?.date || 0).getTime();
        const bTime = new Date(b?.date || 0).getTime();
        return bTime - aTime;
      })[0];
    };

    const loadLatestOrder = async () => {
      if (!userId) {
        if (!ignore) setLatestOrder(null);
        return;
      }

      if (shouldUseLocalCheckoutStore()) {
        if (!ignore) {
          setLatestOrder(getLastOrder(getLocalOrders(userId)));
        }
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:5000/orders?userId=${encodeURIComponent(userId)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!ignore) {
          setLatestOrder(getLastOrder(data));
        }
      } catch {
        if (!ignore) setLatestOrder(null);
      }
    };

    loadLatestOrder();
    return () => {
      ignore = true;
    };
  }, [userId]);

  const deliveryDateLabel = useMemo(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5);
    return targetDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

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

        <div className="order-success-meta">
          <div className="meta-card">
            <span className="meta-label">Order ID</span>
            <strong className="meta-value">
              {latestOrder?.orderId || "Will be shared on call"}
            </strong>
          </div>

          <div className="meta-card">
            <span className="meta-label">Total Amount</span>
            <strong className="meta-value">
              {typeof latestOrder?.total === "number"
                ? `Rs. ${latestOrder.total}`
                : "To be confirmed"}
            </strong>
          </div>

          <div className="meta-card">
            <span className="meta-label">Payment</span>
            <strong className="meta-value">
              {latestOrder?.paymentMode || "Cash on Delivery"}
            </strong>
          </div>

          <div className="meta-card">
            <span className="meta-label">Expected Delivery</span>
            <strong className="meta-value">{deliveryDateLabel}</strong>
          </div>
        </div>

        <div className="order-success-note">
          You can track updates from your order history after confirmation.
        </div>

        <div className="order-success-actions">
          <Link to="/" className="btn-primary">
            CONTINUE SHOPPING
          </Link>
          {userId && (
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
