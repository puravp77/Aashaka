import { motion } from "framer-motion";
import { withPublicUrl } from "../../utils/assetPath";

export default function ProductCard({ product, index = 0, onClick, showCategory = false }) {
  const footwearFallback = "/images/f1.jpg";
  const defaultFallback = footwearFallback;
  const primaryImage = product.images?.[0];
  const secondaryImage = product.images?.[1] || primaryImage;
  const hasSecondaryImage = Boolean(
    product.images?.[1] && product.images[1] !== product.images[0]
  );
  const categoryLabel = String(product?.category || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <motion.div
      className={`product-card ${hasSecondaryImage ? "has-secondary-image" : ""}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={onClick}
    >
      <div className="image-wrapper">
        <img
          className="product-image product-image-primary"
          src={primaryImage ? withPublicUrl(primaryImage) : defaultFallback}
          alt={product.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = footwearFallback;
          }}
        />
        {hasSecondaryImage && (
          <img
            className="product-image product-image-secondary"
            src={withPublicUrl(secondaryImage)}
            alt={`${product.title} alternate view`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = footwearFallback;
            }}
          />
        )}
      </div>

      <div className="info">
        {showCategory && <span className="product-category-chip">{categoryLabel}</span>}
        <h3>{product.title}</h3>
        <div className="price-box">
          <span className="current">{"\u20B9"}{product.price}</span>
          {product.oldPrice && <span className="old">{"\u20B9"}{product.oldPrice}</span>}
        </div>
      </div>
    </motion.div>
  );
}
