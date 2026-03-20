import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import "../AdminLayout.css";
import "./AdminPages.css";
import { fetchAdminOrders, updateAdminOrderStatus } from "../../../utils/adminApi";

const getDisplayStatus = (order) => {
  if (["Pending", "Paid", "Delivered"].includes(order?.status)) return order.status;
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
  isPaid: getDisplayStatus(order) === "Paid" || getDisplayStatus(order) === "Delivered",
  isDelivered: getDisplayStatus(order) === "Delivered",
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

  const updateOrderState = async (orderId, nextStatus) => {
    try {
      console.log("[admin-orders] clicked status option", { orderId, nextStatus });
      const updatedOrder = await updateAdminOrderStatus(orderId, nextStatus);
      const normalized = normalizeOrderRow(updatedOrder);
      setRows((prev) =>
        prev.map((row) => (row.id === orderId ? { ...row, ...normalized } : row))
      );
      setOpenMenuId(null);
      toast.success(`Order marked as ${nextStatus.toLowerCase()}.`);
    } catch (error) {
      console.error("[admin-orders] frontend status update failed", {
        orderId,
        nextStatus,
        message: error.message,
      });
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

  const orderStats = useMemo(() => {
    const delivered = rows.filter((row) => row.status === "Delivered").length;
    const paid = rows.filter((row) => row.status === "Paid").length;
    const pending = rows.filter((row) => row.status === "Pending").length;

    return [
      {
        label: "Total Orders",
        value: rows.length,
        tone: "primary",
      },
      {
        label: "Delivered",
        value: delivered,
        tone: "success",
      },
      {
        label: "Paid",
        value: paid,
        tone: "info",
      },
      {
        label: "Pending",
        value: pending,
        tone: "warning",
      },
    ];
  }, [rows]);

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
    <section className="adm-orders-page">
      <div className="adm-orders-hero">
        <div className="adm-orders-hero-copy">
          <p className="adm-orders-kicker">Operations Overview</p>
          <h2>Orders Command Center</h2>
          <p>
            Track order movement, catch pending actions quickly, and update fulfillment status without leaving the page.
          </p>
        </div>

        <div className="adm-orders-stats" aria-label="Order statistics">
          {orderStats.map((stat) => (
            <article key={stat.label} className={`adm-orders-stat ${stat.tone}`}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </div>
      </div>

      <div className="adm-widget adm-orders-shell">
        <div className="adm-widget-head adm-orders-head">
          <div>
            <h2>Orders</h2>
            <span>
              {loading
                ? "Loading your latest order activity."
                : `${visible.length} ${visible.length === 1 ? "order" : "orders"} in the current view.`}
            </span>
          </div>
        </div>

        <div className="adm-controls adm-orders-controls">
          <div className="adm-orders-filter-copy">
            <span className="adm-orders-filter-label">Filter by status</span>
          </div>
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

        <div className="adm-table-wrap adm-orders-table-wrap">
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
              visible.map((order, index) => {
                const shouldOpenUp = index >= Math.max(visible.length - 2, 0);
                const orderActions = [
                  {
                    key: "delivered",
                    label: "Mark as Delivered",
                    isActive: order.status === "Delivered",
                    onClick: () => updateOrderState(order.id, "Delivered"),
                  },
                  {
                    key: "paid",
                    label: "Mark as Paid",
                    isActive: order.status === "Paid" || order.status === "Delivered",
                    onClick: () => updateOrderState(order.id, "Paid"),
                  },
                ].filter((action) => !action.isActive);

                return (
                <tr key={order.id}>
                    <td>
                      <div className="adm-order-id-block">
                        <strong>#{order.id.slice(-8).toUpperCase()}</strong>
                        <span>{order.id}</span>
                      </div>
                    </td>
                    <td>
                      <div className="adm-order-customer">
                        <strong>{order.customer}</strong>
                        <span>Customer</span>
                      </div>
                    </td>
                    <td>{order.date}</td>
                    <td>
                      <span className={`adm-status ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="adm-order-amount">{order.amount}</td>
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
                          <ul
                            className={`adm-status-menu-list ${shouldOpenUp ? "open-up" : ""}`}
                            role="listbox"
                            aria-label="Update order"
                          >
                            {orderActions.length === 0 ? (
                              <li>
                                <button
                                  type="button"
                                  className="adm-status-option"
                                  onClick={() => setOpenMenuId(null)}
                                >
                                  <span>No more actions</span>
                                </button>
                              </li>
                            ) : (
                              orderActions.map((action) => (
                                <li key={action.key}>
                                  <button
                                    type="button"
                                    className="adm-status-option"
                                    onClick={action.onClick}
                                  >
                                    <span>{action.label}</span>
                                  </button>
                                </li>
                              ))
                            )}
                          </ul>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>
    </section>
  );
}
