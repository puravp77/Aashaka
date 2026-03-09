import React, { useEffect, useRef, useState } from "react";
import "./header.css";
import { withPublicUrl } from "../../utils/assetPath";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiClipboard, FiHeart, FiLogOut, FiSearch, FiUser } from "react-icons/fi";
import { HiOutlineMenu } from "react-icons/hi";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import CartDrawer from "./CartDrawer";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [clothsOpen, setClothsOpen] = useState(false);
  const [jewelleryOpen, setJewelleryOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState(null);
  const desktopNavRef = useRef(null);

  const { uniqueItemCount } = useCart();
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const isClothsActive = location.pathname.startsWith("/kurti");
  const isJewelleryActive = location.pathname.startsWith("/jewellery");

  useEffect(() => {
    setOpenDesktopDropdown(null);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!openDesktopDropdown) return;

    const handlePointerDown = (event) => {
      if (desktopNavRef.current && !desktopNavRef.current.contains(event.target)) {
        setOpenDesktopDropdown(null);
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setOpenDesktopDropdown(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [openDesktopDropdown]);

  const getDisplayName = () => {
    const raw = user?.name || user?.firstName || user?.id || "";
    if (!raw) return "";
    if (raw.includes("@")) {
      const localPart = raw.split("@")[0] || "";
      const cleaned = localPart.replace(/\d+/g, "");
      const surname = cleaned.toLowerCase().startsWith("patel")
        ? cleaned.slice(5)
        : cleaned;
      if (!surname) return "";
      return surname.charAt(0).toUpperCase() + surname.slice(1);
    }
    return raw
      .replace(/[._-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .map((word) =>
        word ? word.charAt(0).toUpperCase() + word.slice(1) : ""
      )
      .join(" ");
  };

  const displayName = getDisplayName();
  const isLoggedIn = Boolean(displayName);

  useEffect(() => {
    if (!logoutOpen) return;

    const handleEscClose = (event) => {
      if (event.key === "Escape") {
        setLogoutOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscClose);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscClose);
    };
  }, [logoutOpen]);

  useEffect(() => {
    if (!menuOpen) {
      setClothsOpen(false);
      setJewelleryOpen(false);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  /* =========================
     SEARCH SUBMIT
  ========================= */
  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const query = searchText.trim();
    if (!query) return;

    navigate(`/search?q=${encodeURIComponent(query)}`);
    setSearchOpen(false);
    setSearchText("");
  };

  return (
    <>
      {/* TOP BAR */}
      <div className="top-bar">
        {isLoggedIn && (
          <div className="top-left">Welcome, {displayName}</div>
        )}

        <div className="top-text">
          <b>Free Delivery</b> on all orders over <b>{"\u20B9"}1999</b> !!
        </div>

        <div className="top-right">
          <button
            type="button"
            className="icon-btn tooltip"
            data-tooltip="Search"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <FiSearch />
          </button>

          {isLoggedIn ? (
            <>
              <NavLink
                to="/wishlist"
                className="top-link icon-link tooltip"
                aria-label="WishList"
                data-tooltip="Wishlist"
              >
                <FiHeart />
              </NavLink>
              <NavLink
                to="/order-history"
                className="top-link icon-link tooltip"
                aria-label="Order History"
                data-tooltip="Order History"
              >
                <FiClipboard />
              </NavLink>
              <NavLink
                to="/user-profile"
                className="top-link icon-link tooltip"
                aria-label="User Profile"
                data-tooltip="User Profile"
              >
                <FiUser />
              </NavLink>
              <button
                type="button"
                className="top-link icon-link logout-btn tooltip"
                onClick={() => {
                  setLogoutOpen(true);
                }}
                aria-label="Logout"
                data-tooltip="Logout"
              >
                <FiLogOut />
              </button>
            </>
          ) : (
            <button
              type="button"
              className="icon-btn tooltip"
              data-tooltip="Login"
              onClick={() => navigate("/login")}
              aria-label="Login"
            >
              <FiUser />
            </button>
          )}
        </div>
      </div>

      {/* SEARCH */}
      <form
        className={`search-bar ${searchOpen ? "active" : "hidden"}`}
        onSubmit={handleSearchSubmit}
      >
        <input
          type="text"
          placeholder="Search products..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          autoFocus
        />
        <button
          type="button"
          className="search-close"
          onClick={() => setSearchOpen(false)}
          aria-label="Close search"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </form>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">
          <NavLink to="/" className="logo-link">
            <img src={withPublicUrl("images/headerlogo.jpeg")} alt="Aashaka" />
          </NavLink>
        </div>

        {/* DESKTOP MENU */}
        <ul
          className="nav-links desktop"
          ref={desktopNavRef}
        >
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
              onClick={() => setOpenDesktopDropdown(null)}
            >
              <span>HOME</span>
            </NavLink>
          </li>

          <li
            className={`dropdown${openDesktopDropdown === "cloths" ? " open" : ""}`}
          >
            <button
              type="button"
              className={`nav-item nav-trigger${isClothsActive ? " active" : ""}`}
              onClick={() =>
                setOpenDesktopDropdown((current) =>
                  current === "cloths" ? null : "cloths"
                )
              }
              aria-expanded={openDesktopDropdown === "cloths"}
              aria-haspopup="true"
            >
              <span>CLOTHS</span>
            </button>
            <div className="dropdown-menu">
              <NavLink to="/kurti" onClick={() => setOpenDesktopDropdown(null)}>
                Kurti Set
              </NavLink>
            </div>
          </li>

          <li
            className={`dropdown${openDesktopDropdown === "jewellery" ? " open" : ""}`}
          >
            <button
              type="button"
              className={`nav-item nav-trigger${isJewelleryActive ? " active" : ""}`}
              onClick={() =>
                setOpenDesktopDropdown((current) =>
                  current === "jewellery" ? null : "jewellery"
                )
              }
              aria-expanded={openDesktopDropdown === "jewellery"}
              aria-haspopup="true"
            >
              <span>JEWELLERY</span>
            </button>
            <div className="dropdown-menu">
              <NavLink to="/jewellery/oxidised" onClick={() => setOpenDesktopDropdown(null)}>
                Oxidised Set
              </NavLink>
              <NavLink to="/jewellery/bangles" onClick={() => setOpenDesktopDropdown(null)}>
                Bangles-Kada
              </NavLink>
              <NavLink to="/jewellery/earrings" onClick={() => setOpenDesktopDropdown(null)}>
                Earrings
              </NavLink>
              <NavLink to="/jewellery/necklace" onClick={() => setOpenDesktopDropdown(null)}>
                Necklace
              </NavLink>
            </div>
          </li>

          <li>
            <NavLink
              to="/about"
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
              onClick={() => setOpenDesktopDropdown(null)}
            >
              <span>ABOUT</span>
            </NavLink>
          </li>

          <li>
            <button
              type="button"
              className="cart-link nav-cart"
              onClick={() => {
                setOpenDesktopDropdown(null);
                setCartOpen(true);
              }}
            >
              <span className="nav-cart-label">CART</span>
              <span className="nav-cart-count">{uniqueItemCount}</span>
            </button>
          </li>
        </ul>

        {/* MOBILE RIGHT */}
        <div className="nav-right">
          <button
            type="button"
            className="cart-text"
            onClick={() => setCartOpen(true)}
          >
            <span>CART</span>
            <span className="cart-mobile-count">{uniqueItemCount}</span>
          </button>

          <button
            className="mobile-search"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
          >
            <FiSearch />
          </button>

          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
          >
            <HiOutlineMenu />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div id="mobile-nav-menu" className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <NavLink to="/" onClick={() => setMenuOpen(false)}>HOME</NavLink>
        <NavLink to="/about" onClick={() => setMenuOpen(false)}>ABOUT</NavLink>

        <div className="mobile-accordion">
          <button
            className={`mobile-title ${clothsOpen ? "active" : ""}`}
            onClick={() => setClothsOpen(!clothsOpen)}
          >
            CLOTHS
          </button>
          <div className={`mobile-submenu ${clothsOpen ? "open" : ""}`}>
            <NavLink to="/kurti" onClick={() => setMenuOpen(false)}>
              Kurti Set
            </NavLink>
          </div>
        </div>

        <div className="mobile-accordion">
          <button
            className={`mobile-title ${jewelleryOpen ? "active" : ""}`}
            onClick={() => setJewelleryOpen(!jewelleryOpen)}
          >
            JEWELLERY
          </button>
          <div className={`mobile-submenu ${jewelleryOpen ? "open" : ""}`}>
            <NavLink to="/jewellery/oxidised" onClick={() => setMenuOpen(false)}>
              Oxidised set
            </NavLink>
            <NavLink to="/jewellery/bangles" onClick={() => setMenuOpen(false)}>
              Bangles-Kada
            </NavLink>
            <NavLink to="/jewellery/earrings" onClick={() => setMenuOpen(false)}>
              Earrings
            </NavLink>
            <NavLink to="/jewellery/necklace" onClick={() => setMenuOpen(false)}>
              Necklace
            </NavLink>
          </div>
        </div>

        {isLoggedIn ? (
          <>
            <NavLink to="/wishlist" className="account-link" onClick={() => setMenuOpen(false)}>
              WISHLIST
            </NavLink>
            <NavLink to="/order-history" className="account-link" onClick={() => setMenuOpen(false)}>
              ORDER HISTORY
            </NavLink>
            <NavLink to="/user-profile" className="account-link" onClick={() => setMenuOpen(false)}>
              USER PROFILE
            </NavLink>
            <button
              type="button"
              className="account-link mobile-logout"
              onClick={() => {
                setLogoutOpen(true);
              }}
            >
              LOGOUT
            </button>
          </>
        ) : (
          <NavLink to="/login" onClick={() => setMenuOpen(false)}>
            LOGIN / REGISTRATION
          </NavLink>
        )}
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {logoutOpen && (
        <div
          className="logout-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          aria-describedby="logout-desc"
          onClick={() => setLogoutOpen(false)}
        >
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="logout-close"
              onClick={() => setLogoutOpen(false)}
              aria-label="Close logout confirmation"
            >
              <span aria-hidden="true">&times;</span>
            </button>

            <div className="logout-badge" aria-hidden="true">
              <FiLogOut />
            </div>

            <h3 id="logout-title">Log out, {displayName || "User"}?</h3>
            <p id="logout-desc">Your wishlist and cart stay saved for your next visit.</p>
            <div className="logout-actions">
              <button
                type="button"
                className="logout-btn-secondary"
                onClick={() => setLogoutOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="logout-btn-primary"
                onClick={() => {
                  logout();
                  setLogoutOpen(false);
                  setMenuOpen(false);
                  navigate("/login");
                }}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

