import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import "./ProductDetails.css";
import { withPublicUrl } from "../../utils/assetPath";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";
import WatchShopSection from "../../components/home/WatchShopSection";
import { useProducts } from "../../context/ProductContext";
import { useWishlist } from "../../context/WishlistContext";
import { FiCreditCard, FiTruck } from "react-icons/fi";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products, loading } = useProducts();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [openAccordion, setOpenAccordion] = useState(null);
  const [activeImg, setActiveImg] = useState("");
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);

  /* FIND PRODUCT */
  const product = !loading
    ? products.find(p => String(p.id) === String(id))
    : null;

  /* SCROLL TOP */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  /* DEFAULT IMAGE */
  useEffect(() => {
    if (product?.images?.length) {
      setActiveImg(withPublicUrl(product.images[0]));
    }
  }, [product]);

  /* ALSO BOUGHT */
  const alsoBoughtProducts = useMemo(() => {
    if (!product) return [];

    const usedIds = new Set([product.id]);

    const manual =
      product.alsoBought
        ?.map(pid => products.find(p => p.id === pid))
        .filter(Boolean) || [];

    manual.forEach(p => usedIds.add(p.id));

    const sameCategory = products
      .filter(
        p =>
          p.category === product.category &&
          !usedIds.has(p.id)
      )
      .sort(() => Math.random() - 0.5);

    sameCategory.forEach(p => usedIds.add(p.id));

    const randomOthers = products
      .filter(p => !usedIds.has(p.id))
      .sort(() => Math.random() - 0.5);

    return [...manual, ...sameCategory, ...randomOthers].slice(0, 4);
  }, [product, products]);

  /* LOADING */
  if (loading) {
    return (
      <h2 style={{ padding: "80px", textAlign: "center" }}>
        Loading product...
      </h2>
    );
  }

  /* SAFETY */
  if (!product) {
    return (
      <h2 style={{ padding: "80px", textAlign: "center" }}>
        Product not found
      </h2>
    );
  }

  const images = (product.images || []).map(withPublicUrl);
  const title = product.title;
  const price = product.price;
  const oldPrice = product.oldPrice;
  const inWishlist = isInWishlist(product.id);
  const hasSizes = Boolean(product.sizes);

  const discountPercent =
    oldPrice && price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;
  const savings =
    oldPrice && price && oldPrice > price ? oldPrice - price : 0;

  const accordionSections = [
    {
      key: "description",
      title: "DESCRIPTION",
      content: (
        <p>
          {product.description ||
            `Experience the elegance of ${title} crafted for effortless everyday style.`}
        </p>
      ),
    },
    {
      key: "material",
      title: "MATERIAL",
      content: (
        <p>
          {product.details?.material ||
            "Premium materials selected for comfort and durability."}
        </p>
      ),
    },
    {
      key: "style",
      title: "STYLE NOTES",
      content: (
        <p>
          Pair it with classic jewellery and minimal accessories for a refined look.
        </p>
      ),
    },
    {
      key: "shipping",
      title: "SHIPPING",
      content: (
        <p>
          Ships within 2-4 business days. Easy returns available within 7 days.
        </p>
      ),
    },
  ];

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
            {activeImg && <img src={withPublicUrl(activeImg)} alt={title} />}
          </div>
        </div>

        {/* RIGHT */}
        <div className="product-info-panel">
          <h1>{title}</h1>

          <div className="product-meta">
            {product.category && (
              <span className="meta-pill">{product.category}</span>
            )}
            {discountPercent > 0 && (
              <span className="meta-pill sale">Save {discountPercent}%</span>
            )}
          </div>

          <div className="price-row">
            <span className="price">Rs. {price}</span>
            {discountPercent > 0 && (
              <span className="off">{discountPercent}% off</span>
            )}
            {oldPrice && <span className="old">Rs. {oldPrice}</span>}
          </div>
          {savings > 0 && (
            <div className="savings">You save Rs. {savings}</div>
          )}

          {/* SIZE */}
          {hasSizes && (
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
              <div className="size-help">
                {selectedSize
                  ? `Selected: ${selectedSize}`
                  : "Select a size to continue"}
              </div>
            </div>
          )}

          {/* QUANTITY */}
          <div className="quantity-row">
            <span>QUANTITY</span>
            <div className="qty-box">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty(q => Math.max(1, q - 1))}
              >
                -
              </button>
              <span>{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => {
                  if (qty >= 9) {
                    toast.error("Out of stock", { toastId: "out-of-stock" });
                    return;
                  }
                  setQty(q => q + 1);
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* ADD TO CART */}
          <button
            className="add-cart"
            onClick={() => {
              if (product.sizes && !selectedSize) {
                toast.error("Please select a size", { toastId: "select-size" });
                return;
              }

              addToCart(product, qty, selectedSize || null);
              toast.success("Added to Cart", {
                toastId: "added-to-cart",
              });
            }}
          >
            ADD TO CART
          </button>

          {/* BUY NOW */}
          <button
            className="buy-now"
            onClick={() => {
              if (product.sizes && !selectedSize) {
                toast.error("Please select a size", { toastId: "select-size" });
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
            onClick={() => {
              if (inWishlist) {
                removeFromWishlist(product.id);
              } else {
                if (product.sizes && !selectedSize) {
                  toast.error("Please select a size", { toastId: "select-size" });
                  return;
                }
                addToWishlist(product, selectedSize || null);
              }
            }}
          >
            {inWishlist ? "REMOVE FROM WISHLIST" : "ADD TO WISHLIST"}
          </button>

          <div className="product-perks">
            <div className="perk-item">
              <FiTruck className="perk-icon" />
              <span>Express Shipping</span>
            </div>
            <div className="perk-item">
              <FiCreditCard className="perk-icon" />
              <span>Cash on Delivery Available</span>
            </div>
          </div>

          <div className="product-accordion">
            {accordionSections.map((section) => (
              <div className="product-accordion-item" key={section.key}>
                <button
                  type="button"
                  className="product-accordion-header"
                  onClick={() =>
                    setOpenAccordion((prev) =>
                      prev === section.key ? null : section.key
                    )
                  }
                >
                  <span className="product-accordion-title">
                    {section.title}
                  </span>
                  <span className="product-accordion-icon">
                    {openAccordion === section.key ? "-" : "+"}
                  </span>
                </button>
                {openAccordion === section.key && (
                  <div className="product-accordion-body">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {alsoBoughtProducts.length > 0 && (
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
                  <img src={withPublicUrl(item.images?.[0])} alt={item.title} />
                </div>
                <div className="also-info">
                  <p className="also-title">{item.title}</p>
                  <div className="also-price">
                    <span>Rs. {item.price}</span>
                    {item.oldPrice && <del>Rs. {item.oldPrice}</del>}
                  </div>
                  <button className="also-cta" type="button">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <WatchShopSection />
    </>
  );
}

