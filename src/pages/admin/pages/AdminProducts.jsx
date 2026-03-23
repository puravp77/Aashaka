import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Edit2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import "../AdminLayout.css";
import "./AdminPages.css";
import { deleteAdminProduct, fetchAdminProducts } from "../../../utils/adminApi";

const PAGE_SIZE = 15;

const toTitleCase = (value = "") =>
  String(value)
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function AdminProducts() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef(null);

  const productRows = useMemo(
    () =>
      products.map((product) => {
        const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
        const stock = sizes.reduce(
          (sum, entry) => sum + (Number(entry?.quantity) || 0),
          0
        );
        const status = stock === 0 ? "Draft" : stock <= 8 ? "Low" : "Active";
        const categoryLabel =
          product?.category?.charAt(0).toUpperCase() + product?.category?.slice(1);

        return {
          id: String(product?._id || "").toUpperCase(),
          rawId: String(product?._id || ""),
          name: product?.name || "Untitled Product",
          category: categoryLabel || "Uncategorized",
          price: `₹${Number(product?.price || 0).toLocaleString("en-IN")}`,
          image: Array.isArray(product?.images) ? product.images[0] || "" : "",
          sizesLabel:
            sizes.length > 0
              ? sizes
                  .map((entry) =>
                    String(entry?.size || "").toLowerCase() === "free"
                      ? "Free Size"
                      : `${entry.size}: ${entry.quantity}`
                  )
                  .join(", ")
              : "No sizes",
          stock,
          status,
        };
      }),
    [products]
  );

  const categories = useMemo(() => {
    const unique = Array.from(new Set(productRows.map((row) => row.category)));
    return ["All", ...unique];
  }, [productRows]);

  const filtered = useMemo(
    () =>
      productRows.filter((row) => {
        const matchSearch = row.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory = category === "All" || row.category === category;
        return matchSearch && matchCategory;
      }),
    [productRows, search, category]
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const loadProducts = async () => {
    try {
      const data = await fetchAdminProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading products:", err);
      setProducts([]);
      toast.error(err.message || "Unable to load products.");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (productId) => {
    if (!window.confirm(`Are you sure you want to delete product ${productId}?`)) return;

    try {
      await deleteAdminProduct(productId);
      setProducts((prev) =>
        prev.filter(
          (product) => String(product?._id || "") !== String(productId)
        )
      );
      toast.success("Product deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error deleting product");
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setIsCategoryMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <section className="adm-widget" style={{ position: "relative", overflow: "visible" }}>
      <div className="adm-widget-head">
        <h2>Products</h2>
        <button
          type="button"
          className="adm-btn primary"
          onClick={() => navigate("/admin/products/add")}
        >
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      <div className="adm-controls" style={{ position: "relative", zIndex: 80, overflow: "visible" }}>
        <div className="adm-search-input-wrap">
          <Search size={18} className="adm-search-icon" />
          <input
            className="adm-input"
            placeholder="Search product..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div
          className="adm-status-menu"
          ref={categoryMenuRef}
          style={{ position: "relative", zIndex: 90, overflow: "visible" }}
        >
          <button
            type="button"
            className="adm-select adm-select-inline"
            onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isCategoryMenuOpen}
          >
            <Filter size={16} style={{ marginRight: "8px", opacity: 0.7 }} />
            {category}
            <span className={`adm-select-caret ${isCategoryMenuOpen ? "open" : ""}`} />
          </button>
          {isCategoryMenuOpen && (
            <ul
              className="adm-status-menu-list"
              role="listbox"
              aria-label="Filter products by category"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                left: "auto",
                minWidth: "220px",
                maxHeight: "320px",
                overflowY: "auto",
                zIndex: 9999,
              }}
            >
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
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="adm-table-wrap" style={{ position: "relative", zIndex: 1 }}>
        <table className="adm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Category</th>
              <th>Image</th>
              <th>Sizes</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th className="adm-text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id}>
                <td className="adm-font-mono">{row.id}</td>
                <td style={{ fontWeight: 500 }}>{row.name}</td>
                <td>{row.category}</td>
                <td>{row.image || "No image"}</td>
                <td>{row.sizesLabel}</td>
                <td>{row.price}</td>
                <td>{row.stock}</td>
                <td>
                  <span className={`adm-status ${row.status.toLowerCase()}`}>
                    {row.status}
                  </span>
                </td>
                <td className="adm-text-right">
                  <div className="adm-row-actions">
                    <button
                      className="adm-icon-btn"
                      title="Edit"
                      onClick={() => navigate(`/admin/products/edit/${row.rawId}`)}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="adm-icon-btn danger"
                      title="Delete"
                      onClick={() => handleDelete(row.rawId)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
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
