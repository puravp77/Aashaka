import { useEffect, useMemo, useState } from "react";
import {
  UserPlus,
  Trash2,
  ShieldCheck,
  Mail,
  User as UserIcon,
  Search,
  Loader2,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { toast } from "react-toastify";
import "../AdminLayout.css";
import "./AdminPages.css";
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
} from "../../../utils/adminApi";

export default function AdminAllowlist() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: "", email: "", password: "" });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading admins:", error);
      toast.error(error.message || "Unable to load admin users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newAdmin.username || !newAdmin.email || !newAdmin.password) {
      return;
    }

    try {
      const createdUser = await createAdminUser({
        name: newAdmin.username,
        email: newAdmin.email,
        password: newAdmin.password,
      });

      setUsers((prev) => [createdUser, ...prev]);
      setNewAdmin({ username: "", email: "", password: "" });
      setIsAdding(false);
      setShowPassword(false);
      toast.success("Admin account created successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to create admin user.");
    }
  };

  const removeUser = async (user) => {
    if (!window.confirm(`Are you sure you want to remove admin access for ${user.name || user.email}?`)) {
      return;
    }

    try {
      await deleteAdminUser(user._id);
      setUsers((prev) => prev.filter((item) => item._id !== user._id));
      toast.success("Admin user removed successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to remove admin access.");
    }
  };

  const filteredUsers = useMemo(
    () =>
      users.filter((u) =>
        String(u?.name || "").toLowerCase().includes(search.toLowerCase()) ||
        String(u?.email || "").toLowerCase().includes(search.toLowerCase())
      ),
    [users, search]
  );

  return (
    <div className="adm-allowlist-container">
      <div className="adm-page-actions">
        <div className="adm-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search admins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className="adm-btn primary"
          onClick={() => setIsAdding(!isAdding)}
        >
          <UserPlus size={18} />
          <span>{isAdding ? "Cancel" : "Add Admin"}</span>
        </button>
      </div>

      {isAdding && (
        <form className="adm-card adm-add-admin-form" onSubmit={handleAdd}>
          <div className="adm-form-header-row">
            <h3 className="adm-add-admin-title">Create New Administrator</h3>
            <p className="adm-add-admin-subtitle">
              This will create a login account and grant dashboard access.
            </p>
          </div>

          <div className="adm-input-row adm-input-row-3col">
            <div className="adm-input-group">
              <label htmlFor="new-admin-username">Full Name</label>
              <div className="adm-input-with-icon">
                <UserIcon size={16} className="adm-field-icon" />
                <input
                  id="new-admin-username"
                  className="adm-input has-icon"
                  type="text"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  placeholder="e.g. Purav Patel"
                  required
                />
              </div>
            </div>

            <div className="adm-input-group">
              <label htmlFor="new-admin-email">Email Address</label>
              <div className="adm-input-with-icon">
                <Mail size={16} className="adm-field-icon" />
                <input
                  id="new-admin-email"
                  className="adm-input has-icon"
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="admin@aashaka.com"
                  required
                />
              </div>
            </div>

            <div className="adm-input-group">
              <label htmlFor="new-admin-password">Initial Password</label>
              <div className="adm-input-with-icon">
                <Lock size={16} className="adm-field-icon" />
                <input
                  id="new-admin-password"
                  className="adm-input has-icon"
                  type={showPassword ? "text" : "password"}
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="adm-input-append"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="adm-form-footer adm-form-footer-bordered">
            <button type="submit" className="adm-btn primary">Create Admin Account</button>
            <button type="button" className="adm-btn ghost" onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
        </form>
      )}

      <section className="adm-widget">
        <div className="adm-widget-head">
          <div className="adm-widget-title">
            <ShieldCheck size={20} className="adm-icon-primary" />
            <div>
              <h2>Access Control List</h2>
              <span>Admin accounts managed via user roles</span>
            </div>
          </div>
        </div>

        <div className="adm-table-wrap">
          {loading ? (
            <div className="adm-table-empty">
              <Loader2 className="adm-spinner" size={24} />
              <p>Loading authorized users...</p>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Admin Profile</th>
                  <th>Authentication Email</th>
                  <th>Status</th>
                  <th className="adm-text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((row) => (
                  <tr key={row._id}>
                    <td>
                      <div className="adm-user-profile">
                        <div className="adm-user-avatar">
                          {String(row?.name || row?.email || "A").charAt(0).toUpperCase()}
                        </div>
                        <div className="adm-user-info">
                          <strong>{row?.name || "Administrator"}</strong>
                          <span>Administrator</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="adm-user-email">
                        <Mail size={14} />
                        {row.email}
                      </div>
                    </td>
                    <td>
                      <span className="adm-status delivered">Active</span>
                    </td>
                    <td className="adm-text-right">
                      <button
                        className="adm-icon-btn danger"
                        onClick={() => removeUser(row)}
                        aria-label="Remove access"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="adm-table-empty">
                      No admins found matching "{search}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
