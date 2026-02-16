import "./Auth.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { authPageVariants } from "../components/authPageMotion";
import { isStaticHost, loadLocalUsers, saveLocalUsers } from "../utils/localAuth";

/* ---------------- HELPERS ---------------- */

const getPasswordStrength = (password) => {
  let score = 0;

  if (password.length >= 8) score += 25;
  if (/[A-Z]/.test(password)) score += 25;
  if (/[a-z]/.test(password)) score += 25;
  if (/\d/.test(password)) score += 25;

  if (score <= 25) return { label: "Weak", value: 25, color: "#ff4d4f" };
  if (score <= 75) return { label: "Medium", value: 60, color: "#faad14" };
  return { label: "Strong", value: 100, color: "#52c41a" };
};

const shake = {
  animate: {
    x: [0, -6, 6, -6, 6, 0],
    transition: { duration: 0.35 },
  },
};

/* ---------------- COMPONENT ---------------- */

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getPasswordStrength(form.password);

  // ✅ define AFTER errors state
  const isMismatch =
    errors.confirmPassword === "Passwords do not match";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validate = () => {
    const newErrors = {};

    if (!form.email.trim())
      newErrors.email = "Email is required";
    else if (!isValidEmail(form.email))
      newErrors.email = "Enter a valid email";

    if (!form.password)
      newErrors.password = "Password is required";
    else if (form.password.length < 8)
      newErrors.password = "Minimum 8 characters required";

    if (!form.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!validate()) {
      return;

    } 
    
    try {
      if (isStaticHost()) {
        const users = await loadLocalUsers();
        const exists = users.some((u) => u.id === form.email.trim());
        if (exists) {
          toast.error("Email already registered");
          return;
        }

        const nextUsers = [
          ...users,
          { id: form.email.trim(), password: form.password, role: "user" },
        ];
        saveLocalUsers(nextUsers);

        toast.success("Account created successfully!", {
          position: "top-center",
          autoClose: 3000,
        });

        navigate("/login", { replace: true });
        return;
      }

      const checkRes = await fetch(
        `http://localhost:5000/users?id=${form.email.trim()}`
      );
      const existingUsers = await checkRes.json();

      if (existingUsers.length > 0) {
        toast.error("Email already registered");
        return;
      }

      const response = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.email.trim(),
          password: form.password,
          role: "user",
        }),
      });

      if (!response.ok) {
        toast.error("Signup failed. Please try again.");
        return;
      }

      toast.success("Account created successfully!", {
        position: "top-center",
        autoClose: 3000,
      });

      navigate("/login", { replace: true });
    } catch (error) {
      toast.error("Failed to connect to server.");
    }
  };

  return (
    <motion.div
      className="auth-page"
      variants={authPageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <h2>Create Account</h2>

      <form onSubmit={handleSignup}>
        {/* EMAIL */}
        <motion.div
          className="field"
          variants={shake}
          animate={errors.email ? "animate" : ""}
        >
          <input
            type="text"
            name="email"
            placeholder="Email ID"
            value={form.email}
            onChange={handleChange}
            className={errors.email ? "error-input" : ""}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </motion.div>

        {/* 🔥 PASSWORD + CONFIRM (SHAKE TOGETHER) */}
        <motion.div
          variants={shake}
          animate={isMismatch ? "animate" : ""}
        >
          {/* PASSWORD */}
          <div className="field password-wrapper">
            <input
              type={showPass ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? "error-input" : ""}
            />

            <motion.img
              src={
                showPass
                  ? `${process.env.PUBLIC_URL}/assets/eye-open.png`
                  : `${process.env.PUBLIC_URL}/assets/eye-closed.png`
              }
              alt="toggle password"
              className="eye-icon-img"
              onClick={() => setShowPass((p) => !p)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9, rotate: 15 }}
            />

            {form.password && (
              <div className="password-strength">
                <div className={`strength-label strength-${strength.label.toLowerCase()}`}>
                  Strength: <span>{strength.label}</span>
                </div>

                <div className="strength-bar">
                  <motion.div
                    className="strength-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${strength.value}%` }}
                    transition={{ duration: 0.3 }}
                    style={{ backgroundColor: strength.color }}
                  />
                </div>
              </div>
            )}

            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="field password-wrapper">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "error-input" : ""}
            />

            <motion.img
              src={
                showConfirm
                  ? `${process.env.PUBLIC_URL}/assets/eye-open.png`
                  : `${process.env.PUBLIC_URL}/assets/eye-closed.png`
              }
              alt="toggle confirm password"
              className="eye-icon-img"
              onClick={() => setShowConfirm((p) => !p)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9, rotate: -15 }}
            />

            {errors.confirmPassword && (
              <span className="error">{errors.confirmPassword}</span>
            )}
          </div>
        </motion.div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          CREATE ACCOUNT
        </motion.button>
      </form>

      <div className="auth-links">
        <Link to="/login">Already have an account? Login</Link>
      </div>
    </motion.div>
  );
}
