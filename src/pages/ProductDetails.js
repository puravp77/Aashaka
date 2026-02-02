import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import "./ProductDetails.css";
import allProducts from "../data/allProducts";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import WatchShopSection from "../components/WatchShopSection";

export default function ProductDetails() {
  const [openAccordion, setOpenAccordion] = useState(null);

  const isLoggedIn = Boolean(localStorage.getItem("user"));

  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();

  /* FIND PRODUCT */
  const product = allProducts.find(
    (p) => String(p.id) === String(id)
  );

  /* 🔥 ALL HOOKS MUST BE CALLED FIRST */
  const [activeImg, setActiveImg] = useState("");
  const [qty, setQty] = useState(1);
  const [showWishlistPopup, setShowWishlistPopup] = useState(false);

  /* SIZE STATE */
  const [selectedSize, setSelectedSize] = useState(null);

  /* SCROLL TOP */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  /* DEFAULT IMAGE */
  useEffect(() => {
    if (product?.images?.length) {
      setActiveImg(product.images[0]);
    }
  }, [product]);

  /* ALSO BOUGHT */
  const alsoBoughtProducts = useMemo(() => {
    if (!product) return [];

    const usedIds = new Set([product.id]);

    const manual =
      product.alsoBought
        ?.map(pid => allProducts.find(p => p.id === pid))
        .filter(Boolean) || [];

    manual.forEach(p => usedIds.add(p.id));

    const sameCategory = allProducts
      .filter(
        p =>
          p.category === product.category &&
          !usedIds.has(p.id)
      )
      .sort(() => Math.random() - 0.5);

    sameCategory.forEach(p => usedIds.add(p.id));

    const randomOthers = allProducts
      .filter(p => !usedIds.has(p.id))
      .sort(() => Math.random() - 0.5);

    return [...manual, ...sameCategory, ...randomOthers].slice(0, 4);
  }, [product]);

  /* SAFETY */
  if (!product) {
    return (
      <h2 style={{ padding: "80px", textAlign: "center" }}>
        Product not found
      </h2>
    );
  }

  const images = product.images || [];
  const title = product.title;
  const price = product.price;
  const oldPrice = product.oldPrice;

  const discountPercent =
    oldPrice && price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;

  return (
    <>
      <div className="product-page">
        {/* LEFT */}
        <div className="product-gallery">
          <div className="thumbs">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={title}
                className={activeImg === img ? "active" : ""}
                onClick={() => setActiveImg(img)}
              />
            ))}
          </div>

          <div className="main-image">
            {activeImg && <img src={activeImg} alt={title} />}
          </div>
        </div>

        {/* RIGHT */}
        <div className="product-info-panel">
          <h1>{title}</h1>

          <div className="price-row">
            <span className="price">₹ {price}</span>
            {discountPercent > 0 && (
              <span className="off">{discountPercent}% off</span>
            )}
            {oldPrice && <span className="old">₹ {oldPrice}</span>}
          </div>

          {/* SIZE */}
          {product.sizes && (
            <div className="size-section">
              <p className="size-title">Size:</p>

              <div className="size-options">
                {Object.entries(product.sizes).map(([size, stock]) => (
                  <button
                    key={size}
                    className={`size-btn 
                      ${selectedSize === size ? "active" : ""}
                      ${stock === 0 ? "disabled" : ""}
                    `}
                    disabled={stock === 0}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {selectedSize && (
                <p className="size-stock">
                  {product.sizes[selectedSize]} pieces available
                </p>
              )}
            </div>
          )}

          {/* PRODUCT DETAILS */}
          <div className="details-box">
            <h4>PRODUCT DETAILS</h4>
            <table>
              <tbody>
                <tr>
                  <td>COLOUR</td>
                  <td>{product.details?.colour || "—"}</td>
                </tr>
                <tr>
                  <td>MATERIAL</td>
                  <td>{product.details?.material || "—"}</td>
                </tr>
                <tr>
                  <td>SIZE</td>
                  <td>{product.details?.size || "Free Size"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* QUANTITY */}
          <div className="quantity-row">
            <span>QUANTITY</span>
            <div className="qty-box">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => q + 1)}>+</button>
            </div>
          </div>

          {/* ADD TO CART */}
          <button
            className="add-cart"
            onClick={() => {
              if (product.sizes && !selectedSize) {
                toast.error("Please select a size");
                return;
              }

              addToCart(product, qty, selectedSize || null);
              toast.success("Added to Cart", { icon: "🛒" });
            }}
          >
            ADD TO CART 
          </button>

          {/* BUY NOW (FIXED LOGIC) */}
          <button
            className="buy-now"
            onClick={() => {
              if (product.sizes && !selectedSize) {
                toast.error("Please select a size");
                return;
              }

              addToCart(product, qty, selectedSize || null);
              navigate("/cart");
            }}
          >
            BUY NOW 
            
          </button>

          <button
            className="wishlist"
            onClick={() => setShowWishlistPopup(true)}
          >
            ♥ ADD TO WISHLIST
          </button>
        </div>
      </div>

      {/* WISHLIST POPUP */}
      {showWishlistPopup && (
        <div className="wishlist-overlay">
          <div className="wishlist-modal">
            <button
              className="close-btn"
              onClick={() => setShowWishlistPopup(false)}
            >
              ×
            </button>

            <h2>Please login to save your wishlist across devices.</h2>

            <button
              className="login-btn"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        </div>
      )}

      {/* ALSO BOUGHT */}
      <section className="also-bought">
        <h3 className="also-bought-title">
          FREQUENTLY BOUGHT TOGETHER
        </h3>

        <div className="also-bought-grid">
          {alsoBoughtProducts.map(item => (
            <div
              key={item.id}
              className="also-card"
              onClick={() => navigate(`/product/${item.id}`)}
            >
              <div className="also-img">
                <img src={item.images?.[0]} alt={item.title} />
              </div>

              <p className="also-title">{item.title}</p>

              <div className="also-price">
                <span>₹ {item.price}</span>
                {item.oldPrice && <del>₹ {item.oldPrice}</del>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <WatchShopSection />
    </>
  );
}
