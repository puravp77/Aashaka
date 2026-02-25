import "./AdminLogin.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { hasAdminAccess } from "./adminAccess";
import { FiLock, FiMail, FiArrowLeft, FiEye, FiEyeOff, FiShield } from "react-icons/fi";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ id: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id.trim() || !isValidEmail(form.id)) {
      setError("Enter a valid admin email.");
      return;
    }
    if (!form.password.trim()) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    try {
      const user = await login(form.id.trim(), form.password);
      if (user.role !== "admin" || !hasAdminAccess(user)) {
        setError("This account does not have admin access.");
        setLoading(false);
        return;
      }
      navigate("/admin/dashboard", { replace: true });
    } catch {
      setError("Invalid admin credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-shell">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <FiShield size={32} color="#8b0d2b" />
          </div>
          <h1>Admin Portal</h1>
          <p>Secure access for Aashaka Dashboard</p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-input-group">
            <label htmlFor="id">Admin Email</label>
            <div className="input-with-icon">
              <FiMail className="input-icon" />
              <input
                id="id"
                type="email"
                name="id"
                value={form.id}
                onChange={handleChange}
                placeholder="admin@aashaka.com"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="admin-input-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <FiLock className="input-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="admin-login-error">{error}</div>}

          <button className="admin-login-btn" type="submit" disabled={loading}>
            {loading ? <div className="admin-spinner" /> : "Sign In to Dashboard"}
          </button>
        </form>

        <div className="admin-login-footer">
          <Link to="/">
            <FiArrowLeft style={{ marginRight: "6px" }} />
            Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
}
