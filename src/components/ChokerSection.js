import "./ChokerSection.css";
import { useNavigate } from "react-router-dom";
import allProducts from "../data/allProducts";

export default function ChokerSection() {
  const navigate = useNavigate();

  const chokers = allProducts.filter(
    (item) => item.category === "choker"
  );

  return (
    <section className="choker-section">
      <h2 className="choker-title">CHOKER</h2>

      <div className="choker-grid">
        {chokers.map((product) => (
          <div
            className="product-card"
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            style={{ cursor: "pointer" }}
          >
            <div className="product-image">
              <img src={product.images[0]} alt={product.title} />
              <div className="hover-overlay"></div>
              <span className="view-icon">👁</span>
            </div>

            <div className="product-info">
              <p className="product-title">{product.title}</p>

              <div className="product-price">
                <span className="price">₹{product.price}</span>
                <span className="old-price">₹{product.oldPrice}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
