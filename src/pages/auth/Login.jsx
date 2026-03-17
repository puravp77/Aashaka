import "./Auth.css";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { authPageVariants } from "../../components/auth/authPageMotion";
import { Eye, EyeOff } from "lucide-react";

/* ---------------- ANIMATIONS ---------------- */

const shake = {
  animate: {
    x: [0, -6, 6, -6, 6, 0],
    transition: { duration: 0.35 },
  },
};


const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/* ---------------- COMPONENT ---------------- */

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    // Force clean fields on page open even if browser tries to autofill.
    const clear = () => setForm({ email: "", password: "" });
    clear();
    const t = setTimeout(clear, 0);
    return () => clearTimeout(t);
  }, []);

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!form.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setShakeKey((k) => k + 1);
      return false;
    }

    return true;
  };

  const handleLogin = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!validate()) return;

    try {
      await login(form.email.trim(), form.password);
      navigate("/");
    } catch (err) {
      if (err.message === "ADMIN_USE_ADMIN_PORTAL") {
        setErrors({ email: "Use the Admin Portal for admin accounts" });
      } else {
        setErrors({ password: "Invalid email or password" });
      }

      setShakeKey((k) => k + 1);
    }
  };


  return (
    <div className="auth-shell">
      <motion.div
        className="auth-page"
        variants={authPageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <h2>Login</h2>

        <form onSubmit={handleLogin} autoComplete="off">
          <motion.div key={shakeKey} variants={shake} animate="animate">
            {/* EMAIL */}
            <div className="field">
              <input
                type="text"
                name="email"
                placeholder="Email ID"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? "error-input" : ""}
                autoComplete="off"
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            {/* PASSWORD */}
            <div className="field password-wrapper">
              <div className="password-input-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className={errors.password ? "error-input" : ""}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowPass((p) => !p)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  aria-pressed={showPass}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {errors.password && (
                <span className="error">{errors.password}</span>
              )}
            </div>
          </motion.div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            SUBMIT
          </motion.button>
        </form>

        <div className="auth-links">
          <Link to="/signup">Create your account</Link>
          <Link to="/forget-password">Forgot password?</Link>
        </div>
      </motion.div>
    </div>
  );
}
