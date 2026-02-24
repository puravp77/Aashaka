import { useMemo, useState } from "react";
import "../AdminLayout.css";
import "./AdminPages.css";
import allProducts from "../../../data/allProducts";

const PAGE_SIZE = 20;

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);

  const productRows = useMemo(() => {
    return allProducts.map((product) => {
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
  }, []);

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

  return (
    <section className="adm-widget">
      <div className="adm-widget-head">
        <h2>Products</h2>
        
      </div>

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
        <select
          className="adm-select"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
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
