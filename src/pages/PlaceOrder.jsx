import "./PlaceOrder.css";
import { withPublicUrl } from "../utils/assetPath";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useRef } from "react";


/* =============================
   DEMO COUPONS (TEMP ONLY)
============================= */
const COUPONS = [
  { code: "AASHAKA100", type: "flat", value: 100, minCart: 999 },
  { code: "SAVE10", type: "percent", value: 10, minCart: 1999 },
];

export default function PlaceOrder() {
  const navigate = useNavigate();
  const fieldRefs = useRef({});

  const { cartItems, total, clearCart } = useCart();
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

  const [paymentMode, setPaymentMode] = useState("COD");

  /* =============================
     ORIGINAL FORM STATE
  ============================= */
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    middleName: "",
    lastName: "",
    address1: "",
    address2: "",
    state: "",
    city: "",
    pincode: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const checkoutKey = userId ? `aashaka_checkout_${userId}` : "aashaka_checkout_guest";
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(checkoutKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          setForm((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch (err) {
    }
  }, [checkoutKey]);

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
    try {
      localStorage.setItem(checkoutKey, JSON.stringify(form));
    } catch (err) {
    }
  }, [form, checkoutKey]);

  const applyAddress = (addr) => {
    if (!addr) return;
    setForm((prev) => ({
      ...prev,
      firstName: addr.firstName || "",
      middleName: addr.middleName || "",
      lastName: addr.lastName || "",
      phone: addr.mobile || "",
      email: addr.email || "",
      address1: addr.address1 || "",
      address2: addr.address2 || "",
      state: addr.state || "",
      city: addr.city || "",
      pincode: addr.pincode || "",
    }));
  };

  /* =============================
     ORIGINAL HANDLE CHANGE
  ============================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone" && !/^\d*$/.test(value)) return;
    if (name === "pincode" && !/^\d*$/.test(value)) return;

    setForm((prev) => ({ ...prev, [name]: value }));

    let error = "";

    if (name === "email") {
      if (!value) error = "Email ID is required";
      else if (!/\S+@\S+\.\S+/.test(value))
        error = "Enter a valid Email ID";
    }

    if (name === "phone") {
      if (!value) error = "Mobile number is required";
      else if (value.length !== 10)
        error = "Enter 10 digit mobile number";
    }

    if (name === "pincode") {
      if (!value) error = "Pincode is required";
      else if (value.length !== 6)
        error = "Enter 6 digit pincode";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  /* =============================
     ORIGINAL VALIDATION
  ============================= */
  const validateForm = () => {
    const err = {};

    if (!form.email) err.email = "Email ID is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      err.email = "Enter a valid Email ID";

    if (!form.firstName) err.firstName = "First name is required";
    if (!form.lastName) err.lastName = "Last name is required";
    if (!form.address1) err.address1 = "Address is required";
    if (!form.state) err.state = "State is required";
    if (!form.city) err.city = "City is required";

    if (!form.pincode) err.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(form.pincode))
      err.pincode = "Enter 6 digit pincode";

    if (!form.phone) err.phone = "Mobile number is required";
    else if (!/^\d{10}$/.test(form.phone))
      err.phone = "Enter 10 digit mobile number";

    setErrors(err);
    return err;
  };

  /* =============================
     APPLY COUPON (DEMO)
  ============================= */
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponStatus, setCouponStatus] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  const handleApplyCoupon = () => {
    setCouponStatus("");
    setCouponMessage("");
    setDiscount(0);

    if (!coupon) {
      setCouponStatus("error");
      setCouponMessage("Please enter a coupon code");
      return;
    }

    const found = COUPONS.find(
      (c) => c.code === coupon.toUpperCase()
    );

    if (!found) {
      setCouponStatus("error");
      setCouponMessage("Invalid coupon code");
      return;
    }

    if (total < found.minCart) {
      setCouponStatus("error");
      setCouponMessage(`Minimum cart value ₹${found.minCart} required`);
      return;
    }

    const applied =
      found.type === "flat"
        ? found.value
        : Math.round((total * found.value) / 100);

    setDiscount(applied);
    setCouponStatus("success");
    setCouponMessage("Coupon applied successfully!");
  };

  /* =============================
     PLACE ORDER (UNCHANGED)
  ============================= */
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    const err = validateForm();

    if (Object.keys(err).length > 0) {
      const firstErrorField = Object.keys(err)[0];
      if (fieldRefs.current[firstErrorField]) {
        fieldRefs.current[firstErrorField].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        fieldRefs.current[firstErrorField].focus();
      }
      return;
    }

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const orderDate = new Date().toISOString();
    const orderRecord = {
      orderId,
      userId: userId || form.email || null,
      date: orderDate,
      items: cartItems.map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        qty: item.qty,
        size: item.size || null,
        image: withPublicUrl(item.image),
      })),
      subtotal: total,
      shipping: SHIPPING_CHARGE,
      discount,
      total: finalTotal,
      paymentMode,
      shippingAddress: {
        email: form.email,
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,
        address1: form.address1,
        address2: form.address2,
        state: form.state,
        city: form.city,
        pincode: form.pincode,
        phone: form.phone,
      },
    };

    try {
      await fetch("http://localhost:5000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderRecord),
      });
    } catch (err) {
      // If API fails, continue checkout without blocking
    }

    try {
      localStorage.setItem(checkoutKey, JSON.stringify(form));
    } catch (err) {
      // ignore
    }

    clearCart();
    navigate("/order-success");
  };

  const SHIPPING_CHARGE = total >= 999 ? 0 : 99;

  const finalTotal = Math.max(
    total + SHIPPING_CHARGE - discount,
    0
  );

  return (
    <section className="placeorder-page">
      <div className="placeorder-wrapper">

        {/* LEFT */}
        <div className="placeorder-left">
          <h2>Contact Information</h2>

          {addresses.length > 0 && (
            <div className="saved-addresses">
              <div className="saved-addresses-header">
                <span>Saved addresses</span>
                <span className="saved-addresses-hint">Select one to auto-fill</span>
              </div>

              <div className="saved-addresses-grid">
                {addresses.map((addr, idx) => {
                  const label = `${addr.firstName} ${addr.lastName}`.trim();
                  const line1 = addr.address1 || "";
                  const line2 = [
                    addr.address2,
                    addr.city,
                    addr.state,
                    addr.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ");

                  const isSelected = String(selectedAddressIndex) === String(idx);

                  return (
                    <label
                      key={idx}
                      className={`saved-address-card ${isSelected ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        value={idx}
                        checked={isSelected}
                        onChange={(e) => {
                          const nextIdx = e.target.value;
                          setSelectedAddressIndex(nextIdx);
                          applyAddress(addresses[Number(nextIdx)]);
                        }}
                      />
                      <div className="saved-address-content">
                        <div className="saved-address-title">{label || "Saved Address"}</div>
                        <div className="saved-address-line">{line1}</div>
                        {line2 && <div className="saved-address-line muted">{line2}</div>}
                        {addr.email && (
                          <div className="saved-address-line muted">{addr.email}</div>
                        )}
                        {addr.mobile && (
                          <div className="saved-address-line muted">Mobile: {addr.mobile}</div>
                        )}
                      </div>
                      <div className="saved-address-check" aria-hidden="true"></div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <label>Email ID <span style={{ color: "red" }}>*</span></label>
          <input
            name="email"
            ref={(el) => (fieldRefs.current.email = el)}
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <div className="error-text">{errors.email}</div>}

          <div className="checkbox-row">
            <input type="checkbox" />
            <span>Email me with news and offers</span>
          </div>

          <h2>Shipping details</h2>

          <label>First Name <span style={{ color: "red" }}>*</span></label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
          />
          {errors.firstName && <div className="error-text">{errors.firstName}</div>}

          <label>Middle Name</label>
          <input
            name="middleName"
            value={form.middleName}
            onChange={handleChange}
          />

          <label>Last Name <span style={{ color: "red" }}>*</span></label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
          />
          {errors.lastName && <div className="error-text">{errors.lastName}</div>}

          <label>House number  street name <span style={{ color: "red" }}>*</span></label>
          <input
            name="address1"
            value={form.address1}
            onChange={handleChange}
          />
          {errors.address1 && <div className="error-text">{errors.address1}</div>}

          <label>Apartment, suite, unit, etc.</label>
          <input
            name="address2"
            value={form.address2}
            onChange={handleChange}
          />

          <label>Country</label>
          <input value="India" disabled />

          <label>State <span style={{ color: "red" }}>*</span></label>
          <input
            name="state"
            value={form.state}
            onChange={handleChange}
          />
          {errors.state && <div className="error-text">{errors.state}</div>}

          <label>City <span style={{ color: "red" }}>*</span></label>
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
          />
          {errors.city && <div className="error-text">{errors.city}</div>}

          <label>PinCode <span style={{ color: "red" }}>*</span></label>
          <input
            name="pincode"
            maxLength="6"
            value={form.pincode}
            onChange={handleChange}
          />
          {errors.pincode && <div className="error-text">{errors.pincode}</div>}

          <label>Mobile No <span style={{ color: "red" }}>*</span></label>
          <input
            name="phone"
            ref={(el) => (fieldRefs.current.phone = el)}
            maxLength="10"
            value={form.phone}
            onChange={handleChange}
          />
          {errors.phone && <div className="error-text">{errors.phone}</div>}

          <h3 className="section-title">Payment Mode</h3>

          <div className="payment-box">
            <label className="radio-option">
              <input
                type="radio"
                name="paymentMode"
                value="COD"
                checked={paymentMode === "COD"}
                onChange={(e) => setPaymentMode(e.target.value)}
              />
              <span>COD</span>
            </label>
          </div>

          <button
            type="button"
            className="placeorder-btn"
            onClick={handlePlaceOrder}
          >
            PLACE ORDER
          </button>
        </div>

        {/* RIGHT */}
        <div className="placeorder-right">
          <h3>Your Order</h3> <br />

          {cartItems.map((item) => (
            <div
              className="order-item"
              key={`${item.id}-${item.size || "nosize"}`}
            >
              <img src={withPublicUrl(item.image)} alt={item.title} />
              <div>
                <p>{item.title}</p>

                {/* ✅ ONLY ADDITION */}
                {item.size && <p>Size: {item.size}</p>}

                <p>x {item.qty} - Rs. {item.price * item.qty}</p>
              </div>
            </div>
          ))}

          {/* COUPON */}
          <div className={`coupon-box ${couponStatus}`}>
            <input
              placeholder="Coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            />
            <button onClick={handleApplyCoupon}>APPLY</button>
          </div>

          {couponMessage && (
            <div className={`coupon-message ${couponStatus}`}>
              {couponMessage}
            </div>
          )}

          <div className="summary">
            <div>
              <span>Subtotal</span>
              <span>Rs. {total}</span>
            </div>

            <div>
              <span>Shipping</span>
              <span>
                {SHIPPING_CHARGE === 0 ? "Free" : `Rs. ${SHIPPING_CHARGE}`}
              </span>
            </div>

            {discount > 0 && (
              <div className="discount-row animate-pop">
                <span>Discount</span>
                <span>- Rs. {discount}</span>
              </div>
            )}

            <div className="total">
              <span>Total</span>
              <span>Rs. {finalTotal}</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

