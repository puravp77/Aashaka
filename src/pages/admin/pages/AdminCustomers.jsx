import { useMemo, useState } from "react";
import "../AdminLayout.css";
import "./AdminPages.css";

const CUSTOMER_ROWS = [
  { name: "Neha Sharma", email: "neha@gmail.com", segment: "VIP", orders: 16 },
  { name: "Riya Das", email: "riya@gmail.com", segment: "Regular", orders: 8 },
  { name: "Kavya Patel", email: "kavya@gmail.com", segment: "VIP", orders: 13 },
  { name: "Sonia Verma", email: "sonia@gmail.com", segment: "New", orders: 2 },
  { name: "Aarti Gupta", email: "aarti@gmail.com", segment: "Regular", orders: 6 },
];

export default function AdminCustomers() {
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    return CUSTOMER_ROWS.filter((row) =>
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <section className="adm-widget">
      <div className="adm-widget-head">
        <h2>Customers</h2>
        <span>Static preview</span>
      </div>

      <div className="adm-controls">
        <input
          className="adm-input"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Segment</th>
              <th>Orders</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.email}>
                <td>{row.name}</td>
                <td>{row.email}</td>
                <td>{row.segment}</td>
                <td>{row.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
