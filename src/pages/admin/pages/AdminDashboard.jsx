import "../AdminLayout.css";
import "./AdminPages.css";

const METRICS = [
  { label: "Revenue", value: "\u20B94,82,400", delta: "+12.3%", tone: "primary" },
  { label: "Orders", value: "1,284", delta: "+8.7%", tone: "info" },
  { label: "Customers", value: "934", delta: "+5.2%", tone: "success" },
  { label: "Pending", value: "47", delta: "-2.1%", tone: "warning" },
];

export default function AdminDashboard() {
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
              <span>January - July 2023</span>
            </div>
            <div className="adm-range-tabs" role="tablist" aria-label="Range selector">
              <button type="button">Day</button>
              <button type="button" className="active">Month</button>
              <button type="button">Year</button>
            </div>
          </div>
          <div className="adm-line-chart" aria-hidden="true">
            <div className="adm-line-grid" />
            <div className="adm-line adm-line-blue" />
            <div className="adm-line adm-line-green" />
          </div>
        </article>
      </section>
    </>
  );
}
