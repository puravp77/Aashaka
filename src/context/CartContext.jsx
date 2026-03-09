import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const storageKey = user ? `aashaka_cart_${user.id}` : null;

  useEffect(() => {
    if (!user) {
      setCartItems([]);
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCartItems(Array.isArray(parsed) ? parsed : []);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      setCartItems([]);
    }
  }, [user, storageKey]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(storageKey, JSON.stringify(cartItems));
  }, [cartItems, user, storageKey]);

  /* =========================
     ADD TO CART (MERGE BY ID + SIZE)
  ========================= */
  const addToCart = (product, qty = 1, size = null, showToast = false) => {
    setCartItems((prev) => {
      const maxQty =
        product?.sizes && size
          ? Math.max(0, Number(product.sizes[size]) || 0)
          : Infinity;
      const existing = prev.find(
        (item) => item.id === product.id && item.size === size
      );

      if (existing) {
        const nextQty = Math.min(existing.qty + qty, maxQty);
        if (nextQty <= 0) {
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id && item.size === size
            ? { ...item, qty: nextQty }
            : item
        );
      }

      const nextQty = Math.min(qty, maxQty);
      if (nextQty <= 0) {
        return prev;
      }

      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.images?.[0],
          qty: nextQty,
          size,
        },
      ];
    });

    if (showToast) {
      toast.success("Product Added To Cart", {
        icon: "✅",
      });
    }
  };

  /* =========================
     REMOVE FROM CART
  ========================= */
  const removeFromCart = (id, size) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === id && item.size === size))
    );
  };

  /* =========================
     UPDATE QTY
  ========================= */
  const updateQty = (id, size, newQty) => {
    setCartItems((prev) => {
      if (newQty < 1) {
        return prev.filter(
          (item) => !(item.id === id && item.size === size)
        );
      }

      return prev.map((item) =>
        item.id === id && item.size === size
          ? { ...item, qty: newQty }
          : item
      );
    });
  };

  /* =========================
     CLEAR CART
  ========================= */
  const clearCart = () => {
    setCartItems([]);
    setCartOpen(false);
  };

  /* =========================
     TOTAL PRICE
  ========================= */
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  /* =========================
     COUNTS (IMPORTANT FIX)
  ========================= */

  // Number of unique products
  const uniqueItemCount = cartItems.length;

  // Total quantity (sum of qty)
  const totalQuantity = cartItems.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        total,

        uniqueItemCount,
        totalQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
