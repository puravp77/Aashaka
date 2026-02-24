import { useEffect, useMemo, useState } from "react";
import "../AdminLayout.css";
import "./AdminPages.css";

const CONTENT_STORAGE_KEY = "admin_content_config";

const DEFAULT_CONTENT = {
  heroHeading: "Timeless Jewellery, Modern Grace",
  heroSubtitle: "Discover curated pieces crafted to elevate every day.",
  ctaLabel: "Explore Collection",
  ctaLink: "/jewellery/oxidised",
};

export default function AdminContent() {
  const [form, setForm] = useState(DEFAULT_CONTENT);
  const [savedAt, setSavedAt] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONTENT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setForm({ ...DEFAULT_CONTENT, ...parsed });
    } catch {
      setForm(DEFAULT_CONTENT);
    }
  }, []);

  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(DEFAULT_CONTENT);
  }, [form]);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSave = () => {
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(form));
    setSavedAt(new Date().toLocaleTimeString());
  };

  const handleReset = () => {
    setForm(DEFAULT_CONTENT);
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(DEFAULT_CONTENT));
    setSavedAt("");
  };

  return (
    <section className="adm-widget">
      <div className="adm-widget-head">
        <h2>Content</h2>
        <span>{savedAt ? `Saved at ${savedAt}` : "Static preview"}</span>
      </div>

      <div className="adm-content-grid">
        <article className="adm-card">
          <h3>Hero Section</h3>
          <label>
            Heading
            <input className="adm-input" value={form.heroHeading} onChange={handleChange("heroHeading")} />
          </label>
          <label>
            Subtitle
            <input className="adm-input" value={form.heroSubtitle} onChange={handleChange("heroSubtitle")} />
          </label>
        </article>

        <article className="adm-card">
          <h3>Homepage Banner</h3>
          <label>
            CTA Label
            <input className="adm-input" value={form.ctaLabel} onChange={handleChange("ctaLabel")} />
          </label>
          <label>
            CTA Link
            <input className="adm-input" value={form.ctaLink} onChange={handleChange("ctaLink")} />
          </label>
        </article>
      </div>

      <div className="adm-content-actions">
        <button type="button" className="adm-btn ghost" onClick={handleReset}>
          Reset
        </button>
        <button type="button" className="adm-btn primary" onClick={handleSave} disabled={!isDirty}>
          Save Changes
        </button>
      </div>
    </section>
  );
}
