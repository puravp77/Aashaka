import "./AdminLogin.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiLock, FiMail, FiArrowLeft, FiEye, FiEyeOff, FiShield } from "react-icons/fi";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();

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
      // 1. Authenticate credentials
      const user = await adminLogin(form.id.trim(), form.password);

      // 2. Fetch latest allowlist to verify access
      const allowlistRes = await fetch("http://localhost:5000/allowlist");
      const allowlistData = await allowlistRes.json();

      const isAuthorized = allowlistData.some(
        admin => admin.email.toLowerCase() === user.id.toLowerCase() || admin.email.toLowerCase() === user.email?.toLowerCase()
      );

      if (user.role !== "admin" || !isAuthorized) {
        setError("This account does not have authorization to access the Admin Portal.");
        setLoading(false);
        return;
      }

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      console.error("Login verification failed:", err);
      setError("Invalid admin credentials or connection error.");
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
