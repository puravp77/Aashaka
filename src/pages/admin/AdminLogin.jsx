import "../auth/Auth.css";
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
    <div className="auth-shell">
      <div className="auth-page">
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <input
              type="email"
              name="id"
              value={form.id}
              onChange={handleChange}
              placeholder="Admin Email"
              autoComplete="username"
            />
          </div>

          <div className="field">
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              autoComplete="current-password"
            />
          </div>

          {error && <span className="error">{error}</span>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
