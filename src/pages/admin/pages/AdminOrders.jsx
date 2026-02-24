import { useMemo, useState } from "react";
import "../AdminLayout.css";
import "./AdminPages.css";

const ORDER_ROWS = [
  { id: "#AAS-1092", customer: "Neha Sharma", payment: "Paid", status: "Processing", amount: "?3,490" },
  { id: "#AAS-1088", customer: "Riya Das", payment: "Paid", status: "Shipped", amount: "?2,120" },
  { id: "#AAS-1087", customer: "Kavya Patel", payment: "Paid", status: "Delivered", amount: "?5,640" },
  { id: "#AAS-1085", customer: "Sonia Verma", payment: "COD", status: "Pending", amount: "?1,780" },
  { id: "#AAS-1084", customer: "Aarti Gupta", payment: "Paid", status: "Delivered", amount: "?4,240" },
];

export default function AdminOrders() {
  const [status, setStatus] = useState("All");

  const visible = useMemo(() => {
    if (status === "All") return ORDER_ROWS;
    return ORDER_ROWS.filter((row) => row.status === status);
  }, [status]);

  return (
    <section className="adm-widget">
      <div className="adm-widget-head">
        <h2>Orders</h2>
        <span>Static preview</span>
      </div>

      <div className="adm-controls">
        <select className="adm-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          <option>Pending</option>
          <option>Processing</option>
          <option>Shipped</option>
          <option>Delivered</option>
        </select>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.payment}</td>
                <td>
                  <span className={`adm-status ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td>{order.amount}</td>
                <td>
                  <select className="adm-select adm-select-inline" defaultValue={order.status}>
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
