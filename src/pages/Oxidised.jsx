import "./Oxidised.css";
import { useNavigate } from "react-router-dom";
import allProducts from "../data/allProducts";

function Oxidised() {
  const navigate = useNavigate();

  const oxidised = allProducts.filter(
    (item) => item.category === "oxidised"
  );

  return (
    <section className="oxidised-section">
      <div className="oxidised-grid">
        {oxidised.map((item) => (
          <div
            className="product-card"
            key={item.id}
            onClick={() => navigate(`/product/${item.id}`)}
            style={{ cursor: "pointer" }}
          >
            <div className="product-image">
              <img src={item.images[0]} alt={item.title} />
            </div>

            <div className="product-info">
              <h3 className="product-title">{item.title}</h3>

              <div className="product-price">
                <span className="price">₹{item.price}</span>
                <span className="old-price">₹{item.oldPrice}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Oxidised;
