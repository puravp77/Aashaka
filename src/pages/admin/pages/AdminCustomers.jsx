import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import "../AdminLayout.css";
import "./AdminPages.css";
import { fetchAdminCustomers } from "../../../utils/adminApi";

export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadUsers = async () => {
      setLoading(true);
      try {
        const users = await fetchAdminCustomers();
        const mapped = users.map((user) => ({
          name: user?.name || "User",
          email: user?.email || "-",
          orders: Number(user?.ordersCount || 0),
        }));

        if (mounted) {
          setRows(mapped);
        }
      } catch (error) {
        if (mounted) {
          setRows([]);
          toast.error(error.message || "Unable to load customers.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUsers();
    return () => {
      mounted = false;
    };
  }, []);

  const visible = useMemo(
    () =>
      rows.filter((row) =>
        row.name.toLowerCase().includes(search.toLowerCase()) ||
        row.email.toLowerCase().includes(search.toLowerCase())
      ),
    [rows, search]
  );

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
            {loading ? (
              <tr>
                <td className="adm-table-empty" colSpan="3">Loading customers...</td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td className="adm-table-empty" colSpan="3">No customers found.</td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={row.email}>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.orders}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
