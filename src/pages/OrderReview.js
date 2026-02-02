import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./OrderReview.css";

export default function OrderReview() {
  const navigate = useNavigate();
  const { cartItems, total, clearCart } = useCart();

  const [address, setAddress] = useState(null);

  /* =========================
     LOAD ADDRESS
  ========================= */
  useEffect(() => {
    const savedAddress = localStorage.getItem("aashaka_address");
    if (!savedAddress) {
      navigate("/address");
      return;
    }
    setAddress(JSON.parse(savedAddress));
  }, [navigate]);

  /* =========================
     EDGE CASE: EMPTY CART
  ========================= */
  if (cartItems.length === 0) {
    navigate("/");
    return null;
  }

  /* =========================
     PLACE ORDER
  ========================= */
  const handlePlaceOrder = () => {
    const order = {
      orderId: "AASHAKA-" + Date.now(),
      items: cartItems,
      address,
      total,
      date: new Date().toISOString(),
    };

    localStorage.setItem("aashaka_last_order", JSON.stringify(order));

    clearCart();
    navigate("/order-success");
  };

  if (!address) return null;

  return (
    <section className="order-review-page">
      <h2 className="review-title">Review Your Order</h2>

      <div className="review-wrapper">
        {/* =========================
           LEFT: ADDRESS
        ========================= */}
        <div className="review-card">
          <h3>Delivery Address</h3>
          <p><strong>{address.name}</strong></p>
          <p>{address.address}</p>
          <p>
            {address.city}, {address.state} - {address.pincode}
          </p>
          <p>Phone: {address.phone}</p>
          <p>Email: {address.email}</p>
        </div>

        {/* =========================
           RIGHT: ORDER SUMMARY
        ========================= */}
        <div className="review-card">
          <h3>Order Summary</h3>

          {cartItems.map((item) => (
            <div
              className="review-item"
              key={`${item.id}-${item.size || "free"}`}
            >
              <img
                src={item.image}
                alt={item.title}
              />

              <div className="review-info">
                <p className="title">{item.title}</p>
                <p className="meta">
                  Qty: {item.qty} {item.size && `| Size: ${item.size}`}
                </p>
              </div>

              <span className="price">
                ₹{item.price * item.qty}
              </span>
            </div>
          ))}

          <div className="review-total">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <button
            className="place-order-btn"
            onClick={handlePlaceOrder}
          >
            PLACE ORDER
          </button>
        </div>
      </div>
    </section>
  );
}
