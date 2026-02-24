import { useEffect, useMemo, useState } from "react";
import "../AdminLayout.css";
import "./AdminPages.css";

export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadUsers = async () => {
      try {
        const res = await fetch(`${process.env.PUBLIC_URL}/data/users.json`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch users data");

        const data = await res.json();
        const users = Array.isArray(data?.users) ? data.users : [];
        const orders = Array.isArray(data?.orders) ? data.orders : [];

        const orderCountByUser = orders.reduce((acc, order) => {
          const userId = String(order?.userId || "").toLowerCase();
          if (!userId) return acc;
          acc[userId] = (acc[userId] || 0) + 1;
          return acc;
        }, {});

        const mapped = users
          .filter((user) => String(user?.role).toLowerCase() !== "admin")
          .map((user) => {
            const email = String(user?.id || "");
            const ordersCount = orderCountByUser[email.toLowerCase()] || 0;
            return {
              name: email.split("@")[0] || email || "User",
              email,
              orders: ordersCount,
            };
          });

        if (mounted && mapped.length > 0) {
          setRows(mapped);
        }
      } catch {
        if (mounted) {
          setRows([]);
        }
      }
    };

    loadUsers();
    return () => {
      mounted = false;
    };
  }, []);

  const visible = useMemo(() => {
    return rows.filter((row) =>
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [rows, search]);

  return (
    <section className="adm-widget">
      <div className="adm-widget-head">
        <h2>Customers</h2>
        
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
              <th>Orders</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.email}>
                <td>{row.name}</td>
                <td>{row.email}</td>
                <td>{row.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
