import { useEffect, useMemo, useRef, useState } from "react";
import "../AdminLayout.css";
import "./AdminPages.css";

const FALLBACK_ROWS = [
  { id: "#AAS-1092", customer: "Neha Sharma", payment: "Paid", status: "Processing", amount: "?3,490" },
  { id: "#AAS-1088", customer: "Riya Das", payment: "Paid", status: "Shipped", amount: "?2,120" },
  { id: "#AAS-1087", customer: "Kavya Patel", payment: "Paid", status: "Delivered", amount: "?5,640" },
  { id: "#AAS-1085", customer: "Sonia Verma", payment: "COD", status: "Pending", amount: "?1,780" },
  { id: "#AAS-1084", customer: "Aarti Gupta", payment: "Paid", status: "Delivered", amount: "?4,240" },
];

const STATUS_ROTATION = ["Pending", "Processing", "Shipped", "Delivered"];

export default function AdminOrders() {
  const [status, setStatus] = useState("All");
  const [rows, setRows] = useState(FALLBACK_ROWS);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const filterMenuRef = useRef(null);
  const rowMenuRef = useRef(null);
  const statusOptions = ["Pending", "Processing", "Shipped", "Delivered"];
  const filterOptions = ["All", ...statusOptions];

  const updateOrderStatus = (orderId, nextStatus) => {
    setRows((prev) =>
      prev.map((row) => (row.id === orderId ? { ...row, status: nextStatus } : row))
    );
  };

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      try {
        const res = await fetch(`${process.env.PUBLIC_URL}/data/users.json`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch orders data");
        const data = await res.json();
        const orders = Array.isArray(data?.orders) ? data.orders : [];

        const mapped = orders.map((order, index) => {
          const email = String(order?.userId || "");
          const nameFromAddress = order?.shippingAddress?.firstName
            ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName || ""}`.trim()
            : "";
          const customerName = nameFromAddress || (email.split("@")[0] || "User");
          const statusValue = STATUS_ROTATION[index % STATUS_ROTATION.length];
          const amountValue = Number(order?.total || 0);

          return {
            id: order?.orderId || order?.id || `ORD-${index + 1}`,
            customer: customerName,
            payment: order?.paymentMode || "COD",
            status: statusValue,
            amount: `\u20B9${amountValue.toLocaleString("en-IN")}`,
          };
        });

        if (mounted && mapped.length > 0) {
          setRows(mapped);
        }
      } catch {
        if (mounted) {
          setRows(FALLBACK_ROWS);
        }
      }
    };

    loadOrders();
    return () => {
      mounted = false;
    };
  }, []);

  const visible = useMemo(() => {
    if (status === "All") return rows;
    return rows.filter((row) => row.status === status);
  }, [rows, status]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setIsFilterMenuOpen(false);
      }

      if (rowMenuRef.current && !rowMenuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <section className="adm-widget">
      <div className="adm-widget-head">
        <h2>Orders</h2>
      </div>

      <div className="adm-controls">
        <div className="adm-status-menu" ref={filterMenuRef}>
          <button
            type="button"
            className="adm-select adm-select-inline"
            onClick={() => setIsFilterMenuOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isFilterMenuOpen}
          >
            {status}
            <span className={`adm-select-caret ${isFilterMenuOpen ? "open" : ""}`} />
          </button>
          {isFilterMenuOpen && (
            <ul className="adm-status-menu-list" role="listbox" aria-label="Filter orders">
              {filterOptions.map((option) => (
                <li key={option}>
                  <button
                    type="button"
                    className={`adm-status-option ${option === status ? "active" : ""}`}
                    onClick={() => {
                      setStatus(option);
                      setIsFilterMenuOpen(false);
                    }}
                    role="option"
                    aria-selected={option === status}
                  >
                    <span>{option}</span>
                    {option === status && <span className="adm-status-check">v</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table adm-orders-table">
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
                  <div className="adm-status-menu" ref={openMenuId === order.id ? rowMenuRef : null}>
                    <button
                      type="button"
                      className={`adm-select adm-select-inline adm-select-status-${order.status.toLowerCase()}`}
                      onClick={() =>
                        setOpenMenuId((prev) => (prev === order.id ? null : order.id))
                      }
                      aria-haspopup="listbox"
                      aria-expanded={openMenuId === order.id}
                    >
                      {order.status}
                      <span className={`adm-select-caret ${openMenuId === order.id ? "open" : ""}`} />
                    </button>
                    {openMenuId === order.id && (
                      <ul className="adm-status-menu-list" role="listbox" aria-label="Update status">
                        {statusOptions.map((option) => (
                          <li key={option}>
                            <button
                              type="button"
                              className={`adm-status-option ${option === order.status ? "active" : ""}`}
                              onClick={() => {
                                updateOrderStatus(order.id, option);
                                setOpenMenuId(null);
                              }}
                              role="option"
                              aria-selected={option === order.status}
                            >
                              <span>{option}</span>
                              {option === order.status && <span className="adm-status-check">v</span>}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
