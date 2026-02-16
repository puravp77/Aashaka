import "./Auth.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { isStaticHost, loadLocalUsers, saveLocalUsers } from "../utils/localAuth";

export default function ForgotPassword() {
  const navigate = useNavigate();

  // STEP IS NOW PERSISTENT
  const [step, setStep] = useState(() => {
    return Number(sessionStorage.getItem("fp_step")) || 1;
  });

  const [email, setEmail] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});

  /* ---------- TOAST ---------- */
  const [showToast, setShowToast] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // SYNC STEP
  useEffect(() => {
    sessionStorage.setItem("fp_step", step);
  }, [step]);

  const generateOtp = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const handleSendOTP = async () => {
    if (!email.trim()) {
      setErrors({ email: "Email ID is required" });
      return;
    }

    try {
      if (isStaticHost()) {
        const users = await loadLocalUsers();
        const exists = users.some((u) => u.id === email.trim());
        if (!exists) {
          setErrors({ email: "Email ID does not exist" });
          return;
        }

        const otp = generateOtp();
        setGeneratedOtp(otp);
        setOtpInput("");
        setErrors({});
        setProgress(100);
        setShowToast(true);
        setStep(2);
        return;
      }

      const res = await fetch(
        `http://localhost:5000/users/${email.trim()}`
      );

      if (!res.ok) {
        setErrors({ email: "Email ID does not exist" });
        return;
      }

      const otp = generateOtp();
      setGeneratedOtp(otp);
      setOtpInput("");
      setErrors({});
      setProgress(100);
      setShowToast(true);
      setStep(2);
    } catch {
      setErrors({ email: "Server error. Please try again." });
    }
  };

  const handleResendOTP = () => {
    const otp = generateOtp();
    setGeneratedOtp(otp);
    setOtpInput("");
    setErrors({});
    setProgress(100);
    setShowToast(true);
  };

  useEffect(() => {
    if (!showToast || isPaused) return;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timerRef.current);
          setShowToast(false);
          return 0;
        }
        return prev - 0.2;
      });
    }, 10);

    return () => clearInterval(timerRef.current);
  }, [showToast, isPaused]);

  const handleVerifyOTP = () => {
    if (otpInput !== generatedOtp) {
      setErrors({ otp: "Invalid OTP" });
      return;
    }
    setErrors({});
    setStep(3);
  };

  const isPasswordValid = (password) =>
    /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  const handleUpdatePassword = async () => {
    let validationErrors = {};

    if (!newPassword) {
      validationErrors.password = "New password is required";
    } else if (!isPasswordValid(newPassword)) {
      validationErrors.password =
        "Must be 8+ chars with 1 Uppercase & 1 Number";
    }

    if (newPassword !== confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (isStaticHost()) {
        const users = await loadLocalUsers();
        const idx = users.findIndex((u) => u.id === email.trim());
        if (idx === -1) {
          setErrors({ password: "Email ID does not exist" });
          return;
        }
        const updated = [...users];
        updated[idx] = { ...updated[idx], password: newPassword };
        saveLocalUsers(updated);

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed?.id === email.trim()) {
              localStorage.setItem(
                "user",
                JSON.stringify({ ...parsed, password: newPassword })
              );
            }
          } catch {
            // ignore
          }
        }

        setErrors({});
        setStep(4);
        return;
      }

      const updateRes = await fetch(
        `http://localhost:5000/users/${email.trim()}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: newPassword }),
        }
      );

      if (updateRes.ok) {
        setErrors({});
        setStep(4);
      } else {
        setErrors({ password: "Server error. Please try again." });
      }
    } catch {
      setErrors({ password: "Database connection error." });
    }
  };

  return (
    <div className="forgot-password-wrapper">
      {showToast && (
        <div
          className="custom-toast"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="toast-main">
            <div className="toast-success-icon">✓</div>
            <div className="toast-text-content">
              Your OTP is <strong>{generatedOtp}</strong>
            </div>
            <button
              className="toast-close-icon"
              onClick={() => setShowToast(false)}
            >
              ×
            </button>
          </div>
          <div className="toast-progress-track">
            <div
              className="toast-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="auth-page">
        {step === 4 ? (
          <div className="success-screen">
            <h3>Password Updated Successfully..</h3>
            <p>Your password has been changed successfully.</p>
            <button
              className="auth-btn"
              type="button"
              onClick={() => {
                sessionStorage.removeItem("fp_step");
                navigate("/login");
              }}
            >
              GO TO LOGIN
            </button>
          </div>
        ) : (
          <>
            {step === 1 && (
              <>
                <h2>Forgot Password</h2>
                <div className="field">
                  <input
                    type="email"
                    placeholder="Email ID"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && (
                    <span className="error">{errors.email}</span>
                  )}
                </div>
                <button
                  className="auth-btn"
                  type="button"
                  onClick={handleSendOTP}
                >
                  GET OTP
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h2>Verify OTP</h2>
                <div className="field">
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                  />
                  {errors.otp && (
                    <span className="error">{errors.otp}</span>
                  )}
                </div>
                <button
                  className="auth-btn"
                  type="button"
                  onClick={handleVerifyOTP}
                >
                  VERIFY
                </button>
                {errors.otp && (
                  <button
                    className="auth-btn"
                    type="button"
                    style={{ marginTop: "10px" }}
                    onClick={handleResendOTP}
                  >
                    RESEND OTP
                  </button>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <h2>Reset Password</h2>
                <div className="field password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <img
                      src={
                        showPassword
                          ? `${process.env.PUBLIC_URL}/assets/eye-open.png`
                          : `${process.env.PUBLIC_URL}/assets/eye-closed.png`
                      }
                    className="eye-icon-img"
                    onClick={() => setShowPassword(!showPassword)}
                    alt=""
                  />
                  {errors.password && (
                    <span className="error">{errors.password}</span>
                  )}
                </div>

                <div className="field password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <img
                      src={
                        showConfirmPassword
                          ? `${process.env.PUBLIC_URL}/assets/eye-open.png`
                          : `${process.env.PUBLIC_URL}/assets/eye-closed.png`
                      }
                    className="eye-icon-img"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    alt=""
                  />
                  {errors.confirmPassword && (
                    <span className="error">
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>

                <button
                  variant="contained" color="primary"
                  className="auth-btn"
                  type="button"
                  onClick={handleUpdatePassword}
                >
                  UPDATE
                </button>
              </>
            )}

            <div className="auth-links">
              <Link to="/login">Back to Login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
