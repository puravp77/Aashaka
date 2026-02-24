import { useEffect, useMemo, useState } from "react";
import "../AdminLayout.css";
import "./AdminPages.css";

const METRICS = [
  { label: "Revenue", value: "\u20B94,82,400", delta: "+12.3%", tone: "primary" },
  { label: "Orders", value: "1,284", delta: "+8.7%", tone: "info" },
  { label: "Customers", value: "934", delta: "+5.2%", tone: "success" },
  { label: "Pending", value: "47", delta: "-2.1%", tone: "warning" },
];

export default function AdminDashboard() {
  const [range, setRange] = useState("month");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const res = await fetch(`${process.env.PUBLIC_URL}/data/users.json`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const data = await res.json();
        if (mounted) {
          setOrders(Array.isArray(data?.orders) ? data.orders : []);
        }
      } catch {
        if (mounted) setOrders([]);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

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

  return (
    <>
      <section className="adm-metric-grid" aria-label="Admin metrics">
        {METRICS.map((item) => (
          <article key={item.label} className={`adm-metric-card ${item.tone}`}>
            <p>{item.label}</p>
            <strong>{item.value}</strong>
            <span>{item.delta}</span>
          </article>
        ))}
      </section>

      <section className="adm-widgets">
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
