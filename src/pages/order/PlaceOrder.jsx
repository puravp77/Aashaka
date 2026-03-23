import "./PlaceOrder.css";
import { withPublicUrl } from "../../utils/assetPath";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import {
  getLocalAddresses,
  shouldUseLocalCheckoutStore,
} from "../../utils/localCheckoutData";
import { useSettings } from "../../context/SettingsContext";
import { getApiBaseUrl } from "../../utils/api";
import { CUSTOMER_AUTH_TOKEN_KEY } from "../../utils/authStorage";



/* =============================
   DEMO COUPONS (TEMP ONLY)
============================= */
const COUPONS = [
  { code: "AASHAKA100", type: "flat", value: 100, minCart: 999 },
  { code: "SAVE10", type: "percent", value: 10, minCart: 1999 },
];



const LOCATIONS_DATA_URL =
  "https://raw.githubusercontent.com/nshntarora/Indian-Cities-JSON/master/cities.json";
const STATES_CACHE_KEY = "aashaka_states_cache_v1";
const STATE_FETCH_TIMEOUT_MS = 8000;
const STATE_FETCH_RETRY_DELAYS_MS = [0, 500, 1200];
const DISTRICT_FETCH_TIMEOUT_MS = 8000;
const DISTRICT_FETCH_RETRY_DELAYS_MS = [0, 500, 1200];

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

const CONFETTI_COLORS = [
  "#7f0d32",
  "#a71043",
  "#c9873d",
  "#f0c987",
  "#f5ede3",
  "#ffffff",
];

const createConfettiParticles = (count) =>
  Array.from({ length: count }, (_, idx) => ({
    id: idx,
    xStart: 3 + Math.random() * 94,
    xDrift: -90 + Math.random() * 180,
    duration: 2600 + Math.random() * 2200,
    delay: Math.random() * 900,
    spinDuration: 500 + Math.random() * 900,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 8,
    opacity: 0.6 + Math.random() * 0.4,
    shape: idx % 3,
  }));

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseLocationsResponse = (locationsJson) => {
  const apiLocations = Array.isArray(locationsJson) ? locationsJson : [];

  const normalizedDistricts = apiLocations
    .map((item) => ({
      name: formatLocationName(item?.name || ""),
      rawStateName: item?.state || "",
    }))
    .filter((district) => district.name && district.rawStateName);

  const stateMap = new Map();
  normalizedDistricts.forEach((district) => {
    const key = normalizeLocationText(district.rawStateName);
    if (!stateMap.has(key)) {
      stateMap.set(key, {
        rawName: district.rawStateName,
        label: formatLocationName(district.rawStateName),
      });
    }
  });

  const normalizedStates = Array.from(stateMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  return { normalizedStates, normalizedDistricts };
};

export default function PlaceOrder() {
  const navigate = useNavigate();
  const fieldRefs = useRef({});

  const { cartItems, total, clearCart, replaceCartItems } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const { flatRate, freeShippingThreshold } = settings.shippingRates;

  const storedUser = (() => {
    try {
      const raw = localStorage.getItem("store_user");
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
  const [cityRetryTick, setCityRetryTick] = useState(0);
  const allDistrictsRef = useRef([]);
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const stateDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);

  const resolveCartItemsWithBackendIds = useCallback(async () => {
    const itemsMissingBackendId = cartItems.some((item) => !item?._id);
    if (!itemsMissingBackendId) {
      return cartItems;
    }

    const response = await fetch(`${getApiBaseUrl()}/api/products`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Unable to refresh your cart right now.");
    }

    const products = await response.json().catch(() => []);
    const productMap = new Map();

    (Array.isArray(products) ? products : []).forEach((product) => {
      const candidates = [
        product?._id,
        product?.productId,
        product?.id,
        product?.name,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      candidates.forEach((candidate) => {
        productMap.set(candidate, product);
      });
    });

    const resolvedItems = cartItems.map((item) => {
      if (item?._id) return item;

      const match =
        productMap.get(String(item?.id || "").toLowerCase()) ||
        productMap.get(String(item?.productId || "").toLowerCase()) ||
        productMap.get(String(item?.name || item?.title || "").toLowerCase());

      if (!match?._id) {
        return item;
      }

      return {
        ...item,
        _id: match._id,
        id: item.id || match.productId || match._id,
        name: item.name || match.name || item.title,
        title: item.title || match.name || item.name,
        image: item.image || match.images?.[0] || item.image,
        price: item.price ?? match.price,
      };
    });

    const stillMissingBackendId = resolvedItems.some((item) => !item?._id);
    if (stillMissingBackendId) {
      throw new Error("Some cart items could not be refreshed. Please remove them and add them again.");
    }

    replaceCartItems(resolvedItems);
    return resolvedItems;
  }, [cartItems, replaceCartItems]);

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

  const loadStates = useCallback(async () => {
    setLocationLoading(true);
    setLocationError("");

    try {
      let locationsJson = null;
      let lastError = null;

      for (let attempt = 0; attempt < STATE_FETCH_RETRY_DELAYS_MS.length; attempt += 1) {
        const delayMs = STATE_FETCH_RETRY_DELAYS_MS[attempt];
        if (delayMs > 0) {
          await wait(delayMs);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), STATE_FETCH_TIMEOUT_MS);

        try {
          const statesRes = await fetch(LOCATIONS_DATA_URL, {
            signal: controller.signal,
            cache: "no-store",
          });
          if (!statesRes.ok) {
            throw new Error(`Failed to load states (${statesRes.status})`);
          }
          locationsJson = await statesRes.json();
          lastError = null;
          break;
        } catch (err) {
          lastError = err;
        } finally {
          clearTimeout(timeoutId);
        }
      }

      if (!locationsJson) {
        throw lastError || new Error("Failed to load states");
      }

      const { normalizedStates, normalizedDistricts } =
        parseLocationsResponse(locationsJson);
      if (normalizedStates.length === 0) {
        throw new Error("State API returned an empty list");
      }

      setStateOptions(normalizedStates);
      allDistrictsRef.current = normalizedDistricts;
      setLocationError("");

      try {
        localStorage.setItem(
          STATES_CACHE_KEY,
          JSON.stringify({
            savedAt: Date.now(),
            states: normalizedStates,
          })
        );
      } catch (err) {
        // ignore cache write errors
      }
    } catch (err) {
      let cachedStates = [];

      try {
        const rawCache = localStorage.getItem(STATES_CACHE_KEY);
        const parsedCache = rawCache ? JSON.parse(rawCache) : null;
        cachedStates = Array.isArray(parsedCache?.states) ? parsedCache.states : [];
      } catch (cacheErr) {
        cachedStates = [];
      }

      if (cachedStates.length > 0) {
        setStateOptions(cachedStates);
        setLocationError("Live states service is slow. Showing saved state list.");
      } else {
        setStateOptions([]);
        setDistrictOptions([]);
        setLocationError("Unable to load states right now. Please tap Retry.");
      }
    } finally {
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStates();
  }, [loadStates]);

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
        let districtsJson = null;
        let lastError = null;

        for (let attempt = 0; attempt < DISTRICT_FETCH_RETRY_DELAYS_MS.length; attempt += 1) {
          const delayMs = DISTRICT_FETCH_RETRY_DELAYS_MS[attempt];
          if (delayMs > 0) {
            await wait(delayMs);
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), DISTRICT_FETCH_TIMEOUT_MS);

          try {
            const districtsRes = await fetch(LOCATIONS_DATA_URL, {
              signal: controller.signal,
              cache: "no-store",
            });

            if (!districtsRes.ok) {
              throw new Error(`Failed to load districts (${districtsRes.status})`);
            }

            districtsJson = await districtsRes.json();
            lastError = null;
            break;
          } catch (err) {
            lastError = err;
          } finally {
            clearTimeout(timeoutId);
          }
        }

        if (!districtsJson) {
          throw lastError || new Error("Failed to load districts");
        }

        const { normalizedDistricts } = parseLocationsResponse(districtsJson);

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
          setCityError("Unable to load cities right now. Please tap Retry.");
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
  }, [selectedStateRawName, cityRetryTick]);

  const retryCityLoad = () => {
    if (!selectedStateRawName || cityLoading) return;
    setCityRetryTick((prev) => prev + 1);
  };

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
  const [showCouponCelebration, setShowCouponCelebration] = useState(false);
  const [couponCelebrationBurstKey, setCouponCelebrationBurstKey] = useState(0);
  const [couponConfettiParticles, setCouponConfettiParticles] = useState(() =>
    createConfettiParticles(52)
  );
  const couponCelebrationTimerRef = useRef(null);

  const triggerCouponCelebration = () => {
    setCouponConfettiParticles(createConfettiParticles(52));
    setCouponCelebrationBurstKey((prev) => prev + 1);
    setShowCouponCelebration(true);

    if (couponCelebrationTimerRef.current) {
      clearTimeout(couponCelebrationTimerRef.current);
    }

    couponCelebrationTimerRef.current = setTimeout(() => {
      setShowCouponCelebration(false);
      couponCelebrationTimerRef.current = null;
    }, 6000);
  };

  useEffect(() => {
    return () => {
      if (couponCelebrationTimerRef.current) {
        clearTimeout(couponCelebrationTimerRef.current);
      }
    };
  }, []);

  const handleApplyCoupon = () => {
    setCouponStatus("");
    setCouponMessage("");
    setDiscount(0);
    setShowCouponCelebration(false);

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
    triggerCouponCelebration();
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

    const token = localStorage.getItem(CUSTOMER_AUTH_TOKEN_KEY);
    if (!token) {
      toast.error("Please log in to place your order.");
      return;
    }

    let resolvedCartItems = cartItems;

    try {
      resolvedCartItems = await resolveCartItemsWithBackendIds();
    } catch (error) {
      toast.error(error.message || "Some cart items are outdated. Please remove them and add them again.");
      return;
    }

    const selectedAddress =
      selectedAddressIndex !== "" && addresses[Number(selectedAddressIndex)]
        ? {
            name: `${addresses[Number(selectedAddressIndex)]?.firstName || ""} ${
              addresses[Number(selectedAddressIndex)]?.lastName || ""
            }`.trim(),
            phone: addresses[Number(selectedAddressIndex)]?.mobile || form.phone,
            addressLine: [
              addresses[Number(selectedAddressIndex)]?.address1,
              addresses[Number(selectedAddressIndex)]?.address2,
            ]
              .filter(Boolean)
              .join(", "),
            city: addresses[Number(selectedAddressIndex)]?.city || form.city,
            state: addresses[Number(selectedAddressIndex)]?.state || form.state,
            pincode: addresses[Number(selectedAddressIndex)]?.pincode || form.pincode,
          }
        : {
            name: [form.firstName, form.middleName, form.lastName]
              .filter(Boolean)
              .join(" "),
            phone: form.phone,
            addressLine: [form.address1, form.address2].filter(Boolean).join(", "),
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          };

    const orderPayload = {
      orderItems: resolvedCartItems.map((item) => ({
        product: item._id,
        name: item.name || item.title || "Product",
        price: item.price,
        size: item.size || null,
        quantity: item.quantity || item.qty || 1,
        image: item.image || item.images?.[0] || "",
      })),
      shippingAddress: selectedAddress,
      totalPrice: finalTotal,
      paymentMethod: paymentMode,
    };

    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || "Failed to place order");
      }

      const responseData = await response.json().catch(() => ({}));
      const createdOrderId = responseData?.order?._id;

      localStorage.setItem(checkoutKey, JSON.stringify(form));

      clearCart();
      navigate(createdOrderId ? `/order-success/${createdOrderId}` : "/order-success");
    } catch (err) {
      toast.error(err.message || "Unable to place order right now.");
    }
  };

  const shippingCharge =
    total >= freeShippingThreshold ? 0 : flatRate;

  const finalTotal = Math.max(
    total + shippingCharge - discount,
    0
  );

  return (
    <section className="placeorder-page">
      {showCouponCelebration && (
        <div
          key={couponCelebrationBurstKey}
          className="page-confetti"
          aria-hidden="true"
        >
          <div className="page-confetti-flash" />
          {couponConfettiParticles.map((particle) => (
            <span
              key={particle.id}
              className={`confetti-piece shape-${particle.shape}`}
              style={{
                "--x-start": `${particle.xStart}%`,
                "--x-drift": `${particle.xDrift}px`,
                "--fall-duration": `${particle.duration}ms`,
                "--fall-delay": `${particle.delay}ms`,
                "--spin-duration": `${particle.spinDuration}ms`,
                "--piece-color": particle.color,
                "--piece-size": `${particle.size}px`,
                "--piece-opacity": particle.opacity,
              }}
            />
          ))}
        </div>
      )}

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
                        className={`place-select-option ${normalizeLocationText(form.state) ===
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
          {locationError && (
            <div className="field-note error field-note-with-action">
              <span>{locationError}</span>
              <button
                type="button"
                className="field-note-action"
                onClick={loadStates}
                disabled={locationLoading}
              >
                {locationLoading ? "Retrying..." : "Retry"}
              </button>
            </div>
          )}

          <label>City <span style={{ color: "red" }}>*</span></label>
          <div
            className={`place-select ${!selectedStateRawName ? "disabled" : ""} ${errors.city ? "invalid" : ""
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
                        className={`place-select-option ${normalizeLocationText(form.city) ===
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
          {cityError && (
            <div className="field-note error field-note-with-action">
              <span>{cityError}</span>
              <button
                type="button"
                className="field-note-action"
                onClick={retryCityLoad}
                disabled={!selectedStateRawName || cityLoading}
              >
                {cityLoading ? "Retrying..." : "Retry"}
              </button>
            </div>
          )}

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
          <form
            className={`coupon-box ${couponStatus}`}
            onSubmit={(e) => {
              e.preventDefault();
              handleApplyCoupon();
            }}
          >
            <input
              placeholder="Coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            />
            <button type="submit">APPLY</button>
          </form>

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
