import "./OrderSuccess.css";
import { Link } from "react-router-dom";

export default function OrderSuccess() {
  return (
    <div className="order-success">
      <div className="order-success-box">
        <div className="success-icon">✓</div>

        <h1>Order Placed Successfully</h1>
        <p>Thank you for shopping with Aashaka Fashion.</p>
        <p>You will receive a confirmation call/message soon.</p>

        <Link to="/">CONTINUE SHOPPING</Link>
      </div>
    </div>
  );
}

