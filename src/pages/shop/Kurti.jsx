import "./Kurti.css";
import { withPublicUrl } from "../../utils/assetPath";
import { useNavigate } from "react-router-dom";
import normalizedKurtiData from "../../data/normalizedKurtiData";

export default function Kurti() {

  const navigate = useNavigate();

  return (
    <section className="kurti-page">
      <div className="kurti-top">
        <span className="count">
          {normalizedKurtiData.length} PRODUCTS
        </span>
      </div>

      <div className="kurti-grid">
        {normalizedKurtiData.map((product) => (
          <div
            key={product.id}
            className="kurti-item"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            <img src={withPublicUrl(product.images[0])} alt={product.title} />
            <h3>{product.title}</h3>

            <div className="price">
              <span className="current">₹{product.price}</span>
              <span className="old">₹{product.oldPrice}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

