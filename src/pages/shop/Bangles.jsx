import "./Bangles.css";
import { withPublicUrl } from "../../utils/assetPath";
import { useNavigate } from "react-router-dom";
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
    name: "Antique Peacock Engraved Kada",
    price: 279,
    oldPrice: 300,
    image: "images/b7.jpg",
  },
  {
    id: "b8",
    name: "Royal Coin Charm Cuff Kada",
    price: 749,
    oldPrice: 1399,
    image: "images/b8.jpg",
  },
  {
    id: "b9",
    name: "Mirror Work Tribal Bracelet Kada",
    price: 799,
    oldPrice: 1399,
    image: "images/b9.jpg",
  },
  {
    id: "b10",
    name: "Lotus Motif Oxidised Kada",
    price: 829,
    oldPrice: 1399,
    image: "images/b10.jpg",
  },
  {
    id: "b11",
    name: "Temple Bell Ghungroo Kada",
    price: 869,
    oldPrice: 1399,
    image: "images/b11.jpg",
  },
  {
    id: "b12",
    name: "Floral Jaali Open Cuff Kada",
    price: 919,
    oldPrice: 1399,
    image: "images/b12.jpg",
  },
  {
    id: "b13",
    name: "Dual Tone Hammered Kada",
    price: 969,
    oldPrice: 1399,
    image: "images/b13.jpg",
  },
  {
    id: "b14",
    name: "Regal Elephant Carved Kada",
    price: 1029,
    oldPrice: 1399,
    image: "images/b14.jpg",
  },
  {
    id: "b15",
    name: "Vintage Crescent Statement Kada",
    price: 1099,
    oldPrice: 1399,
    image: "images/b15.jpg",
  },
];

function Bangles() {
  const navigate = useNavigate();

  return (
    <section className="bangles-section">
      <div className="bangles-grid">
        {banglesData.map((product) => (
          <div
            className="product-card"
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            style={{ cursor: "pointer" }}
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
          </div>
        ))}
      </div>
    </section>
  );
}

export default Bangles;


