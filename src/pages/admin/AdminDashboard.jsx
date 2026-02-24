import "./AdminDashboard.css";

const METRICS = [
  { label: "Revenue", value: "?4,82,400", delta: "+12.3%", tone: "primary" },
  { label: "Orders", value: "1,284", delta: "+8.7%", tone: "info" },
  { label: "Customers", value: "934", delta: "+5.2%", tone: "success" },
  { label: "Pending", value: "47", delta: "-2.1%", tone: "warning" },
];

const SALES_ROWS = [
  { channel: "Instagram", orders: 426, revenue: "?1,54,200", conv: "4.8%" },
  { channel: "Website", orders: 512, revenue: "?2,11,000", conv: "5.3%" },
  { channel: "WhatsApp", orders: 198, revenue: "?74,900", conv: "3.9%" },
  { channel: "Marketplace", orders: 148, revenue: "?42,300", conv: "3.4%" },
];

const RECENT_ORDERS = [
  { id: "#AAS-1092", customer: "Neha Sharma", status: "Processing", amount: "?3,490" },
  { id: "#AAS-1088", customer: "Riya Das", status: "Shipped", amount: "?2,120" },
  { id: "#AAS-1087", customer: "Kavya Patel", status: "Delivered", amount: "?5,640" },
  { id: "#AAS-1085", customer: "Sonia Verma", status: "Pending", amount: "?1,780" },
  { id: "#AAS-1084", customer: "Aarti Gupta", status: "Delivered", amount: "?4,240" },
];

export default function AdminDashboard() {
  return (
    <section className="adm-page">
      <div className="adm-shell">
        <aside className="adm-sidebar">
          <div className="adm-logo">Aashaka</div>
          <p className="adm-logo-sub">Admin Console</p>

          <nav className="adm-nav" aria-label="Admin navigation">
            <button type="button" className="adm-nav-item active">Overview</button>
            <button type="button" className="adm-nav-item">Products</button>
            <button type="button" className="adm-nav-item">Orders</button>
            <button type="button" className="adm-nav-item">Customers</button>
            <button type="button" className="adm-nav-item">Marketing</button>
            <button type="button" className="adm-nav-item">Content</button>
            <button type="button" className="adm-nav-item">Settings</button>
          </nav>
        </aside>

        <main className="adm-main">
          <header className="adm-topbar">
            <div>
              <p className="adm-breadcrumb">Home / Admin / Dashboard</p>
              <h1>Dashboard</h1>
            </div>
            <div className="adm-top-actions">
              <button type="button" className="adm-btn ghost">Export</button>
              <button type="button" className="adm-btn primary">Create Product</button>
            </div>
          </header>

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
                <h2>Traffic & Sales</h2>
                <span>Last 7 days</span>
              </div>
              <div className="adm-chart" aria-hidden="true">
                <i style={{ height: "32%" }} />
                <i style={{ height: "58%" }} />
                <i style={{ height: "44%" }} />
                <i style={{ height: "71%" }} />
                <i style={{ height: "62%" }} />
                <i style={{ height: "80%" }} />
                <i style={{ height: "67%" }} />
              </div>
            </article>

            <article className="adm-widget">
              <div className="adm-widget-head">
                <h2>Sales Channels</h2>
                <span>Current month</span>
              </div>
              <div className="adm-table-wrap">
                <table className="adm-table compact">
                  <thead>
                    <tr>
                      <th>Channel</th>
                      <th>Orders</th>
                      <th>Revenue</th>
                      <th>Conv.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SALES_ROWS.map((row) => (
                      <tr key={row.channel}>
                        <td>{row.channel}</td>
                        <td>{row.orders}</td>
                        <td>{row.revenue}</td>
                        <td>{row.conv}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>

          <section className="adm-widget">
            <div className="adm-widget-head">
              <h2>Recent Orders</h2>
              <span>Latest updates</span>
            </div>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_ORDERS.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.customer}</td>
                      <td>
                        <span className={`adm-status ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{order.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </section>
  );
}
