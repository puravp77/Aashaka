import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import "../AdminLayout.css";
import "./AdminPages.css";
import { fetchAdminOrders, updateAdminOrder } from "../../../utils/adminApi";

const getDisplayStatus = (order) => {
  if (order?.isDelivered) return "Delivered";
  if (order?.isPaid) return "Paid";
  return "Pending";
};

const formatCustomer = (order) => {
  const userName = String(order?.user?.name || "").trim();
  const userEmail = String(order?.user?.email || "").trim();
  const shippingName = String(order?.shippingAddress?.name || "").trim();
  return userEmail || userName || shippingName || "Guest";
};

const normalizeOrderRow = (order) => ({
  id: String(order?._id || ""),
  customer: formatCustomer(order),
  date: order?.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "-",
  status: getDisplayStatus(order),
  amount: `\u20B9${Number(order?.totalPrice || 0).toLocaleString("en-IN")}`,
  isPaid: Boolean(order?.isPaid),
  isDelivered: Boolean(order?.isDelivered),
});

export default function AdminOrders() {
  const [status, setStatus] = useState("All");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const filterMenuRef = useRef(null);
  const rowMenuRef = useRef(null);
  const filterOptions = ["All", "Pending", "Paid", "Delivered"];

  const updateOrderState = async (orderId, payload, successMessage) => {
    try {
      const updatedOrder = await updateAdminOrder(orderId, payload);
      const normalized = normalizeOrderRow(updatedOrder);
      setRows((prev) =>
        prev.map((row) => (row.id === orderId ? { ...row, ...normalized } : row))
      );
      setOpenMenuId(null);
      toast.success(successMessage);
    } catch (error) {
      toast.error(error.message || "Unable to update order.");
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      setLoading(true);
      try {
        const orders = await fetchAdminOrders();
        const mapped = orders.map(normalizeOrderRow);

        if (mounted) {
          setRows(mapped);
        }
      } catch (error) {
        if (mounted) {
          setRows([]);
          toast.error(error.message || "Unable to load admin orders.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
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
              <th>User</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="adm-table-empty" colSpan="6">Loading orders...</td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td className="adm-table-empty" colSpan="6">No orders found.</td>
              </tr>
            ) : (
              visible.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.date}</td>
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
                        Update
                        <span className={`adm-select-caret ${openMenuId === order.id ? "open" : ""}`} />
                      </button>
                      {openMenuId === order.id && (
                        <ul className="adm-status-menu-list" role="listbox" aria-label="Update order">
                          <li>
                            <button
                              type="button"
                              className={`adm-status-option ${order.isDelivered ? "active" : ""}`}
                              onClick={() =>
                                updateOrderState(
                                  order.id,
                                  { isDelivered: true, orderStatus: "delivered" },
                                  "Order marked as delivered"
                                )
                              }
                              disabled={order.isDelivered}
                            >
                              <span>Mark as Delivered</span>
                              {order.isDelivered && <span className="adm-status-check">v</span>}
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              className={`adm-status-option ${order.isPaid ? "active" : ""}`}
                              onClick={() =>
                                updateOrderState(
                                  order.id,
                                  { isPaid: true },
                                  "Order marked as paid"
                                )
                              }
                              disabled={order.isPaid}
                            >
                              <span>Mark as Paid</span>
                              {order.isPaid && <span className="adm-status-check">v</span>}
                            </button>
                          </li>
                        </ul>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
