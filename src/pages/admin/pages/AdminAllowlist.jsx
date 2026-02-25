import { useState, useEffect } from "react";
import { UserPlus, Trash2, ShieldCheck, Mail, User as UserIcon, Search, Loader2, Eye, EyeOff, Lock } from "lucide-react";
import "../AdminLayout.css";
import "./AdminPages.css";

// Path to your json-server endpoints
const ALLOWLIST_API = "http://localhost:5000/allowlist";
const USERS_API = "http://localhost:5000/users";

export default function AdminAllowlist() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: "", email: "", password: "" });

  // Load users from json-server on mount
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(ALLOWLIST_API);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error loading allowlist:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (newAdmin.username && newAdmin.email && newAdmin.password) {
      try {
        // 1. Create the Allowlist entry (for Profile/UI)
        const allowlistEntry = {
          username: newAdmin.username,
          email: newAdmin.email
        };

        const allowResponse = await fetch(ALLOWLIST_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(allowlistEntry),
        });

        // 2. Create the User account (for Authentication)
        const userAccount = {
          id: newAdmin.email, // Using email as ID consistent with users.json
          username: newAdmin.username, // Added username here
          password: newAdmin.password,
          role: "admin",
          isAuthorized: true
        };

        const userResponse = await fetch(USERS_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userAccount),
        });

        if (allowResponse.ok && userResponse.ok) {
          await fetchUsers(); // Refresh list
          setNewAdmin({ username: "", email: "", password: "" });
          setIsAdding(false);
          setShowPassword(false);
        } else {
          throw new Error("Failed to save one or more entries");
        }
      } catch (error) {
        alert("Failed to save admin info. Please check if the email already exists.");
      }
    }
  };

  const removeUser = async (user) => {
    if (window.confirm(`Are you sure you want to remove access and DELETE the account for ${user.username}?`)) {
      try {
        // Delete from Allowlist
        await fetch(`${ALLOWLIST_API}/${user.id}`, { method: "DELETE" });

        // Delete from Users (using email as ID)
        try {
          await fetch(`${USERS_API}/${user.email}`, { method: "DELETE" });
        } catch (e) {
          console.warn("User account might not have existed in users list");
        }

        setUsers(users.filter((u) => u.id !== user.id));
      } catch (error) {
        alert("Failed to remove admin access.");
      }
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="adm-allowlist-container">
      {/* Header Actions */}
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

      {/* Add Admin Form */}
      {isAdding && (
        <form className="adm-card adm-add-admin-form" onSubmit={handleAdd}>
          <div className="adm-form-header-row">
            <h3 style={{ marginBottom: '5px' }}>Create New Administrator</h3>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
              This will create a login account and grant dashboard access.
            </p>
          </div>

          <div className="adm-input-row" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: '15px' }}>
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
                  style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="adm-form-footer" style={{ borderTop: "1px solid #f1f5f9", paddingTop: "20px", display: 'flex', gap: '10px' }}>
            <button type="submit" className="adm-btn primary">Create Admin Account</button>
            <button type="button" className="adm-btn ghost" onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Users Table */}
      <section className="adm-widget">
        <div className="adm-widget-head">
          <div className="adm-widget-title">
            <ShieldCheck size={20} className="adm-icon-primary" />
            <div>
              <h2>Access Control List</h2>
              <span>Authorized users managed via Persistence API</span>
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
                  <tr key={`${row.id}`}>
                    <td>
                      <div className="adm-user-profile">
                        <div className="adm-user-avatar">
                          {row.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="adm-user-info">
                          <strong>{row.username}</strong>
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
