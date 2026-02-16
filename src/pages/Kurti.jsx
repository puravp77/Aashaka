import "./Kurti.css";
import { useNavigate } from "react-router-dom";
import normalizedKurtiData from "../data/normalizedKurtiData";

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
        {normalizedKurtiData.map((item) => (
          <div
            key={item.id}
            className="kurti-item"
            onClick={() => navigate(`/product/${item.id}`)}
          >
            <img src={item.images[0]} alt={item.title} />
            <h3>{item.title}</h3>

            <div className="price">
              <span className="current">₹{item.price}</span>
              <span className="old">₹{item.oldPrice}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
