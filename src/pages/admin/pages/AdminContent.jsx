import "../AdminLayout.css";
import "./AdminPages.css";

export default function AdminContent() {
  return (
    <section className="adm-widget">
      <div className="adm-widget-head">
        <h2>Content</h2>
        <span>Static preview</span>
      </div>

      <div className="adm-content-grid">
        <article className="adm-card">
          <h3>Hero Section</h3>
          <label>
            Heading
            <input className="adm-input" defaultValue="Timeless Jewellery, Modern Grace" />
          </label>
          <label>
            Subtitle
            <input className="adm-input" defaultValue="Discover curated pieces crafted to elevate every day." />
          </label>
        </article>

        <article className="adm-card">
          <h3>Homepage Banner</h3>
          <label>
            CTA Label
            <input className="adm-input" defaultValue="Explore Collection" />
          </label>
          <label>
            CTA Link
            <input className="adm-input" defaultValue="/jewellery/oxidised" />
          </label>
        </article>
      </div>
    </section>
  );
}
