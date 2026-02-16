import "./Necklace.css";
import { withPublicUrl } from "../utils/assetPath";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import allProducts from "../data/allProducts";

function Necklace() {
  const navigate = useNavigate();

  const necklaces = allProducts.filter(
    (item) => item.category === "necklace"
  );

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const itemMotion = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="necklace-section">
      <motion.div
        className="necklace-grid"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
      >
        {necklaces.map((product) => (
          <motion.div
            className="product-card"
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            style={{ cursor: "pointer" }}
            variants={itemMotion}
          >
            <div className="product-image">
              <img src={withPublicUrl(product.images[0])} alt={product.title} />
            </div>

            <div className="product-info">
              <h3 className="product-title">{product.title}</h3>

              <div className="product-price">
                <span className="price">₹{product.price}</span>
                <span className="old-price">₹{product.oldPrice}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default Necklace;
