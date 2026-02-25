import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";

import { CartProvider } from "./context/CartContext";
import { ProductProvider } from "./context/ProductContext";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { SettingsProvider } from "./context/SettingsContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <HashRouter>
    <AuthProvider>
      <SettingsProvider>
        <ProductProvider>
          <CartProvider>
            <WishlistProvider>
              <App />

              <ToastContainer
                position="top-center"
                autoClose={2000}
                hideProgressBar
                newestOnTop
              />

            </WishlistProvider>
          </CartProvider>
        </ProductProvider>
      </SettingsProvider>
    </AuthProvider>
  </HashRouter>
);
