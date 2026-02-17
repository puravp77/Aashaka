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
        </NavLink>

        <div className="main-links">
          <NavLink
            to="/"
            className={({ isActive }) => `main-link${isActive ? " active" : ""}`}
          >
            HOME
          </NavLink>
          <div className="dropdown">
            <span className={`main-link${isClothsActive ? " active" : ""}`}>
              CLOTHS
            </span>
            <div className="dropdown-menu">
              <NavLink to="/kurti">Kurti Set</NavLink>
            </div>
          </div>
          <div className="dropdown">
            <span className={`main-link${isJewelleryActive ? " active" : ""}`}>
              JEWELLERY
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
            className={({ isActive }) => `main-link${isActive ? " active" : ""}`}
          >
            CART({uniqueItemCount})
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default HeaderMainNav;

