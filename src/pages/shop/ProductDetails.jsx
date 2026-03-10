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
  const { products, groupedProducts, productAliases, loading } = useProducts();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [openAccordion, setOpenAccordion] = useState(null);
  const [activeImg, setActiveImg] = useState("");
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const RECENTLY_VIEWED_STORAGE_KEY = "aashaka_recently_viewed";

  const canonicalId = productAliases?.[String(id)] || String(id);

  /* FIND PRODUCT */
  const product = !loading
    ? groupedProducts.find(p => String(p.id) === canonicalId)
    : null;
  const productVariants = useMemo(
    () => (Array.isArray(product?.variants) ? product.variants.filter((variant) => variant && variant.color) : []),
    [product]
  );
  const selectedVariant = useMemo(() => {
    if (!productVariants.length) return null;
    return (
      productVariants.find((variant) => variant.color === selectedColor) ||
      productVariants[0]
    );
  }, [productVariants, selectedColor]);
  const activeSizes = useMemo(
    () => selectedVariant?.sizes || product?.sizes || {},
    [selectedVariant, product]
  );
  const hasSizes = Object.keys(activeSizes).length > 0;
  const activeImages = useMemo(
    () => ((selectedVariant?.images?.length ? selectedVariant.images : product?.images) || []).map(withPublicUrl),
    [selectedVariant, product]
  );
  const requiresSizeSelection = hasSizes && !selectedSize;
  const selectedStock = useMemo(() => {
    if (!hasSizes || !selectedSize) return null;
    const raw = activeSizes[selectedSize];
    return Number.isFinite(Number(raw)) ? Number(raw) : 0;
  }, [activeSizes, hasSizes, selectedSize]);
  useEffect(() => {
    if (selectedStock === null) return;
    setQty((prev) => Math.min(Math.max(1, prev), selectedStock || 1));
  }, [selectedStock]);

  /* SCROLL TOP */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  /* DEFAULT IMAGE */
  useEffect(() => {
    if (activeImages.length) {
      setActiveImg(activeImages[0]);
    }
  }, [activeImages]);

  useEffect(() => {
    if (productVariants.length > 0) {
      setSelectedColor((prev) => {
        const routeVariant = productVariants.find(
          (variant) => String(variant.sourceId) === String(id)
        );

        if (routeVariant) {
          return routeVariant.color;
        }
        if (prev && productVariants.some((variant) => variant.color === prev)) {
          return prev;
        }
        return productVariants[0].color;
      });
      return;
    }

    setSelectedColor(null);
  }, [id, productVariants]);

  useEffect(() => {
    setSelectedSize(null);
    setQty(1);
  }, [selectedColor, id]);

  useEffect(() => {
    if (!product?.id) return;

    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const existing = Array.isArray(parsed) ? parsed.map(String) : [];
      const next = [
        String(product.id),
        ...existing.filter((idValue) => idValue !== String(product.id)),
      ].slice(0, 12);
      localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      // ignore storage errors in private mode or restricted environments
    }
  }, [product?.id]);

  /* ALSO BOUGHT */
  const alsoBoughtProducts = useMemo(() => {
    if (!product) return [];

    const usedIds = new Set([product.id]);

    const manual =
      product.alsoBought
        ?.map(pid => groupedProducts.find(p => p.id === pid) || products.find(p => p.id === pid))
        .filter(Boolean) || [];

    manual.forEach(p => usedIds.add(p.id));

    const sameCategory = groupedProducts
      .filter(
        p =>
          p.category === product.category &&
          !usedIds.has(p.id)
      )
      .sort(() => Math.random() - 0.5);

    sameCategory.forEach(p => usedIds.add(p.id));

    const randomOthers = groupedProducts
      .filter(p => !usedIds.has(p.id))
      .sort(() => Math.random() - 0.5);

    return [...manual, ...sameCategory, ...randomOthers].slice(0, 4);
  }, [groupedProducts, product, products]);

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

  const images = activeImages;
  const title = product.title;
  const price = product.price;
  const oldPrice = product.oldPrice;
  const inWishlist = isInWishlist(product.id);

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

          {productVariants.length > 0 && (
            <div className="color-section">
              <p className="color-title">Colors:</p>
              <div className="color-options">
                {productVariants.map((variant) => {
                  const variantImage = withPublicUrl(variant.images?.[0] || product.images?.[0]);
                  const isActive = selectedColor === variant.color;

                  return (
                    <button
                      key={variant.color}
                      type="button"
                      className={`color-card ${isActive ? "active" : ""}`}
                      onClick={() => setSelectedColor(variant.color)}
                    >
                      {variantImage && (
                        <img src={variantImage} alt={`${title} ${variant.color}`} />
                      )}
                      <span>{variant.color}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SIZE */}
          {hasSizes && (
            <div className="size-section">
              <p className="size-title">Size:</p>
              <div className="size-options">
                {Object.entries(activeSizes).map(([size, stock]) => (
                  <button
                    key={size}
                    className={`size-btn 
                      ${selectedSize === size ? "active" : ""}
                      ${stock === 0 ? "disabled" : ""}
                    `}
                    disabled={stock === 0}
                    onClick={() => setSelectedSize(size)}
                    title={stock === 0 ? `${size} out of stock` : `${size} — ${stock} left`}
                  >
                    {size}
                  </button>
                ))}
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
                disabled={requiresSizeSelection}
                onClick={() => setQty(q => Math.max(1, q - 1))}
              >
                -
              </button>
              <span>{requiresSizeSelection ? "-" : qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={requiresSizeSelection}
                onClick={() => {
                  const limit = selectedStock ?? 9;
                  if (qty >= limit) {
                    toast.error("Out of stock for this size", { toastId: "out-of-stock" });
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
              if (hasSizes && !selectedSize) {
                toast.error("Please select a size", { toastId: "select-size" });
                return;
              }
              if (selectedStock !== null && qty > selectedStock) {
                toast.error(`Only ${selectedStock} available for ${selectedSize}`, { toastId: "qty-too-high" });
                setQty(selectedStock);
                return;
              }

              addToCart(
                {
                  ...product,
                  images: selectedVariant?.images?.length ? selectedVariant.images : product.images,
                  sizes: activeSizes,
                },
                qty,
                selectedSize || null,
                selectedColor || null
              );
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
              if (hasSizes && !selectedSize) {
                toast.error("Please select a size", { toastId: "select-size" });
                return;
              }
              if (selectedStock !== null && qty > selectedStock) {
                toast.error(`Only ${selectedStock} available for ${selectedSize}`, { toastId: "qty-too-high" });
                setQty(selectedStock);
                return;
              }

              addToCart(
                {
                  ...product,
                  images: selectedVariant?.images?.length ? selectedVariant.images : product.images,
                  sizes: activeSizes,
                },
                qty,
                selectedSize || null,
                selectedColor || null
              );
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
                if (hasSizes && !selectedSize) {
                  toast.error("Please select a size", { toastId: "select-size" });
                  return;
                }
                addToWishlist(
                  {
                    ...product,
                    images: selectedVariant?.images?.length ? selectedVariant.images : product.images,
                  },
                  selectedSize || null,
                  selectedColor || null
                );
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

