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
        const isLocal = process.env.NODE_ENV === "development";
        const usersUrl = isLocal ? "http://localhost:5000/users" : `${process.env.PUBLIC_URL}/data/users.json`;
        const ordersUrl = isLocal ? "http://localhost:5000/orders" : `${process.env.PUBLIC_URL}/data/users.json`;

        const [uRes, oRes] = await Promise.all([
          fetch(usersUrl, { cache: "no-store" }),
          fetch(ordersUrl, { cache: "no-store" }),
        ]);

        if (!uRes.ok || !oRes.ok) throw new Error("Failed to fetch data");

        const uData = await uRes.json();
        const oData = await oRes.json();

        const users = Array.isArray(uData) ? uData : (uData.users || []);
        const orders = Array.isArray(oData) ? oData : (oData.orders || []);

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
