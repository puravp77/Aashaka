import "./Necklace.css";
import { withPublicUrl } from "../../utils/assetPath";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../../context/ProductContext";

function Necklace() {
  const navigate = useNavigate();
  const { products } = useProducts();

  const necklaces = products.filter((item) => item.category === "necklace");

  return (
    <section className="necklace-section">
      <div className="necklace-grid">
        {necklaces.map((product) => (
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

export default Necklace;
