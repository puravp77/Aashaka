import "./Necklace.css";
import { useNavigate } from "react-router-dom";
import allProducts from "../data/allProducts";

function Necklace() {
  const navigate = useNavigate();

  const necklaces = allProducts.filter(
    (item) => item.category === "necklace"
  );

  return (
    <section className="necklace-section">
      <div className="necklace-grid">
        {necklaces.map((item) => (
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

export default Necklace;
