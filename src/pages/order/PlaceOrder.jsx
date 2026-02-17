import "./PlaceOrder.css";
import { withPublicUrl } from "../../utils/assetPath";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import {
  appendLocalOrder,
  getLocalAddresses,
  shouldUseLocalCheckoutStore,
} from "../../utils/localCheckoutData";


/* =============================
   DEMO COUPONS (TEMP ONLY)
============================= */
const COUPONS = [
  { code: "AASHAKA100", type: "flat", value: 100, minCart: 999 },
  { code: "SAVE10", type: "percent", value: 10, minCart: 1999 },
];

const FREE_SHIPPING_THRESHOLD = 1999;
const SHIPPING_CHARGE = 100;
const STATES_API_URL = "https://www.india-location-hub.in/api/locations/states";
const DISTRICTS_API_URL = "https://www.india-location-hub.in/api/locations/districts";

const formatLocationName = (value) => {
  if (!value || typeof value !== "string") return "";

  return value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => {
      if (word === "of" || word === "and") return word;
      if (word.includes("&")) {
        return word
          .split("&")
          .map((part) =>
            part ? part.charAt(0).toUpperCase() + part.slice(1) : ""
          )
          .join(" & ");
      }
      return word ? word.charAt(0).toUpperCase() + word.slice(1) : "";
    })
    .join(" ")
    .replace(/\s+&\s+/g, " & ");
};

const normalizeLocationText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/&/g, "and")
    .trim();

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
  const useLocalCheckoutStore = shouldUseLocalCheckoutStore();

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
  const [stateOptions, setStateOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState("");
  const [cityLoading, setCityLoading] = useState(false);
  const [cityError, setCityError] = useState("");
  const allDistrictsRef = useRef([]);
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const stateDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);

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
      if (useLocalCheckoutStore) {
        if (!ignore) {
          setAddresses(getLocalAddresses(userId));
        }
        return;
      }

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
  }, [userId, useLocalCheckoutStore]);

  useEffect(() => {
    let ignore = false;

    const loadStates = async () => {
      setLocationLoading(true);
      setLocationError("");

      try {
        const statesRes = await fetch(STATES_API_URL);
        if (!statesRes.ok) {
          throw new Error("Failed to load states");
        }

        const statesJson = await statesRes.json();
        const apiStates = Array.isArray(statesJson?.data?.states)
          ? statesJson.data.states
          : [];

        const normalizedStates = apiStates
          .map((state) => ({
            rawName: state?.name || "",
            label: formatLocationName(state?.name || ""),
          }))
          .filter((state) => state.rawName && state.label)
          .sort((a, b) => a.label.localeCompare(b.label));

        if (!ignore) {
          setStateOptions(normalizedStates);
        }
      } catch (err) {
        if (!ignore) {
          setLocationError("Unable to load states right now.");
          setStateOptions([]);
          setDistrictOptions([]);
        }
      } finally {
        if (!ignore) {
          setLocationLoading(false);
        }
      }
    };

    loadStates();
    return () => {
      ignore = true;
    };
  }, []);

  const selectedStateOption = stateOptions.find((stateOption) => {
    const normalizedSelected = normalizeLocationText(form.state);
    return (
      normalizeLocationText(stateOption.label) === normalizedSelected ||
      normalizeLocationText(stateOption.rawName) === normalizedSelected
    );
  });

  const selectedStateRawName = selectedStateOption?.rawName || "";

  useEffect(() => {
    if (!selectedStateRawName) {
      setDistrictOptions([]);
      setCityLoading(false);
      setCityError("");
      return;
    }

    const normalizedSelectedState = normalizeLocationText(selectedStateRawName);

    if (allDistrictsRef.current.length > 0) {
      const cachedDistricts = allDistrictsRef.current.filter(
        (district) =>
          normalizeLocationText(district.rawStateName) === normalizedSelectedState
      );
      setDistrictOptions(cachedDistricts);
      setCityLoading(false);
      setCityError("");
      return;
    }

    let ignore = false;

    const loadDistricts = async () => {
      setCityLoading(true);
      setCityError("");
      setDistrictOptions([]);

      try {
        const districtsRes = await fetch(
          `${DISTRICTS_API_URL}?state_name=${encodeURIComponent(
            selectedStateRawName
          )}`
        );

        if (!districtsRes.ok) {
          throw new Error("Failed to load districts");
        }

        const districtsJson = await districtsRes.json();
        const apiDistricts = Array.isArray(districtsJson?.data?.districts)
          ? districtsJson.data.districts
          : [];

        const normalizedDistricts = apiDistricts
          .map((district) => ({
            name: formatLocationName(district?.name || ""),
            rawStateName: district?.state_name || "",
          }))
          .filter((district) => district.name && district.rawStateName);

        const uniqueStates = new Set(
          normalizedDistricts.map((district) =>
            normalizeLocationText(district.rawStateName)
          )
        );

        if (uniqueStates.size > 1) {
          allDistrictsRef.current = normalizedDistricts;
        }

        const filteredDistricts = normalizedDistricts.filter(
          (district) =>
            normalizeLocationText(district.rawStateName) ===
            normalizedSelectedState
        );

        if (!ignore) {
          setDistrictOptions(filteredDistricts);
        }
      } catch (err) {
        if (!ignore) {
          setDistrictOptions([]);
          setCityError("Unable to load cities right now.");
        }
      } finally {
        if (!ignore) {
          setCityLoading(false);
        }
      }
    };

    loadDistricts();

    return () => {
      ignore = true;
    };
  }, [selectedStateRawName]);

  const cityOptions = Array.from(
    new Set(districtOptions.map((district) => district.name))
  ).sort((a, b) => a.localeCompare(b));

  const filteredStates = stateOptions.filter((stateOption) =>
    stateOption.label.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const filteredCities = cityOptions.filter((city) =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleSelectState = (stateOption) => {
    setForm((prev) => ({
      ...prev,
      state: stateOption.label,
      city: "",
    }));
    setErrors((prev) => ({ ...prev, state: "", city: "" }));
    setIsStateOpen(false);
    setIsCityOpen(false);
    setStateSearch("");
    setCitySearch("");
  };

  const handleSelectCity = (city) => {
    setForm((prev) => ({ ...prev, city }));
    setErrors((prev) => ({ ...prev, city: "" }));
    setIsCityOpen(false);
    setCitySearch("");
  };

  useEffect(() => {
    try {
      localStorage.setItem(checkoutKey, JSON.stringify(form));
    } catch (err) {
    }
  }, [form, checkoutKey]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        stateDropdownRef.current &&
        !stateDropdownRef.current.contains(event.target)
      ) {
        setIsStateOpen(false);
      }
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target)
      ) {
        setIsCityOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    setErrors((prev) => ({ ...prev, state: "", city: "" }));
  };

  /* =============================
     ORIGINAL HANDLE CHANGE
  ============================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone" && !/^\d*$/.test(value)) return;
    if (name === "pincode" && !/^\d*$/.test(value)) return;

    if (name === "state") {
      setForm((prev) => ({ ...prev, state: value, city: "" }));
      setErrors((prev) => ({ ...prev, state: value ? "" : "State is required", city: "" }));
      return;
    }

    if (name === "city") {
      setForm((prev) => ({ ...prev, city: value }));
      setErrors((prev) => ({ ...prev, city: value ? "" : "City is required" }));
      return;
    }

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
      shipping: shippingCharge,
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

    if (useLocalCheckoutStore) {
      appendLocalOrder(orderRecord.userId, orderRecord);
    } else {
      try {
        await fetch("http://localhost:5000/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderRecord),
        });
      } catch (err) {
        // If API fails, continue checkout without blocking
      }
    }

    try {
      localStorage.setItem(checkoutKey, JSON.stringify(form));
    } catch (err) {
      // ignore
    }

    clearCart();
    navigate("/order-success");
  };

  const shippingCharge =
    total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;

  const finalTotal = Math.max(
    total + shippingCharge - discount,
    0
  );

  return (
    <section className="placeorder-page">
      <div className="placeorder-intro">
        <p className="eyebrow">Secure Checkout</p>
        <h1>Complete Your Order</h1>
        <p className="subtext">
          Fill in your delivery details and review your order before placing it.
        </p>
      </div>

      <div className="placeorder-wrapper">

        {/* LEFT */}
        <div className="placeorder-left">
          <div className="section-head">
            <h2>Contact Information</h2>
            <p>We will send order updates to this email and phone number.</p>
          </div>

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

          <div className="section-head">
            <h2>Shipping Details</h2>
            <p>Please verify your address carefully for smooth delivery.</p>
          </div>

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
          <div
            className={`place-select ${errors.state ? "invalid" : ""}`}
            ref={stateDropdownRef}
          >
            <button
              type="button"
              className="place-select-trigger"
              ref={(el) => (fieldRefs.current.state = el)}
              onClick={() => {
                if (locationLoading && stateOptions.length === 0) return;
                setIsStateOpen((prev) => !prev);
                setIsCityOpen(false);
                setStateSearch("");
              }}
              aria-expanded={isStateOpen}
            >
              <span className={form.state ? "" : "place-select-placeholder"}>
                {form.state || (locationLoading ? "Loading states..." : "Select State")}
              </span>
              <span className="place-select-caret">▾</span>
            </button>

            {isStateOpen && (
              <div className="place-select-panel">
                <input
                  className="place-select-search"
                  placeholder="Search State"
                  value={stateSearch}
                  onChange={(e) => setStateSearch(e.target.value)}
                />
                <div className="place-select-options">
                  {locationLoading ? (
                    <div className="place-select-empty">Loading states...</div>
                  ) : filteredStates.length === 0 ? (
                    <div className="place-select-empty">No states found</div>
                  ) : (
                    filteredStates.map((stateOption) => (
                      <button
                        key={stateOption.rawName}
                        type="button"
                        className={`place-select-option ${
                          normalizeLocationText(form.state) ===
                          normalizeLocationText(stateOption.label)
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => handleSelectState(stateOption)}
                      >
                        {stateOption.label}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          {errors.state && <div className="error-text">{errors.state}</div>}
          {locationError && <div className="field-note error">{locationError}</div>}

          <label>City <span style={{ color: "red" }}>*</span></label>
          <div
            className={`place-select ${!selectedStateRawName ? "disabled" : ""} ${
              errors.city ? "invalid" : ""
            }`}
            ref={cityDropdownRef}
          >
            <button
              type="button"
              className="place-select-trigger"
              ref={(el) => (fieldRefs.current.city = el)}
              onClick={() => {
                if (!selectedStateRawName || cityLoading) return;
                setIsCityOpen((prev) => !prev);
                setIsStateOpen(false);
                setCitySearch("");
              }}
              disabled={!selectedStateRawName || cityLoading}
              aria-expanded={isCityOpen}
            >
              <span className={form.city ? "" : "place-select-placeholder"}>
                {form.city ||
                  (!selectedStateRawName
                    ? "Select state first"
                    : cityLoading
                      ? "Loading cities..."
                      : "Select City")}
              </span>
              <span className="place-select-caret">▾</span>
            </button>

            {isCityOpen && (
              <div className="place-select-panel">
                <input
                  className="place-select-search"
                  placeholder="Search City"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                />
                <div className="place-select-options">
                  {cityLoading ? (
                    <div className="place-select-empty">Loading cities...</div>
                  ) : filteredCities.length === 0 ? (
                    <div className="place-select-empty">No cities found</div>
                  ) : (
                    filteredCities.map((city) => (
                      <button
                        key={city}
                        type="button"
                        className={`place-select-option ${
                          normalizeLocationText(form.city) ===
                          normalizeLocationText(city)
                            ? "selected"
                            : ""
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
          {errors.city && <div className="error-text">{errors.city}</div>}
          {cityError && <div className="field-note error">{cityError}</div>}

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
            <label
              className={`payment-card ${paymentMode === "COD" ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="paymentMode"
                value="COD"
                checked={paymentMode === "COD"}
                onChange={(e) => setPaymentMode(e.target.value)}
              />
              <div className="payment-copy">
                <span className="payment-title">Cash on Delivery</span>
                <span className="payment-sub">Pay at your doorstep</span>
              </div>
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
          <h3>Your Order</h3>

          <div className="order-list">
            {cartItems.length === 0 && (
              <div className="order-empty">Your cart is currently empty.</div>
            )}

            {cartItems.map((item) => (
              <div
                className="order-item"
                key={`${item.id}-${item.size || "nosize"}`}
              >
                <img src={withPublicUrl(item.image)} alt={item.title} />
                <div>
                  <p>{item.title}</p>
                  {item.size && <p>Size: {item.size}</p>}
                  <p>x {item.qty} - Rs. {item.price * item.qty}</p>
                </div>
              </div>
            ))}
          </div>

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
                {shippingCharge === 0 ? "Free" : `Rs. ${shippingCharge}`}
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

          <div className="checkout-assurance">
            <span>Secure Payment</span>
            <span>COD Available</span>
            <span>Fast Dispatch</span>
          </div>
        </div>

      </div>
    </section>
  );
}


