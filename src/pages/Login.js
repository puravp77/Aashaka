import "./Auth.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear error on typing
  };

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validate = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(form.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!form.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      setErrors({ email: "No account found. Please sign up." });
      return;
    }

    if (
      user.email === form.email.trim() &&
      user.password === form.password
    ) {
      localStorage.setItem("isLoggedIn", true);
      navigate("/");
    } else {
      setErrors({ password: "Invalid email or password" });
    }
  };

  return (
    <div className="auth-page">
      <h2>Login</h2>

      <div className="field">
          <input
            type="email"
            name="email"
            placeholder="Email ID"
            value={form.email}
            onChange={handleChange}
            className={errors.email ? "error-input" : ""}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="field">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className={errors.password ? "error-input" : ""}
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>


      <button onClick={handleLogin}>SUBMIT</button>

      <div className="auth-links">
        <Link to="/signup">Create your account</Link>
        <Link to="#">Forgot password?</Link>
      </div>
    </div>
  );
}
