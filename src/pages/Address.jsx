import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Address.css";

export default function Address() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, phone, email, address, city, state, pincode } = formData;

    if (
      !name ||
      !phone ||
      !email ||
      !address ||
      !city ||
      !state ||
      !pincode
    ) {
      setError("Please fill all the required fields");
      return;
    }

    // Save address temporarily (for order review)
    localStorage.setItem("aashaka_address", JSON.stringify(formData));

    navigate("/order-review");
  };

  return (
    <section className="address-page">
      <h2 className="address-title">Delivery Details</h2>

      <form className="address-form" onSubmit={handleSubmit}>
        {error && <p className="error-text">{error}</p>}

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
        />

        <textarea
          name="address"
          placeholder="House no, Street, Area"
          value={formData.address}
          onChange={handleChange}
          rows="3"
        />

        <div className="address-row">
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
          />

          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
          />
        </div>

        <input
          type="text"
          name="pincode"
          placeholder="Pincode"
          value={formData.pincode}
          onChange={handleChange}
        />

        <button type="submit" className="continue-btn">
          CONTINUE
        </button>
      </form>
    </section>
  );
}
