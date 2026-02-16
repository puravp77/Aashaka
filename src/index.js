  import React from "react";
  import ReactDOM from "react-dom/client";
  import { HashRouter } from "react-router-dom";
  import App from "./App";

  import { CartProvider } from "./context/CartContext";
  import { ProductProvider } from "./context/ProductContext";
  import { AuthProvider } from "./context/AuthContext";
  import { WishlistProvider } from "./context/WishlistContext";

  import { ToastContainer } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";

  const root = ReactDOM.createRoot(document.getElementById("root"));

  root.render(
    <HashRouter>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <WishlistProvider>
              <App />
              
              <ToastContainer
                position="top-center"
                autoClose={1000}
                hideProgressBar
                newestOnTop
              />

            </WishlistProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </HashRouter>
  );
