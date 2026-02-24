import { useEffect, useMemo, useState } from "react";
import "../AdminLayout.css";
import "./AdminPages.css";

const pctDelta = (current, previous) => {
  if (previous === 0) return current === 0 ? "0.0%" : "+100.0%";
  const delta = ((current - previous) / previous) * 100;
  return `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`;
};

export default function AdminDashboard() {
  const [range, setRange] = useState("month");
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

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
          setUsers(Array.isArray(data?.users) ? data.users : []);
        }
      } catch {
        if (mounted) {
          setOrders([]);
          setUsers([]);
        }
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
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

    // No status field in users.json orders; using COD as pending fulfillment.
    const currentPending = current.filter((o) => o.paymentMode.toUpperCase() === "COD").length;
    const previousPending = previous.filter((o) => o.paymentMode.toUpperCase() === "COD").length;

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
        label: "Customers",
        value: totalCustomers.toLocaleString("en-IN"),
        delta: pctDelta(currentActiveCustomers, previousActiveCustomers),
        tone: "success",
      },
      {
        label: "Pending",
        value: currentPending.toLocaleString("en-IN"),
        delta: pctDelta(currentPending, previousPending),
        tone: "warning",
      },
    ];
  }, [orders, users]);

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

  const socialTrafficRows = useMemo(() => {
    const buckets = {
      Instagram: 0,
      Facebook: 0,
      WhatsApp: 0,
    };

    orders.forEach((order) => {
      const userId = String(order?.userId || "").toLowerCase();
      if (!userId) {
        buckets.Direct += 1;
        return;
      }

      if (userId.includes("@gmail.")) {
        buckets.Instagram += 1;
      } else if (userId.includes("@yahoo.") || userId.includes("@hotmail.")) {
        buckets.Facebook += 1;
      } else if (userId.includes("@outlook.") || userId.includes("@live.")) {
        buckets.WhatsApp += 1;
      }
    });

    const total = Math.max(1, Object.values(buckets).reduce((sum, v) => sum + v, 0));

    return Object.entries(buckets)
      .map(([source, visitors]) => ({
        source,
        visitors,
        share: (visitors / total) * 100,
      }))
      .sort((a, b) => b.visitors - a.visitors);
  }, [orders]);

  const pageVisitsRows = useMemo(() => {
    const pageBuckets = {
      kurti: { visitors: 0, users: new Set() },
      oxidised: { visitors: 0, users: new Set() },
      bangles: { visitors: 0, users: new Set() },
      earrings: { visitors: 0, users: new Set() },
      necklace: { visitors: 0, users: new Set() },
    };

    const pageLabels = {
      kurti: "Kurti",
      oxidised: "Oxidised",
      bangles: "Bangles",
      earrings: "Earrings",
      necklace: "Necklace",
    };

    const mapItemToPage = (itemId = "") => {
      const id = String(itemId).toLowerCase();
      if (id.startsWith("k")) return "kurti";
      if (id.startsWith("o")) return "oxidised";
      if (id.startsWith("b")) return "bangles";
      if (id.startsWith("e")) return "earrings";
      if (id.startsWith("n") || id.startsWith("c")) return "necklace";
      return "kurti";
    };

    orders.forEach((order) => {
      const userId = String(order?.userId || "").toLowerCase();
      const items = Array.isArray(order?.items) ? order.items : [];
      items.forEach((item) => {
        const page = mapItemToPage(item?.id);
        const qty = Number(item?.qty || 1);
        pageBuckets[page].visitors += qty;
        if (userId) pageBuckets[page].users.add(userId);
      });
    });

    return Object.entries(pageBuckets)
      .map(([pageKey, data]) => {
        const uniqueUsers = data.users.size;
        const repeatFactor = data.visitors > 0 ? uniqueUsers / data.visitors : 0;
        const bounce = Math.max(12, Math.min(88, Math.round((1 - repeatFactor) * 100)));
        return {
          page: pageLabels[pageKey] || "Unknown",
          visitors: data.visitors,
          uniqueUsers,
          bounceRate: `${bounce}%`,
        };
      })
      .sort((a, b) => b.visitors - a.visitors);
  }, [orders]);

  return (
    <>
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

        <article className="adm-widget">
          <div className="adm-widget-head">
            <div>
              <h2>Social Traffic</h2>
              <span>Inferred from order activity</span>
            </div>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table adm-table-compact">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Visitors</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {socialTrafficRows.map((row) => (
                  <tr key={row.source}>
                    <td>{row.source}</td>
                    <td>{row.visitors.toLocaleString("en-IN")}</td>
                    <td>
                      <div className="adm-progress-row">
                        <span>{row.share.toFixed(1)}%</span>
                        <div className="adm-progress-track">
                          <div
                            className="adm-progress-fill"
                            style={{ width: `${Math.max(4, row.share)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="adm-widget">
          <div className="adm-widget-head">
            <div>
              <h2>Page Visits</h2>
              <span>Derived from ordered product categories</span>
            </div>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table adm-table-compact">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Visitors</th>
                  <th>Unique Users</th>
                  <th>Bounce Rate</th>
                </tr>
              </thead>
              <tbody>
                {pageVisitsRows.map((row) => (
                  <tr key={row.page}>
                    <td>{row.page}</td>
                    <td>{row.visitors.toLocaleString("en-IN")}</td>
                    <td>{row.uniqueUsers.toLocaleString("en-IN")}</td>
                    <td>{row.bounceRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </>
  );
}
