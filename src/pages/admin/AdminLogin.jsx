import "./AdminLogin.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ id: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      if (user.role !== "admin") {
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
    <section className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <p className="admin-login-kicker">Aashaka Admin</p>
        <h1>Secure Login</h1>
        <p className="admin-login-sub">Sign in to access the admin dashboard.</p>

        <label>
          Admin Email
          <input
            type="email"
            name="id"
            value={form.id}
            onChange={handleChange}
            placeholder="admin@aashaka.com"
            autoComplete="username"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter password"
            autoComplete="current-password"
          />
        </label>

        {error && <p className="admin-login-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </section>
  );
}
