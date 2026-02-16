import "./Bangles.css";
import { useNavigate } from "react-router-dom";

const banglesData = [
  {
    id: "b1",
    name: "Aaina Ghungroo Silver Bangles Set",
    price: 899,
    oldPrice: 1600,
    image: "/images/b1.jpg",
  },
  {
    id: "b2",
    name: "Black And Silver Kada Set",
    price: 1299,
    oldPrice: 2200,
    image: "/images/b2.jpg",
  },
  {
    id: "b3",
    name: "Black Samudra Shell Kada Set",
    price: 999,
    oldPrice: 1800,
    image: "/images/b3.jpg",
  },
  {
    id: "b4",
    name: "Intricate Jaali Work Oxidized Silver Kada Bracelets",
    price: 1499,
    oldPrice: 2500,
    image: "/images/b4.jpg",
  },
  {
    id: "b5",
    name: "Phool Ghungroo Antique Bangle Set",
    price: 1499,
    oldPrice: 2500,
    image: "/images/b5.jpg",
  },
  {
    id: "b6",
    name: "Rajwadi Ghungroo Kada Set",
    price: 1499,
    oldPrice: 2500,
    image: "/images/b6.jpg",
  },
];

function Bangles() {
  const navigate = useNavigate();

  return (
    <section className="bangles-section">
      <div className="bangles-grid">
        {banglesData.map((item) => (
          <div
            className="product-card"
            key={item.id}
            onClick={() => navigate(`/product/${item.id}`)}
            style={{ cursor: "pointer" }}
          >
            <div className="product-image">
              <img src={item.image} alt={item.name} />
            </div>

            <div className="product-info">
              <h3 className="product-title">{item.name}</h3>

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

export default Bangles;
