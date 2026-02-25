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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [range, setRange] = useState("month");
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const isLocal = !window.location.hostname.includes("github.io");
        const usersUrl = isLocal ? "http://localhost:5000/users" : `${process.env.PUBLIC_URL}/data/users.json`;

        // Fetch users and orders (orders are inside users.json in some models, let's check)
        const uRes = await fetch(usersUrl, { cache: "no-store" });
        if (!uRes.ok) throw new Error("Failed to fetch users");
        const uData = await uRes.json();

        // If users.json is the full db (has orders/products)
        const fullData = uData.users ? uData : null;

        if (mounted) {
          if (fullData) {
            setOrders(fullData.orders || []);
            setUsers(fullData.users || []);
          } else {
            // Assuming uData is just the users array if fetched from /users
            setUsers(uData);
            // Fetch orders separately if they exist as a resource
            if (isLocal) {
              const [oRes, pRes] = await Promise.all([
                fetch("http://localhost:5000/orders"),
                fetch("http://localhost:5000/products")
              ]);
              if (oRes.ok) setOrders(await oRes.json());
              if (pRes.ok) setProducts(await pRes.json());
            } else {
              // Fallback for static host
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

  const metrics = useMemo(() => {
    const safeOrders = orders
      .map((order) => ({
        date: new Date(order?.date),
        total: Number(order?.total || 0),
        paymentMode: String(order?.paymentMode || ""),
        userId: String(order?.userId || "").toLowerCase(),
      }))
      .filter((order) => !Number.isNaN(order.date.getTime()));

    const latestDate = safeOrders.length
      ? new Date(Math.max(...safeOrders.map((o) => o.date.getTime())))
      : new Date();

    const currStart = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
    const nextStart = new Date(latestDate.getFullYear(), latestDate.getMonth() + 1, 1);
    const prevStart = new Date(latestDate.getFullYear(), latestDate.getMonth() - 1, 1);

    const current = safeOrders.filter((o) => o.date >= currStart && o.date < nextStart);
    const previous = safeOrders.filter((o) => o.date >= prevStart && o.date < currStart);

    const currentRevenue = current.reduce((sum, o) => sum + o.total, 0);
    const previousRevenue = previous.reduce((sum, o) => sum + o.total, 0);

    const currentOrders = current.length;
    const previousOrders = previous.length;

    const currentActiveCustomers = new Set(current.map((o) => o.userId).filter(Boolean)).size;
    const previousActiveCustomers = new Set(previous.map((o) => o.userId).filter(Boolean)).size;

    const lowStockCount = products.filter(p => {
      if (!p.sizes) return false;
      return Object.values(p.sizes).some(stock => stock > 0 && stock <= 3);
    }).length;

    const outOfStockCount = products.filter(p => {
      if (!p.sizes) return true;
      return Object.values(p.sizes).every(stock => stock === 0);
    }).length;
    const totalCustomers = users.filter(
      (u) => String(u?.role || "").toLowerCase() !== "admin"
    ).length;

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
        label: "Low Stock",
        value: lowStockCount.toString(),
        delta: outOfStockCount > 0 ? `${outOfStockCount} Out` : "All Good",
        tone: lowStockCount > 0 || outOfStockCount > 0 ? "warning" : "success",
      },
      {
        label: "Customers",
        value: totalCustomers.toLocaleString("en-IN"),
        delta: pctDelta(currentActiveCustomers, previousActiveCustomers),
        tone: "success",
      },
    ];
  }, [orders, users, products]);

  const traffic = useMemo(() => {
    const safeOrders = orders
      .map((order) => ({
        date: new Date(order?.date),
        userId: String(order?.userId || "").toLowerCase(),
      }))
      .filter((order) => !Number.isNaN(order.date.getTime()));

    const latestDate = safeOrders.length
      ? new Date(Math.max(...safeOrders.map((o) => o.date.getTime())))
      : new Date();

    const points = range === "day" ? 7 : range === "year" ? 5 : 6;
    const labels = [];
    const orderSeries = new Array(points).fill(0);
    const activeUserSets = Array.from({ length: points }, () => new Set());

    for (let i = points - 1; i >= 0; i -= 1) {
      const d = new Date(latestDate);
      if (range === "day") d.setDate(d.getDate() - i);
      if (range === "month") d.setMonth(d.getMonth() - i);
      if (range === "year") d.setFullYear(d.getFullYear() - i);
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
        const d = new Date(latestDate);
        if (range === "day") d.setDate(d.getDate() - (points - 1 - i));
        if (range === "month") d.setMonth(d.getMonth() - (points - 1 - i));
        if (range === "year") d.setFullYear(d.getFullYear() - (points - 1 - i));

        const match =
          range === "day"
            ? od.getFullYear() === d.getFullYear() &&
            od.getMonth() === d.getMonth() &&
            od.getDate() === d.getDate()
            : range === "month"
              ? od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth()
              : od.getFullYear() === d.getFullYear();

        if (match) {
          orderSeries[i] += 1;
          if (order.userId) activeUserSets[i].add(order.userId);
          break;
        }
      }
    });

    const activeUsersSeries = activeUserSets.map((set) => set.size);

    const subtitle =
      range === "day"
        ? "Last 7 days"
        : range === "month"
          ? "Last 6 months"
          : "Last 5 years";

    return { labels, subtitle, orderSeries, activeUsersSeries };
  }, [orders, range]);

  const { labels, subtitle, orderSeries, activeUsersSeries } = traffic;
  const maxValue = Math.max(1, ...orderSeries, ...activeUsersSeries);

  const toPolyline = (series) =>
    series
      .map((value, i) => {
        const x = labels.length === 1 ? 50 : (i / (labels.length - 1)) * 100;
        const y = 92 - (value / maxValue) * 72;
        return `${x},${y}`;
      })
      .join(" ");

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [orders]);

  const topProducts = useMemo(() => {
    const counts = {};
    orders.forEach(o => {
      o.items?.forEach(item => {
        counts[item.id] = (counts[item.id] || 0) + (item.qty || 1);
      });
    });

    return Object.entries(counts)
      .map(([id, sales]) => {
        const product = products.find(p => p.id === id);
        return {
          id,
          name: product?.title || id,
          sales,
        };
      })
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [orders, products]);

  return (
    <>
      <section className="adm-quick-actions">
        <div className="adm-widget-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} color="var(--adm-primary)" fill="var(--adm-primary)" style={{ opacity: 0.8 }} />
            <h2 style={{ fontSize: '18px' }}>Quick Actions</h2>
          </div>
        </div>
        <div className="adm-action-btns">
          <button onClick={() => navigate('/admin/products')} className="adm-action-btn">
            <div className="btn-icon" style={{ background: 'rgba(50, 31, 219, 0.1)', color: '#321fdb' }}>
              <Plus size={20} />
            </div>
            <span>Add Product</span>
          </button>

          <button onClick={() => navigate('/admin/content')} className="adm-action-btn">
            <div className="btn-icon" style={{ background: 'rgba(56, 150, 240, 0.1)', color: '#3896f0' }}>
              <Edit size={20} />
            </div>
            <span>Edit Content</span>
          </button>

          <button onClick={() => navigate('/admin/maintenance-room')} className="adm-action-btn">
            <div className="btn-icon" style={{ background: 'rgba(222, 90, 89, 0.1)', color: '#de5a59' }}>
              <Hammer size={20} />
            </div>
            <span>Maintenance</span>
          </button>

          <button onClick={() => window.open('/', '_blank')} className="adm-action-btn">
            <div className="btn-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <ExternalLink size={20} />
            </div>
            <span>View Shop</span>
          </button>
        </div>
      </section>

      <section className="adm-metric-grid" aria-label="Admin metrics">

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
                  <tr key={o.id}>
                    <td style={{ fontWeight: 600, color: 'var(--adm-primary)' }}>#{o.id.slice(-6)}</td>
                    <td>{o.address?.firstName || 'Guest'}</td>
                    <td>₹{o.total.toLocaleString("en-IN")}</td>
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
              <span>Your best sellers this period</span>
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
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{p.id}</td>
                    <td style={{ fontWeight: 600 }}>{p.sales} Sold</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="adm-widget adm-chart-widget">

          <div className="adm-widget-head">
            <div>
              <h2>Traffic</h2>
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
            </svg>
            <div className="adm-line-legend">
              <span><i className="orders" /> Orders</span>
              <span><i className="users" /> Active Users</span>
            </div>
          </div>
        </article>

      </section>
    </>
  );
}
