import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiClipboard, FiHeart, FiLogOut, FiUser } from "react-icons/fi";
import "./HeaderTop.css";
import { useAuth } from "../../context/AuthContext";

const HeaderTop = ({ userName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const COMMON_SURNAMES = [
    "patel",
    "sharma",
    "verma",
    "gupta",
    "singh",
    "kumar",
    "shah",
    "mehta",
    "jain",
    "agarwal",
    "aggarwal",
    "malhotra",
    "kapoor",
    "reddy",
    "nair",
    "iyer",
    "joshi",
    "bhat",
    "bhatt",
    "desai",
    "chauhan",
    "yadav",
  ];

  const normalizeName = (rawValue) => {
    if (!rawValue) return "";
    let value = String(rawValue).trim();
    if (!value) return "";

    if (value.includes("@")) {
      const localPart = value.split("@")[0] || "";
      const cleaned = localPart.replace(/\d+/g, "").toLowerCase();
      let candidate = cleaned;

      if (/[._-]/.test(candidate)) {
        const parts = candidate.split(/[._-]+/).filter(Boolean);
        candidate = parts[parts.length - 1] || candidate;
      }

      const surname = COMMON_SURNAMES.find((s) =>
        candidate.startsWith(s)
      );
      if (surname && candidate.length > surname.length) {
        candidate = candidate.slice(surname.length);
      }

      candidate = candidate.replace(/\s+/g, "").trim();
      if (!candidate) return "";
      return candidate.charAt(0).toUpperCase() + candidate.slice(1);
    }

    value = value.replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim();
    if (!value) return "";
    return value
      .split(" ")
      .map((word) =>
        word ? word.charAt(0).toUpperCase() + word.slice(1) : ""
      )
      .join(" ");
  };
  
  let displayName =
    normalizeName(userName) ||
    normalizeName(user?.name) ||
    normalizeName(user?.firstName) ||
    normalizeName(user?.id);

  const isLoginPage =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forget-password";

  const isLoggedIn = Boolean(displayName);

  const greetingText =
    isLoginPage || !isLoggedIn
      ? "Welcome"
      : `Welcome, ${displayName}`;

  const handleProtectedNav = (e, path) => {
    if (!user) {
      e.preventDefault();
      navigate("/login");
      return;
    }
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <div className="header-top">
      <div className="header-top-left">{greetingText}</div>
      <div className="header-top-center">
        Free Delivery on all orders over ₹1999 !!
      </div>
      <div className="header-top-right">
        <NavLink
          to="/wishlist"
          className="top-icon"
          aria-label="WishList"
          onClick={(e) => handleProtectedNav(e, "/wishlist")}
        >
          <FiHeart />
        </NavLink>
        <NavLink
          to="/order-history"
          className="top-icon"
          aria-label="Order History"
          onClick={(e) => handleProtectedNav(e, "/order-history")}
        >
          <FiClipboard />
        </NavLink>
        <NavLink
          to="/user-profile"
          className="top-icon"
          aria-label="User Profile"
          onClick={(e) => handleProtectedNav(e, "/user-profile")}
        >
          <FiUser />
        </NavLink>
        <button
          type="button"
          onClick={handleLogout}
          className="top-icon"
          aria-label="Logout"
        >
          <FiLogOut />
        </button>
      </div>
    </div>
  );
};

export default HeaderTop;
