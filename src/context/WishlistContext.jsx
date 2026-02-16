import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const storageKey = user ? `aashaka_wishlist_${user.id}` : null;
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    if (!user) {
      setWishlistItems([]);
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        setWishlistItems([]);
        return;
      }
      const parsed = JSON.parse(stored);
      setWishlistItems(Array.isArray(parsed) ? parsed : []);
    } catch (err) {
      setWishlistItems([]);
    }
  }, [user, storageKey]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(storageKey, JSON.stringify(wishlistItems));
  }, [wishlistItems, user, storageKey]);

  const addToWishlist = (product, size = null, showToast = true) => {
    if (!user) return;
    setWishlistItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) return prev;

      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          oldPrice: product.oldPrice,
          image: product.images?.[0],
          images: product.images || [],
          size: size || null,
        },
      ];
    });

    if (showToast) {
      toast.success("Added to Wishlist", { icon: "❤️" });
    }
  };

  const removeFromWishlist = (id, showToast = true) => {
    if (!user) return;
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));

    if (showToast) {
      toast.info("Removed from Wishlist");
    }
  };

  const isInWishlist = (id) => wishlistItems.some((item) => item.id === id);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
