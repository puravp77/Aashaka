import { useEffect, useMemo, useState } from "react";
import "../AdminLayout.css";
import "./AdminPages.css";

const FALLBACK_ROWS = [
  { name: "Neha Sharma", email: "neha@gmail.com", segment: "VIP", orders: 16 },
  { name: "Riya Das", email: "riya@gmail.com", segment: "Regular", orders: 8 },
  { name: "Kavya Patel", email: "kavya@gmail.com", segment: "VIP", orders: 13 },
  { name: "Sonia Verma", email: "sonia@gmail.com", segment: "New", orders: 2 },
  { name: "Aarti Gupta", email: "aarti@gmail.com", segment: "Regular", orders: 6 },
];

const getSegment = (ordersCount) => {
  if (ordersCount >= 10) return "VIP";
  if (ordersCount >= 3) return "Regular";
  return "New";
};

export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState(FALLBACK_ROWS);

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
              segment: getSegment(ordersCount),
              orders: ordersCount,
            };
          });

        if (mounted && mapped.length > 0) {
          setRows(mapped);
        }
      } catch {
        if (mounted) {
          setRows(FALLBACK_ROWS);
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
