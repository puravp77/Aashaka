import "./Kurti.css";
import { withPublicUrl } from "../../utils/assetPath";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../../context/ProductContext";

export default function Kurti() {
  const navigate = useNavigate();
  const { products } = useProducts();
  const kurtiProducts = products.filter((product) => product.category === "kurti");

  return (
    <section className="kurti-page">
      <div className="kurti-top">
        <span className="count">{kurtiProducts.length} PRODUCTS</span>
      </div>

      <div className="kurti-grid">
        {kurtiProducts.map((product) => (
          <div
            key={product.id}
            className="kurti-item"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            <img src={withPublicUrl(product.images[0])} alt={product.title} />
            <h3>{product.title}</h3>

            <div className="price">
              <span className="current">Rs.{product.price}</span>
              {product.oldPrice && <span className="old">Rs.{product.oldPrice}</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
