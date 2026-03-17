import "./OrderHistory.css";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { withPublicUrl } from "../../utils/assetPath";
import { fetchMyOrders } from "../../utils/orderApi";

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let ignore = false;

    const loadOrders = async () => {
      setLoading(true);
      try {
        const data = await fetchMyOrders();
        if (!ignore) {
          setOrders(data);
        }
      } catch (error) {
        if (!ignore) {
          setOrders([]);
          toast.error(error.message || "Unable to load your orders.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadOrders();
    return () => {
      ignore = true;
    };
  }, [user]);

  return (
    <section className="order-history-page">
      <div className="order-history-wrapper">
        <h2 className="order-history-title">ORDER HISTORY</h2>

        {loading ? (
          <p className="order-history-empty">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="order-history-empty">No orders yet</p>
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

                <div className="order-history-summary">
                  <div>Status: {order.statusLabel}</div>
                  <div>{order.isDelivered ? "Delivered" : "Not delivered yet"}</div>
                  <div>{order.isPaid ? "Paid" : "Payment pending"}</div>
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

