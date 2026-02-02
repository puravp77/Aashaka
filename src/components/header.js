import React, { useState } from "react";
import "./header.css";
import { NavLink, useNavigate } from "react-router-dom";
import { FiSearch, FiUser } from "react-icons/fi";
import { HiOutlineMenu } from "react-icons/hi";
import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [clothsOpen, setClothsOpen] = useState(false);
  const [jewelleryOpen, setJewelleryOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  // ✅ CORRECT: get unique product count
  const { uniqueItemCount } = useCart();

  const navigate = useNavigate();

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
        <div className="top-text">
          <b>Free Delivery</b> on all orders over <b>₹1999</b> !!
        </div>
        <div className="header-icons">
          <FiSearch className="icon" onClick={() => setSearchOpen(true)} />
          <FiUser className="icon" onClick={() => navigate("/login")} />
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
        >
          ✕
        </button>
      </form>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">
          <NavLink to="/">
            <img src="/images/headerlogo.jpeg" alt="Aashaka" />
          </NavLink>
        </div>

        {/* DESKTOP MENU */}
        <ul className="nav-links desktop">
          <li><NavLink to="/">HOME</NavLink></li>

          <li className="dropdown">
            <span>CLOTHS</span>
            <div className="dropdown-menu">
              <NavLink to="/kurti">Kurti Set</NavLink>
            </div>
          </li>

          <li className="dropdown">
            <span>JEWELLERY</span>
            <div className="dropdown-menu">
              <NavLink to="/jewellery/oxidised">Oxidised Set</NavLink>
              <NavLink to="/jewellery/bangles">Bangles-Kada</NavLink>
              <NavLink to="/jewellery/earrings">Earrings</NavLink>
              <NavLink to="/jewellery/necklace">Necklace</NavLink>
            </div>
          </li>

          <li><NavLink to="/about">ABOUT</NavLink></li>

          <li>
            <button
              className="cart-link"
              onClick={() => setCartOpen(true)}
            >
              CART ({uniqueItemCount})
            </button>
          </li>
        </ul>

        {/* MOBILE RIGHT */}
        <div className="nav-right">
          <span
            className="cart-text"
            onClick={() => setCartOpen(true)}
          >
            CART ({uniqueItemCount})
          </span>

          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <HiOutlineMenu />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <NavLink to="/" onClick={() => setMenuOpen(false)}>HOME</NavLink>
        <NavLink to="/about" onClick={() => setMenuOpen(false)}>ABOUT</NavLink>

        <div className="mobile-accordion">
          <button
            className="mobile-title"
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
            className="mobile-title"
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

        <NavLink to="/login" onClick={() => setMenuOpen(false)}>
          LOGIN / REGISTRATION
        </NavLink>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
