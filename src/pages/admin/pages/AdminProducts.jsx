import { useMemo, useState } from "react";
import "../AdminLayout.css";
import "./AdminPages.css";

const PRODUCT_ROWS = [
  { id: "PRD-204", name: "Oxidised Temple Set", category: "Jewellery", price: "\u20B93,490", stock: 26, status: "Active" },
  { id: "PRD-198", name: "Ruby Choker", category: "Jewellery", price: "\u20B92,760", stock: 12, status: "Active" },
  { id: "PRD-175", name: "Floral Kurti Set", category: "Kurti", price: "\u20B91,980", stock: 8, status: "Low" },
  { id: "PRD-162", name: "Kundan Earrings", category: "Jewellery", price: "\u20B91,260", stock: 35, status: "Active" },
  { id: "PRD-144", name: "Mirror Work Kurti", category: "Kurti", price: "\u20B92,150", stock: 4, status: "Low" },
  { id: "PRD-139", name: "Festive Kada", category: "Bangles", price: "\u20B91,420", stock: 18, status: "Active" },
  { id: "PRD-121", name: "Layer Necklace", category: "Necklace", price: "\u20B92,890", stock: 0, status: "Draft" },
];

const PAGE_SIZE = 5;

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return PRODUCT_ROWS.filter((row) => {
      const matchSearch = row.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "All" || row.category === category;
      return matchSearch && matchCategory;
    });
  }, [search, category]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="adm-widget">
      <div className="adm-widget-head">
        <h2>Products</h2>
        <span>Static preview</span>
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
          <option>All</option>
          <option>Jewellery</option>
          <option>Kurti</option>
          <option>Bangles</option>
          <option>Necklace</option>
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
