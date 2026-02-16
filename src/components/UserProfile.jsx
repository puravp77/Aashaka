import React, { useEffect, useRef, useState } from "react";
import "./UserProfile.css";
import "../pages/OrderHistory.css";
import { useAuth } from "../context/AuthContext";
import { withPublicUrl } from "../utils/assetPath";

const STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Jammu and Kashmir",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Puducherry",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const CITY_MAP = {
  "Andaman and Nicobar Islands": ["Port Blair", "Car Nicobar", "Diglipur"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Tawang"],
  Assam: ["Guwahati", "Silchar", "Dibrugarh"],
  Bihar: ["Patna", "Gaya", "Bhagalpur"],
  Chandigarh: ["Chandigarh"],
  Chhattisgarh: ["Raipur", "Bilaspur", "Durg"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  Delhi: ["New Delhi", "Dwarka", "Rohini"],
  Goa: ["Panaji", "Margao", "Vasco da Gama"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  Haryana: ["Gurugram", "Faridabad", "Panipat"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala"],
  Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag"],
  Karnataka: ["Bengaluru", "Mysuru", "Mangaluru"],
  Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode"],
  Ladakh: ["Leh", "Kargil"],
  Lakshadweep: ["Kavaratti", "Minicoy"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
  Manipur: ["Imphal", "Bishnupur"],
  Meghalaya: ["Shillong", "Tura"],
  Mizoram: ["Aizawl", "Lunglei"],
  Nagaland: ["Kohima", "Dimapur"],
  Odisha: ["Bhubaneswar", "Cuttack", "Rourkela"],
  Punjab: ["Ludhiana", "Amritsar", "Jalandhar"],
  Puducherry: ["Puducherry", "Karaikal"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur"],
  Sikkim: ["Gangtok", "Namchi"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad"],
  Tripura: ["Agartala", "Udaipur"],
  "Uttar Pradesh": ["Lucknow", "Noida", "Varanasi", "Kanpur"],
  Uttarakhand: ["Dehradun", "Haridwar", "Haldwani"],
  "West Bengal": ["Kolkata", "Howrah", "Siliguri"],
};

const UserProfile = () => {
  const { user } = useAuth();
  const storedUser = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  })();
  const userId = user?.id || storedUser?.id || null;

  // Tabs
  const [activeTab, setActiveTab] = useState("address");

  // Address UI
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addresses, setAddresses] = useState([]);

  const [isStateOpen, setIsStateOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");

  const stateRef = useRef(null);
  const cityRef = useRef(null);

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

  const [errors, setErrors] = useState({});

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!userId) {
      setOrders([]);
      return;
    }

    let ignore = false;

    const loadOrders = async () => {
      try {
        const res = await fetch(`http://localhost:5000/orders?userId=${encodeURIComponent(userId)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!ignore) {
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!ignore) setOrders([]);
      }
    };

    loadOrders();
    return () => {
      ignore = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setAddresses([]);
      return;
    }

    let ignore = false;

    const loadAddresses = async () => {
      try {
        const res = await fetch(`http://localhost:5000/addresses?userId=${encodeURIComponent(userId)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!ignore) {
          setAddresses(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!ignore) setAddresses([]);
      }
    };

    loadAddresses();
    return () => {
      ignore = true;
    };
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (stateRef.current && !stateRef.current.contains(event.target)) {
        setIsStateOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setIsCityOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile" && !/^\d*$/.test(value)) return;
    if (name === "pincode" && !/^\d*$/.test(value)) return;

    setFormData((prev) => ({ ...prev, [name]: value }));

    let error = "";
    if (name === "email") {
      if (!value) error = "This field is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        error = "Enter a valid email address";
    }

    if (name === "mobile") {
      if (!value) error = "This field is required";
      else if (!/^\d{10}$/.test(value))
        error = "Enter 10 digit mobile number";
    }

    if (name === "pincode") {
      if (!value) error = "This field is required";
      else if (!/^\d{6}$/.test(value))
        error = "Enter 6 digit pincode";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const requiredFields = [
      "firstName",
      "middleName",
      "lastName",
      "mobile",
      "email",
      "company",
      "address1",
      "country",
      "state",
      "city",
      "pincode",
    ];

    const nextErrors = {};
    requiredFields.forEach((field) => {
      if (!formData[field]?.trim()) {
        nextErrors[field] = "This field is required";
      }
    });

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      nextErrors.mobile = "Enter 10 digit mobile number";
    }

    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      nextErrors.pincode = "Enter 6 digit pincode";
    }

    setErrors(nextErrors);
    return nextErrors;
  };

  const resetForm = () => {
    setFormData({
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
    setErrors({});
    setIsStateOpen(false);
    setIsCityOpen(false);
    setStateSearch("");
    setCitySearch("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) return;

    const newAddress = {
      userId,
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      mobile: formData.mobile,
      email: formData.email,
      company: formData.company,
      address1: formData.address1,
      address2: formData.address2,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      pincode: formData.pincode,
    };

    if (userId) {
      try {
        const res = await fetch("http://localhost:5000/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAddress),
        });
        if (res.ok) {
          const saved = await res.json();
          setAddresses((prev) => [...prev, saved]);
        } else {
          setAddresses((prev) => [...prev, newAddress]);
        }
      } catch (err) {
        setAddresses((prev) => [...prev, newAddress]);
      }
    }

    resetForm();
    setShowAddressForm(false);
  };

  const handleCancel = () => {
    setShowAddressForm(false);
    setIsStateOpen(false);
    setIsCityOpen(false);
  };

  const handleSelectState = (state) => {
    setFormData((prev) => ({ ...prev, state, city: "" }));
    setErrors((prev) => ({ ...prev, state: "", city: "" }));
    setIsStateOpen(false);
    setStateSearch("");
  };

  const handleSelectCity = (city) => {
    setFormData((prev) => ({ ...prev, city }));
    setErrors((prev) => ({ ...prev, city: "" }));
    setIsCityOpen(false);
    setCitySearch("");
  };

  const toggleStateDropdown = () => {
    setIsStateOpen((prev) => !prev);
    setIsCityOpen(false);
    setStateSearch("");
  };

  const toggleCityDropdown = () => {
    if (!formData.state) return;
    setIsCityOpen((prev) => !prev);
    setIsStateOpen(false);
    setCitySearch("");
  };

  const filteredStates = STATES.filter((state) =>
    state.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const cityOptions = CITY_MAP[formData.state] || [];
  const filteredCities = cityOptions.filter((city) =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <div className="profile-container">
      <div className="profile-inner">
        {/* PROFILE TABS */}
        <div className="profile-tabs">
          <button
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => {
              setActiveTab("orders");
              setShowAddressForm(false);
            }}
          >
            Order History
          </button>

          <button
            className={activeTab === "address" ? "active" : ""}
            onClick={() => setActiveTab("address")}
          >
            Addresses
          </button>
        </div>

          <div className="profile-content">
          {activeTab === "orders" && (
            <div className="orders-section">
              <h2>Your Orders</h2>
              {orders.length === 0 ? (
                <p>No orders placed yet.</p>
              ) : (
                <div className="order-history-list">
                  {orders.map((order) => (
                    <div className="order-history-card" key={order.orderId || order.id}>
                      <div className="order-history-header">
                        <div>
                          <div className="order-history-id">Order: {order.orderId || order.id}</div>
                          <div className="order-history-date">
                            {new Date(order.date).toLocaleString()}
                          </div>
                        </div>
                        <div className="order-history-total">
                          Rs. {order.total}
                        </div>
                      </div>

                      <div className="order-history-items">
                        {order.items.map((item) => (
                          <div
                            className="order-history-item"
                            key={`${order.orderId || order.id}-${item.id}-${item.size || "nosize"}`}
                          >
                            <img src={withPublicUrl(item.image)} alt={item.title} />
                            <div>
                              <div className="order-item-title">{item.title}</div>
                              {item.size && (
                                <div className="order-item-size">Size: {item.size}</div>
                              )}
                              <div className="order-item-qty">
                                x {item.qty} - Rs. {item.price * item.qty}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="order-history-summary">
                        <div>Subtotal: Rs. {order.subtotal}</div>
                        <div>
                          Shipping: {order.shipping === 0 ? "Free" : `Rs. ${order.shipping}`}
                        </div>
                        {order.discount > 0 && (
                          <div>Discount: - Rs. {order.discount}</div>
                        )}
                        <div className="order-summary-total">
                          Total: Rs. {order.total}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= ADDRESSES ================= */}
          {activeTab === "address" && (
            <div className="address-section">
              <h2 className="address-title">ADDRESSES</h2>

              <button
                className="add-address-btn"
                onClick={() => {
                  resetForm();
                  setShowAddressForm(true);
                }}
              >
                ADD ADDRESS
              </button>

              {!showAddressForm ? (
                <div className="address-table">
                  <div className="address-table-header">
                    <span>Name</span>
                    <span>Address</span>
                    <span>Change Address</span>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="address-empty">Address Not Available</div>
                  ) : (
                    addresses.map((addr, index) => (
                      <div className="address-table-row" key={index}>
                        <span>
                          {addr.firstName} {addr.middleName} {addr.lastName}
                        </span>
                        <span>
                          {addr.address1}
                          {addr.address2 ? `, ${addr.address2}` : ""},{" "}
                          {addr.city}, {addr.state} - {addr.pincode}
                        </span>
                        <span className="address-action">Edit</span>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <form className="address-form" onSubmit={handleSubmit}>
                  <div className="address-form-grid">
                    <div className="address-field">
                      <label>
                        First Name <span className="required">*</span>
                      </label>
                      <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                      {errors.firstName && (
                        <span className="field-error">{errors.firstName}</span>
                      )}
                    </div>

                    <div className="address-field">
                      <label>
                        Middle Name <span className="required">*</span>
                      </label>
                      <input
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleChange}
                      />
                      {errors.middleName && (
                        <span className="field-error">{errors.middleName}</span>
                      )}
                    </div>

                    <div className="address-field">
                      <label>
                        Last Name <span className="required">*</span>
                      </label>
                      <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                      {errors.lastName && (
                        <span className="field-error">{errors.lastName}</span>
                      )}
                    </div>

                    <div className="address-field">
                      <label>
                        Mobile No <span className="required">*</span>
                      </label>
                      <input
                        type="tel"
                        name="mobile"
                        maxLength="10"
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        title="Enter a 10 digit mobile number"
                        value={formData.mobile}
                        onChange={handleChange}
                      />
                      {errors.mobile && (
                        <span className="field-error">{errors.mobile}</span>
                      )}
                    </div>

                    <div className="address-field">
                      <label>
                        Email ID <span className="required">*</span>
                      </label>
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                      {errors.email && (
                        <span className="field-error">{errors.email}</span>
                      )}
                    </div>

                    <div className="address-field">
                      <label>
                        Company <span className="required">*</span>
                      </label>
                      <input
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                      />
                      {errors.company && (
                        <span className="field-error">{errors.company}</span>
                      )}
                    </div>

                    <div className="address-field">
                      <label>
                        Address <span className="required">*</span>
                      </label>
                      <textarea
                        name="address1"
                        placeholder="House number and street name"
                        value={formData.address1}
                        onChange={handleChange}
                      />
                      {errors.address1 && (
                        <span className="field-error">{errors.address1}</span>
                      )}
                    </div>

                    <div className="address-field">
                      <label>Address :</label>
                      <textarea
                        name="address2"
                        placeholder="Apartment,suite, unit,etc."
                        value={formData.address2}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="address-field">
                      <label>
                        Country <span className="required">*</span>
                      </label>
                      <input
                        name="country"
                        value={formData.country}
                        disabled
                      />
                      {errors.country && (
                        <span className="field-error">{errors.country}</span>
                      )}
                    </div>

                    <div className="address-field">
                      <label>
                        State <span className="required">*</span>
                      </label>
                      <div
                        className={`select-wrapper ${isStateOpen ? "open" : ""}`}
                        ref={stateRef}
                      >
                        <button
                          type="button"
                          className="select-trigger"
                          onClick={toggleStateDropdown}
                        >
                          <span
                            className={
                              formData.state ? "" : "select-placeholder"
                            }
                          >
                            {formData.state || "--------Select State--------"}
                          </span>
                          <span className="select-caret"></span>
                        </button>

                        {isStateOpen && (
                          <div className="select-panel">
                            <input
                              className="select-search"
                              placeholder="Search State"
                              value={stateSearch}
                              onChange={(e) => setStateSearch(e.target.value)}
                            />
                            <div className="select-options">
                              {filteredStates.length === 0 ? (
                                <div className="select-empty">No results</div>
                              ) : (
                                filteredStates.map((state) => (
                                  <button
                                    key={state}
                                    type="button"
                                    className={`select-option ${
                                      formData.state === state ? "selected" : ""
                                    }`}
                                    onClick={() => handleSelectState(state)}
                                  >
                                    {state}
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      {errors.state && (
                        <span className="field-error">{errors.state}</span>
                      )}
                    </div>

                    <div className="address-field">
                      <label>
                        City <span className="required">*</span>
                      </label>
                      <div
                        className={`select-wrapper ${
                          !formData.state ? "disabled" : ""
                        } ${isCityOpen ? "open" : ""}`}
                        ref={cityRef}
                      >
                        <button
                          type="button"
                          className="select-trigger"
                          onClick={toggleCityDropdown}
                          disabled={!formData.state}
                        >
                          <span
                            className={
                              formData.city ? "" : "select-placeholder"
                            }
                          >
                            {formData.city || "--------Select City--------"}
                          </span>
                          <span className="select-caret"></span>
                        </button>

                        {isCityOpen && (
                          <div className="select-panel">
                            <input
                              className="select-search"
                              placeholder="Search City"
                              value={citySearch}
                              onChange={(e) => setCitySearch(e.target.value)}
                            />
                            <div className="select-options">
                              {filteredCities.length === 0 ? (
                                <div className="select-empty">
                                  No results
                                </div>
                              ) : (
                                filteredCities.map((city) => (
                                  <button
                                    key={city}
                                    type="button"
                                    className={`select-option ${
                                      formData.city === city ? "selected" : ""
                                    }`}
                                    onClick={() => handleSelectCity(city)}
                                  >
                                    {city}
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      {errors.city && (
                        <span className="field-error">{errors.city}</span>
                      )}
                    </div>

                    <div className="address-field">
                      <label>
                        Pincode <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        maxLength="6"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        title="Enter a 6 digit pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                      />
                      {errors.pincode && (
                        <span className="field-error">{errors.pincode}</span>
                      )}
                    </div>
                  </div>

                  <div className="address-form-actions">
                    <button type="submit" className="submit-btn">
                      SUBMIT
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={handleCancel}
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
