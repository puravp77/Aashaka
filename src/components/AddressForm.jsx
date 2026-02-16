import React, { useState } from "react";
import "./AddressForm.css";

const AddressForm = ({ onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    mobile: "",
    email: "",
    company: "",
    address1: "",
    address2: "",
    country: "India",
    state: "",
    city: "",
    pincode: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.mobile ||
      !formData.address1 ||
      !formData.state ||
      !formData.city ||
      !formData.pincode
    ) {
      alert("Please fill all required fields");
      return;
    }

    onSave(formData);
  };

  return (
    <form className="address-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div>
          <label>First Name *</label>
          <input name="firstName" value={formData.firstName} onChange={handleChange} />
        </div>

        <div>
          <label>Middle Name</label>
          <input name="middleName" value={formData.middleName} onChange={handleChange} />
        </div>

        <div>
          <label>Last Name *</label>
          <input name="lastName" value={formData.lastName} onChange={handleChange} />
        </div>

        <div>
          <label>Mobile No *</label>
          <input name="mobile" value={formData.mobile} onChange={handleChange} />
        </div>

        <div>
          <label>Email </label>
          <input name="email" value={formData.email} onChange={handleChange} />
        </div>

        <div>
          <label>Company</label>
          <input name="company" value={formData.company} onChange={handleChange} />
        </div>

        <div>
          <label>Address *</label>
          <textarea
            name="address1"
            value={formData.address1}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Address 2</label>
          <textarea
            name="address2"
            value={formData.address2}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Country *</label>
          <input name="country" value={formData.country} disabled />
        </div>

        <div>
          <label>State *</label>
          <input name="state" value={formData.state} onChange={handleChange} />
        </div>

        <div>
          <label>City *</label>
          <input name="city" value={formData.city} onChange={handleChange} />
        </div>

        <div>
          <label>Pincode *</label>
          <input name="pincode" value={formData.pincode} onChange={handleChange} />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit">SUBMIT</button>
        <button type="button" onClick={onCancel}>
          CANCEL
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
