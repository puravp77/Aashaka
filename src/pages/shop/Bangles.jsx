import "./Bangles.css";
import { withPublicUrl } from "../../utils/assetPath";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
const banglesData = [
  {
    id: "b1",
    name: "Aaina Ghungroo Silver Bangles Set",
    price: 899,
    oldPrice: 1600,
    image: "images/b1.jpg",
  },
  {
    id: "b2",
    name: "Black And Silver Kada Set",
    price: 1299,
    oldPrice: 2200,
    image: "images/b2.jpg",
  },
  {
    id: "b3",
    name: "Black Samudra Shell Kada Set",
    price: 999,
    oldPrice: 1800,
    image: "images/b3.jpg",
  },
  {
    id: "b4",
    name: "Intricate Jaali Work Oxidized Silver Kada Bracelets",
    price: 1499,
    oldPrice: 2500,
    image: "images/b4.jpg",
  },
  {
    id: "b5",
    name: "Phool Ghungroo Antique Bangle Set",
    price: 1499,
    oldPrice: 2500,
    image: "images/b5.jpg",
  },
  {
    id: "b6",
    name: "Rajwadi Ghungroo Kada Set",
    price: 1499,
    oldPrice: 2500,
    image: "images/b6.jpg",
  },
  {
    id: "b7",
    name: "Rajwadi Ghungroo Kada Set",
    price: 234,
    oldPrice: 300,
    image: "images/b7.jpg",
  },
  {
    id: "b8",
    name: "Rajwadi Ghungroo Kada Set",
    price: 769,
    oldPrice: 1399,
    image: "images/b8.jpg",
  },
];

function Bangles() {
  const navigate = useNavigate();
    const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const itemMotion = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="bangles-section">
      <motion.div
        className="bangles-grid"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
      >
        {banglesData.map((product) => (
          <motion.div
            className="product-card"
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            style={{ cursor: "pointer" }}
            variants={itemMotion}
          >
            <div className="product-image">
              <img src={withPublicUrl(product.image)} alt={product.name} />
            </div>

            <div className="product-info">
              <h3 className="product-title">{product.name}</h3>

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

export default Bangles;


