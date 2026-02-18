import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "./HeaderMainNav.css";
import { withPublicUrl } from "../../utils/assetPath";

const HeaderMainNav = () => {
  const { uniqueItemCount } = useCart();
  const location = useLocation();
  const isClothsActive = location.pathname.startsWith("/kurti");
  const isJewelleryActive = location.pathname.startsWith("/jewellery");

  return (
    <nav className="header-main-nav">
      <div className="header-main-inner">
        <NavLink to="/" className="main-logo">
          <img src={withPublicUrl("images/headerlogo.jpeg")} alt="Aashaka" />
          <span className="main-logo-copy">
            <span className="main-logo-kicker">Aashaka</span>
            <span className="main-logo-tag">Festive Wardrobe</span>
          </span>
        </NavLink>

        <div className="main-links">
          <NavLink
            to="/"
            className={({ isActive }) => `main-link${isActive ? " active" : ""}`}
          >
            HOME
          </NavLink>
          <div className="dropdown">
            <span className={`main-link dropdown-trigger${isClothsActive ? " active" : ""}`}>
              CLOTHS
              <span className="dropdown-caret" aria-hidden="true">v</span>
            </span>
            <div className="dropdown-menu">
              <NavLink to="/kurti">Kurti Set</NavLink>
            </div>
          </div>
          <div className="dropdown">
            <span className={`main-link dropdown-trigger${isJewelleryActive ? " active" : ""}`}>
              JEWELLERY
              <span className="dropdown-caret" aria-hidden="true">v</span>
            </span>
            <div className="dropdown-menu">
              <NavLink to="/jewellery/oxidised">Oxidised Set</NavLink>
              <NavLink to="/jewellery/bangles">Bangles-Kada</NavLink>
              <NavLink to="/jewellery/earrings">Earrings</NavLink>
              <NavLink to="/jewellery/necklace">Necklace</NavLink>
            </div>
          </div>
          <NavLink
            to="/about"
            className={({ isActive }) => `main-link${isActive ? " active" : ""}`}
          >
            ABOUT
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `main-link cart-link${isActive ? " active" : ""}`
            }
          >
            <span className="cart-link-label">Cart</span>
            <span className="cart-count">{uniqueItemCount}</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default HeaderMainNav;



