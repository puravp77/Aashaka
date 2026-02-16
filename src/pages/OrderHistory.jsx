import "./OrderHistory.css";
import { withPublicUrl } from "../utils/assetPath";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user?.id) {
      setOrders([]);
      return;
    }

    let ignore = false;

    try {
      const loadOrders = async () => {
        const res = await fetch(`http://localhost:5000/orders?userId=${encodeURIComponent(user.id)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!ignore) {
          setOrders(Array.isArray(data) ? data : []);
        }
      };

      loadOrders();
    } catch (err) {
      setOrders([]);
    }
    return () => {
      ignore = true;
    };
  }, [user]);

  return (
    <section className="order-history-page">
      <div className="order-history-wrapper">
        <h2 className="order-history-title">ORDER HISTORY</h2>

        {orders.length === 0 ? (
          <p className="order-history-empty">No orders placed yet.</p>
        ) : (
          <div className="order-history-list">
            {orders.map((order) => (
              <div className="order-history-card" key={order.orderId || order.id}>
                <div className="order-history-header">
                  <div>
                    <div className="order-history-id">Order: {order.orderId || order.id}</div>
                    <div className="order-history-date">
                      {new Date(order.date).toLocaleString()}
                    </div>
                  </div>
                  <div className="order-history-total">
                    Rs. {order.total}
                  </div>
                </div>

                <div className="order-history-items">
                  {order.items.map((item) => (
                    <div
                      className="order-history-item"
                      key={`${order.orderId || order.id}-${item.id}-${item.size || "nosize"}`}
                    >
                      <img src={withPublicUrl(item.image)} alt={item.title} />
                      <div>
                        <div className="order-item-title">{item.title}</div>
                        {item.size && (
                          <div className="order-item-size">Size: {item.size}</div>
                        )}
                        <div className="order-item-qty">
                          x {item.qty} - Rs. {item.price * item.qty}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-history-summary">
                  <div>Subtotal: Rs. {order.subtotal}</div>
                  <div>Shipping: {order.shipping === 0 ? "Free" : `Rs. ${order.shipping}`}</div>
                  {order.discount > 0 && (
                    <div>Discount: - Rs. {order.discount}</div>
                  )}
                  <div className="order-summary-total">
                    Total: Rs. {order.total}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
