import "./Earrings.css";
import { withPublicUrl } from "../../utils/assetPath";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../../context/ProductContext";

function Earrings() {
  const navigate = useNavigate();
  const { products } = useProducts();

  const earrings = products.filter((item) => item.category === "earrings");

  return (
    <section className="earrings-section">
      <div className="earrings-grid">
        {earrings.map((product) => (
          <div
            className="product-card"
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            style={{ cursor: "pointer" }}
          >
            <div className="product-image">
              <img src={withPublicUrl(product.images[0])} alt={product.title} />
            </div>

            <div className="product-info">
              <h3 className="product-title">{product.title}</h3>

              <div className="product-price">
                <span className="price">Rs.{product.price}</span>
                {product.oldPrice && (
                  <span className="old-price">Rs.{product.oldPrice}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Earrings;
