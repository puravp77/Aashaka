import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Hammer, ExternalLink, Zap } from "lucide-react";
import "../AdminLayout.css";
import "./AdminPages.css";

const pctDelta = (current, previous) => {
  if (previous === 0) return current === 0 ? "0.0%" : "+100.0%";
  const delta = ((current - previous) / previous) * 100;
  return `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`;
};

const rangeMeta = {
  day: { points: 7, subtitle: "Last 7 days", label: "Daily" },
  month: { points: 6, subtitle: "Last 6 months", label: "Monthly" },
  year: { points: 5, subtitle: "Last 5 years", label: "Yearly" },
};

const shiftDate = (base, range, offset) => {
  const d = new Date(base);
  if (range === "day") d.setDate(d.getDate() + offset);
  if (range === "month") d.setMonth(d.getMonth() + offset);
  if (range === "year") d.setFullYear(d.getFullYear() + offset);
  return d;
};

const inSameBucket = (dateA, dateB, range) => {
  if (range === "day") {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  }
  if (range === "month") {
    return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth();
  }
  return dateA.getFullYear() === dateB.getFullYear();
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [range, setRange] = useState("month");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const isLocal = !window.location.hostname.includes("github.io");
        const usersUrl = isLocal ? "http://localhost:5000/users" : `${process.env.PUBLIC_URL}/data/users.json`;

        const uRes = await fetch(usersUrl, { cache: "no-store" });
        if (!uRes.ok) throw new Error("Failed to fetch users");
        const uData = await uRes.json();

        const fullData = uData.users ? uData : null;

        if (mounted) {
          if (fullData) {
            setOrders(fullData.orders || []);
          } else {
            if (isLocal) {
              const [oRes, pRes] = await Promise.all([
                fetch("http://localhost:5000/orders"),
                fetch("http://localhost:5000/products")
              ]);
              if (oRes.ok) setOrders(await oRes.json());
              if (pRes.ok) setProducts(await pRes.json());
            } else {
              const pRes = await fetch(`${process.env.PUBLIC_URL}/data/products.json`);
              if (pRes.ok) setProducts(await pRes.json());
            }
          }
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
    };

    loadData();
    return () => { mounted = false; };
  }, []);

  const safeOrders = useMemo(
    () =>
      orders
        .map((order) => ({
          date: new Date(order?.date),
          total: Number(order?.total || 0),
          paymentMode: String(order?.paymentMode || ""),
          userId: String(order?.userId || "").toLowerCase(),
          id: String(order?.id || order?.orderId || ""),
          items: Array.isArray(order?.items) ? order.items : [],
          address: order?.address || order?.shippingAddress || {},
        }))
        .filter((order) => !Number.isNaN(order.date.getTime())),
    [orders]
  );

  const latestDate = useMemo(
    () =>
      safeOrders.length
        ? new Date(Math.max(...safeOrders.map((o) => o.date.getTime())))
        : new Date(),
    [safeOrders]
  );

  const currentPeriodOrders = useMemo(
    () => safeOrders.filter((o) => inSameBucket(o.date, latestDate, range)),
    [safeOrders, latestDate, range]
  );

  const previousPeriodDate = useMemo(() => shiftDate(latestDate, range, -1), [latestDate, range]);
  const previousPeriodOrders = useMemo(
    () => safeOrders.filter((o) => inSameBucket(o.date, previousPeriodDate, range)),
    [safeOrders, previousPeriodDate, range]
  );

  const metrics = useMemo(() => {
    const currentRevenue = currentPeriodOrders.reduce((sum, o) => sum + o.total, 0);
    const previousRevenue = previousPeriodOrders.reduce((sum, o) => sum + o.total, 0);

    const currentOrders = currentPeriodOrders.length;
    const previousOrders = previousPeriodOrders.length;

    const currentAov = currentOrders ? currentRevenue / currentOrders : 0;
    const previousAov = previousOrders ? previousRevenue / previousOrders : 0;

    const currentCustomers = currentPeriodOrders.map((o) => o.userId).filter(Boolean);
    const uniqueCurrentCustomers = new Set(currentCustomers).size;
    const repeatCustomers = Object.values(
      currentCustomers.reduce((acc, id) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
      }, {})
    ).filter((count) => count > 1).length;
    const repeatRate = uniqueCurrentCustomers
      ? (repeatCustomers / uniqueCurrentCustomers) * 100
      : 0;

    const currentActiveCustomers = uniqueCurrentCustomers;
    const previousActiveCustomers = new Set(
      previousPeriodOrders.map((o) => o.userId).filter(Boolean)
    ).size;

    const lowStockCount = products.filter((p) => {
      if (!p.sizes) return false;
      return Object.values(p.sizes).some((stock) => stock > 0 && stock <= 3);
    }).length;

    const outOfStockCount = products.filter((p) => {
      if (!p.sizes) return true;
      return Object.values(p.sizes).every((stock) => stock === 0);
    }).length;

    return [
      {
        label: "Revenue",
        value: `\u20B9${currentRevenue.toLocaleString("en-IN")}`,
        delta: pctDelta(currentRevenue, previousRevenue),
        tone: "primary",
      },
      {
        label: "Orders",
        value: currentOrders.toLocaleString("en-IN"),
        delta: pctDelta(currentOrders, previousOrders),
        tone: "info",
      },
      {
        label: "AOV",
        value: `\u20B9${Math.round(currentAov).toLocaleString("en-IN")}`,
        delta: pctDelta(currentAov, previousAov),
        tone: "success",
      },
      {
        label: "Active Customers",
        value: currentActiveCustomers.toLocaleString("en-IN"),
        delta: pctDelta(currentActiveCustomers, previousActiveCustomers),
        tone: "primary",
      },
      {
        label: "Repeat Rate",
        value: `${repeatRate.toFixed(1)}%`,
        delta: `${repeatCustomers} repeat customers`,
        tone: "warning",
      },
      {
        label: "Low Stock",
        value: lowStockCount.toString(),
        delta: outOfStockCount > 0 ? `${outOfStockCount} Out` : "All Good",
        tone: lowStockCount > 0 || outOfStockCount > 0 ? "warning" : "info",
      },
    ];
  }, [currentPeriodOrders, previousPeriodOrders, products]);

  const traffic = useMemo(() => {
    const { points, subtitle } = rangeMeta[range];
    const labels = [];
    const orderSeries = new Array(points).fill(0);
    const revenueSeries = new Array(points).fill(0);
    const activeUserSets = Array.from({ length: points }, () => new Set());

    for (let i = points - 1; i >= 0; i -= 1) {
      const d = shiftDate(latestDate, range, -i);
      labels.push(
        range === "day"
          ? d.toLocaleDateString(undefined, { day: "2-digit", month: "short" })
          : range === "month"
            ? d.toLocaleDateString(undefined, { month: "short" })
            : String(d.getFullYear())
      );
    }

    safeOrders.forEach((order) => {
      const od = order.date;
      for (let i = 0; i < points; i += 1) {
        const d = shiftDate(latestDate, range, -(points - 1 - i));
        const match = inSameBucket(od, d, range);

        if (match) {
          orderSeries[i] += 1;
          revenueSeries[i] += order.total;
          if (order.userId) activeUserSets[i].add(order.userId);
          break;
        }
      }
    });

    const activeUsersSeries = activeUserSets.map((set) => set.size);
    return { labels, subtitle, orderSeries, activeUsersSeries, revenueSeries };
  }, [safeOrders, range, latestDate]);

  const { labels, subtitle, orderSeries, activeUsersSeries, revenueSeries } = traffic;
  const maxValue = Math.max(1, ...orderSeries, ...activeUsersSeries, ...revenueSeries);

  const toPolyline = (series) =>
    series
      .map((value, i) => {
        const x = labels.length === 1 ? 50 : (i / (labels.length - 1)) * 100;
        const y = 92 - (value / maxValue) * 72;
        return `${x},${y}`;
      })
      .join(" ");

  const recentOrders = useMemo(() => {
    return [...currentPeriodOrders]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [currentPeriodOrders]);

  const topProducts = useMemo(() => {
    const counts = {};
    currentPeriodOrders.forEach((o) => {
      o.items?.forEach((item) => {
        counts[item.id] = (counts[item.id] || 0) + (item.qty || 1);
      });
    });

    return Object.entries(counts)
      .map(([id, sales]) => {
        const product = products.find((p) => p.id === id);
        return {
          id,
          name: product?.title || id,
          sales,
        };
      })
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [currentPeriodOrders, products]);

  const paymentMix = useMemo(() => {
    const groups = currentPeriodOrders.reduce((acc, order) => {
      const key = (order.paymentMode || "Unknown").toUpperCase();
      acc[key] = (acc[key] || 0) + order.total;
      return acc;
    }, {});
    const total = Object.values(groups).reduce((sum, v) => sum + v, 0);
    return Object.entries(groups)
      .map(([mode, amount]) => ({
        mode,
        amount,
        percent: total ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [currentPeriodOrders]);

  return (
    <>
      <section className="adm-quick-actions">
        <div className="adm-widget-head">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Zap size={20} color="var(--adm-primary)" fill="var(--adm-primary)" style={{ opacity: 0.8 }} />
            <h2 style={{ fontSize: "18px" }}>Quick Actions</h2>
          </div>
        </div>
        <div className="adm-action-btns">
          <button onClick={() => navigate("/admin/products/add")} className="adm-action-btn">
            <div className="btn-icon" style={{ background: "rgba(50, 31, 219, 0.1)", color: "#321fdb" }}>
              <Plus size={20} />
            </div>
            <span>Add Product</span>
          </button>

          <button onClick={() => navigate("/admin/content")} className="adm-action-btn">
            <div className="btn-icon" style={{ background: "rgba(56, 150, 240, 0.1)", color: "#3896f0" }}>
              <Edit size={20} />
            </div>
            <span>Edit Content</span>
          </button>

          <button onClick={() => navigate("/admin/maintenance-room")} className="adm-action-btn">
            <div className="btn-icon" style={{ background: "rgba(222, 90, 89, 0.1)", color: "#de5a59" }}>
              <Hammer size={20} />
            </div>
            <span>Maintenance</span>
          </button>

          <button onClick={() => window.open("/", "_blank")} className="adm-action-btn">
            <div className="btn-icon" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
              <ExternalLink size={20} />
            </div>
            <span>View Shop</span>
          </button>
        </div>
      </section>

      <section className="adm-metric-grid adm-metric-grid-analytics" aria-label="Admin metrics">
        {metrics.map((item) => (
          <article key={item.label} className={`adm-metric-card ${item.tone}`}>
            <p>{item.label}</p>
            <strong>{item.value}</strong>
            <span>{item.delta}</span>
          </article>
        ))}
      </section>

      <section className="adm-widgets">
        <article className="adm-widget">
          <div className="adm-widget-head">
            <div>
              <h2>Recent Orders</h2>
              <span>Track your latest shop activity</span>
            </div>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table adm-table-compact">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={`${o.id}-${o.date.toISOString()}`}>
                    <td style={{ fontWeight: 600, color: "var(--adm-primary)" }}>#{String(o.id || "ORDER").slice(-6)}</td>
                    <td>{o.address?.firstName || "Guest"}</td>
                    <td>{"\u20B9"}{o.total.toLocaleString("en-IN")}</td>
                    <td>{new Date(o.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="adm-widget">
          <div className="adm-widget-head">
            <div>
              <h2>Top Products</h2>
              <span>Your best sellers in this {rangeMeta[range].label.toLowerCase()} period</span>
            </div>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table adm-table-compact">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>ID</th>
                  <th>Sales</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td style={{ fontSize: "12px", color: "#64748b" }}>{p.id}</td>
                    <td style={{ fontWeight: 600 }}>{p.sales} Sold</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="adm-widget">
          <div className="adm-widget-head">
            <div>
              <h2>Payment Mix</h2>
              <span>Revenue split by payment mode</span>
            </div>
          </div>
          <div className="adm-mix-list">
            {paymentMix.map((mode) => (
              <div className="adm-mix-row" key={mode.mode}>
                <div className="adm-mix-label">
                  <strong>{mode.mode}</strong>
                  <span>{"\u20B9"}{Math.round(mode.amount).toLocaleString("en-IN")}</span>
                </div>
                <div className="adm-mix-bar">
                  <span style={{ width: `${Math.max(2, mode.percent)}%` }} />
                </div>
                <small>{mode.percent.toFixed(1)}%</small>
              </div>
            ))}
            {paymentMix.length === 0 && <p className="adm-empty-note">No payment data available for this period.</p>}
          </div>
        </article>

        <article className="adm-widget adm-chart-widget">
          <div className="adm-widget-head">
            <div>
              <h2>Analytics Trend</h2>
              <span>{subtitle}</span>
            </div>
            <div className="adm-range-tabs" role="tablist" aria-label="Range selector">
              <button
                type="button"
                className={range === "day" ? "active" : ""}
                onClick={() => setRange("day")}
              >
                Day
              </button>
              <button
                type="button"
                className={range === "month" ? "active" : ""}
                onClick={() => setRange("month")}
              >
                Month
              </button>
              <button
                type="button"
                className={range === "year" ? "active" : ""}
                onClick={() => setRange("year")}
              >
                Year
              </button>
            </div>
          </div>
          <div className="adm-line-chart" aria-hidden="true">
            <div className="adm-line-grid" />
            <svg className="adm-line-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline className="adm-line-orders" points={toPolyline(orderSeries)} />
              <polyline className="adm-line-users" points={toPolyline(activeUsersSeries)} />
              <polyline className="adm-line-revenue" points={toPolyline(revenueSeries)} />
            </svg>
            <div className="adm-line-legend">
              <span><i className="orders" /> Orders</span>
              <span><i className="users" /> Active Users</span>
              <span><i className="revenue" /> Revenue</span>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
