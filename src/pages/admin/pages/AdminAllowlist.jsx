import "../AdminLayout.css";
import "./AdminPages.css";
import ADMIN_ACCESS_USERS from "../adminAccess";

export default function AdminAllowlist() {
  return (
    <section className="adm-widget">
      <div className="adm-widget-head">
        <h2>Admin Allowlist</h2>
        <span>Only these users can access admin panel</span>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {ADMIN_ACCESS_USERS.map((row) => (
              <tr key={`${row.username}-${row.email}`}>
                <td>{row.username}</td>
                <td>{row.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
