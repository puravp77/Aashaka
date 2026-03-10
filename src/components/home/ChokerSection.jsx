import "./ChokerSection.css";
import { withPublicUrl } from "../../utils/assetPath";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import allProducts from "../../data/allProducts";

export default function ChokerSection() {
  const navigate = useNavigate();
  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
  };

  const chokers = allProducts.filter((product) => product.category === "choker");

  return (
    <section className="choker-section">
      <div className="choker-head">
        <p className="choker-kicker">Signature Picks</p>
        <h2 className="choker-title">Choker Collection</h2>
        <p className="choker-subtitle">
          Festive sparkle and statement silhouettes curated for every look.
        </p>
      </div>

      <motion.div
        className="choker-grid"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
      >
        {chokers.map((product) => (
          <motion.div
            className="choker-card"
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            style={{ cursor: "pointer" }}
            variants={item}
          >
            <div className="choker-image-wrap">
              <img src={withPublicUrl(product.images[0])} alt={product.title} />
              <div className="choker-hover-overlay" />
              <span className="choker-badge">Curated</span>
              <span className="choker-view-icon">View</span>
            </div>

            <div className="choker-info">
              <p className="choker-product-title">{product.title}</p>

              <div className="choker-price-row">
                <span className="choker-price">{"\u20B9"}{product.price}</span>
                <span className="choker-old-price">{"\u20B9"}{product.oldPrice}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
