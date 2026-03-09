import { useEffect, useMemo, useState } from "react";
import "../AdminLayout.css";
import "./AdminPages.css";
import { fetchSingleton, getApiBaseUrl, isStaticDataMode } from "../../../utils/api";

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
    const fetchContent = async () => {
      try {
        const data = await fetchSingleton("content");
        if (data) {
          setForm(data);
          localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(data));
          return;
        }
        const raw = localStorage.getItem(CONTENT_STORAGE_KEY);
        if (raw) {
          setForm(JSON.parse(raw));
        }
      } catch (err) {
        console.error("Failed to fetch content:", err);
      }
    };
    fetchContent();
  }, []);

  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(DEFAULT_CONTENT);
  }, [form]);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(form));

      if (!isStaticDataMode()) {
        const response = await fetch(`${getApiBaseUrl()}/content`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!response.ok) throw new Error("Server save failed");
      }

      setSavedAt(new Date().toLocaleTimeString());
      alert("Changes saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save to server, saved locally instead.");
      setSavedAt(new Date().toLocaleTimeString() + " (Local)");
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset to default content?")) return;

    setForm(DEFAULT_CONTENT);
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(DEFAULT_CONTENT));
    try {
      if (!isStaticDataMode()) {
        await fetch(`${getApiBaseUrl()}/content`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(DEFAULT_CONTENT),
        });
      }
    } catch (err) {
      console.error("Reset failed on server:", err);
    }
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
        <button
          type="button"
          className="adm-btn success adm-btn-save-content"
          onClick={handleSave}
          disabled={!isDirty}
        >
          Save Changes
        </button>
      </div>
    </section>
  );
}
