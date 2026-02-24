import { useEffect, useMemo, useRef, useState } from "react";
import "../AdminLayout.css";
import "./AdminPages.css";

const PAGE_SIZE = 20;
const PRODUCTS_API_URL = `${process.env.PUBLIC_URL}/data/products.json`;

const toTitleCase = (value = "") =>
  String(value)
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "kurti",
    price: "",
    stock: "",
  });
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef(null);

  const productRows = useMemo(() => {
    return products.map((product) => {
      const sizes = product?.sizes && typeof product.sizes === "object" ? product.sizes : {};
      const stock = Object.values(sizes).reduce((sum, qty) => sum + (Number(qty) || 0), 0);
      const status = stock === 0 ? "Draft" : stock <= 8 ? "Low" : "Active";
      const categoryLabel =
        product?.category?.charAt(0).toUpperCase() + product?.category?.slice(1);

      return {
        id: String(product?.id || "").toUpperCase(),
        name: product?.title || "Untitled Product",
        category: categoryLabel || "Uncategorized",
        price: `\u20B9${Number(product?.price || 0).toLocaleString("en-IN")}`,
        stock,
        status,
      };
    });
  }, [products]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(productRows.map((row) => row.category)));
    return ["All", ...unique];
  }, [productRows]);

  const filtered = useMemo(() => {
    return productRows.filter((row) => {
      const matchSearch = row.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "All" || row.category === category;
      return matchSearch && matchCategory;
    });
  }, [productRows, search, category]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    let ignore = false;

    const loadProducts = async () => {
      try {
        const res = await fetch(PRODUCTS_API_URL, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        if (!ignore) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!ignore) {
          setProducts([]);
        }
      }
    };

    loadProducts();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setIsCategoryMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    const title = form.title.trim();
    const categoryValue = form.category.trim().toLowerCase();
    const priceValue = Number(form.price);
    const stockValue = Number(form.stock);

    if (!title || !categoryValue || Number.isNaN(priceValue) || Number.isNaN(stockValue)) {
      return;
    }

    const prefix = categoryValue.charAt(0) || "p";
    const maxIndex = products
      .filter((p) => String(p?.id || "").toLowerCase().startsWith(prefix))
      .map((p) => Number(String(p?.id || "").slice(1)))
      .filter((n) => Number.isFinite(n))
      .reduce((max, n) => Math.max(max, n), 0);

    const nextId = `${prefix}${maxIndex + 1}`;
    const nextProduct = {
      id: nextId,
      title,
      images: ["images/placeholder.jpg"],
      price: priceValue,
      oldPrice: priceValue,
      category: categoryValue,
      sizes: { Free: Math.max(0, stockValue) },
      details: {
        colour: "N/A",
        material: "N/A",
        size: "Free Size",
      },
    };

    setIsSaving(true);
    setProducts((prev) => [nextProduct, ...prev]);

    try {
      // Optional persistence endpoint (if your local API/server supports writes).
      await fetch("http://localhost:5000/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextProduct),
      });
    } catch {
      // Keep UI update even when persistence API is unavailable.
    } finally {
      setIsSaving(false);
      setIsAddOpen(false);
      setForm({ title: "", category: "kurti", price: "", stock: "" });
      setPage(1);
    }
  };

  return (
    <section className="adm-widget">
      <div className="adm-widget-head">
        <h2>Products</h2>
        <button
          type="button"
          className="adm-btn primary"
          onClick={() => setIsAddOpen((prev) => !prev)}
        >
          {isAddOpen ? "Close" : "Add Product"}
        </button>
      </div>

      {isAddOpen && (
        <form className="adm-product-add-form" onSubmit={handleAddProduct}>
          <input
            className="adm-input"
            placeholder="Product title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
          <input
            className="adm-input"
            placeholder="Category (kurti, earrings, oxidised...)"
            value={form.category}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, category: e.target.value.toLowerCase() }))
            }
            required
          />
          <input
            className="adm-input"
            type="number"
            min="1"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            required
          />
          <input
            className="adm-input"
            type="number"
            min="0"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
            required
          />
          <button type="submit" className="adm-btn primary" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Product"}
          </button>
        </form>
      )}

      <div className="adm-controls">
        <input
          className="adm-input"
          placeholder="Search product"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <div className="adm-status-menu" ref={categoryMenuRef}>
          <button
            type="button"
            className="adm-select adm-select-inline"
            onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isCategoryMenuOpen}
          >
            {category}
            <span className={`adm-select-caret ${isCategoryMenuOpen ? "open" : ""}`} />
          </button>
          {isCategoryMenuOpen && (
            <ul className="adm-status-menu-list" role="listbox" aria-label="Filter products by category">
              {categories.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className={`adm-status-option ${item === category ? "active" : ""}`}
                    onClick={() => {
                      setCategory(item);
                      setPage(1);
                      setIsCategoryMenuOpen(false);
                    }}
                    role="option"
                    aria-selected={item === category}
                  >
                    <span>{toTitleCase(item)}</span>
                    {item === category && <span className="adm-status-check">v</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.category}</td>
                <td>{row.price}</td>
                <td>{row.stock}</td>
                <td>
                  <span className={`adm-status ${row.status.toLowerCase()}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="adm-pagination" aria-label="Pagination">
        {Array.from({ length: pages }).map((_, index) => {
          const number = index + 1;
          return (
            <button
              key={number}
              type="button"
              className={`adm-page-btn ${number === page ? "active" : ""}`}
              onClick={() => setPage(number)}
            >
              {number}
            </button>
          );
        })}
      </div>
    </section>
  );
}
