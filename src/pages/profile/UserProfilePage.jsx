import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./UserProfilePage.css";
import "../order/OrderHistory.css";
import { useAuth } from "../../context/AuthContext";
import { withPublicUrl } from "../../utils/assetPath";
import {
  createLocalRecordId,
  getLocalAddresses,
  getLocalOrders,
  setLocalAddresses,
  shouldUseLocalCheckoutStore,
} from "../../utils/localCheckoutData";

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

const UserProfile = ({ defaultTab = "address" }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  // Tabs
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Address UI
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeletingAddress, setIsDeletingAddress] = useState(false);

  const [isStateOpen, setIsStateOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [stateOptions, setStateOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState("");
  const [cityLoading, setCityLoading] = useState(false);
  const [cityError, setCityError] = useState("");

  const stateRef = useRef(null);
  const cityRef = useRef(null);
  const handledProfileToastRef = useRef(null);
  const allDistrictsRef = useRef([]);

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
    setActiveTab(defaultTab === "orders" ? "orders" : "address");
    if (defaultTab !== "orders") {
      setShowAddressForm(false);
    }
  }, [defaultTab]);

  useEffect(() => {
    const toastMessage = location.state?.addressToastMessage;
    const toastId = location.state?.addressToastId;

    if (!toastMessage || !toastId) return;
    if (handledProfileToastRef.current === toastId) return;

    handledProfileToastRef.current = toastId;
    toast.success(toastMessage, { autoClose: 3500 });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!userId) {
      setOrders([]);
      return;
    }

    let ignore = false;

    const loadOrders = async () => {
      if (useLocalCheckoutStore) {
        if (!ignore) {
          setOrders(getLocalOrders(userId));
        }
        return;
      }

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
  }, [userId, useLocalCheckoutStore]);

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
    if (!showAddressForm) return undefined;

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
  }, [showAddressForm]);

  useEffect(() => {
    if (!showAddressForm) return undefined;

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
  }, [showAddressForm]);

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
    setEditingAddressId(null);
    setEditingAddressIndex(null);
  };

  const handleEditAddress = (address, index) => {
    const query = new URLSearchParams();
    if (address?.id !== undefined && address?.id !== null && address.id !== "") {
      query.set("id", String(address.id));
    }
    query.set("index", String(index));
    navigate(`/user-profile/address/edit?${query.toString()}`);
  };

  const handleDeleteAddress = (address, index) => {
    setDeleteTarget({ address, index });
  };

  const closeDeleteDialog = () => {
    if (isDeletingAddress) return;
    setDeleteTarget(null);
  };

  const confirmDeleteAddress = async () => {
    if (!deleteTarget?.address) return;

    const { address, index } = deleteTarget;

    const hasPersistedId =
      address?.id !== null && address?.id !== undefined && address?.id !== "";

    setIsDeletingAddress(true);

    if (useLocalCheckoutStore) {
      const nextAddresses = addresses.filter((item, itemIndex) =>
        hasPersistedId
          ? String(item.id) !== String(address.id)
          : itemIndex !== index
      );

      setAddresses(nextAddresses);
      setLocalAddresses(userId, nextAddresses);

      if (
        showAddressForm &&
        ((hasPersistedId && String(editingAddressId) === String(address.id)) ||
          (!hasPersistedId && editingAddressIndex === index))
      ) {
        resetForm();
        setShowAddressForm(false);
      }

      setDeleteTarget(null);
      setIsDeletingAddress(false);
      return;
    }

    if (hasPersistedId) {
      try {
        const res = await fetch(`http://localhost:5000/addresses/${address.id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Failed to delete address");
        }
      } catch (err) {
        setIsDeletingAddress(false);
        return;
      }
    }

    setAddresses((prev) =>
      prev.filter((item, itemIndex) =>
        hasPersistedId ? item.id !== address.id : itemIndex !== index
      )
    );

    if (
      showAddressForm &&
      ((hasPersistedId && editingAddressId === address.id) ||
        (!hasPersistedId && editingAddressIndex === index))
    ) {
      resetForm();
      setShowAddressForm(false);
    }

    setDeleteTarget(null);
    setIsDeletingAddress(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
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

    const isEditing = editingAddressId !== null || editingAddressIndex !== null;

    if (useLocalCheckoutStore) {
      if (userId) {
        let nextAddresses = [...addresses];

        if (isEditing) {
          const hasPersistedId =
            editingAddressId !== null &&
            editingAddressId !== undefined &&
            editingAddressId !== "";

          let updated = false;
          nextAddresses = nextAddresses.map((item, index) => {
            const isMatch = hasPersistedId
              ? String(item.id) === String(editingAddressId)
              : index === editingAddressIndex;

            if (!isMatch) return item;
            updated = true;
            return {
              ...item,
              ...payload,
              id: item.id ?? createLocalRecordId("addr"),
            };
          });

          if (!updated) {
            nextAddresses.push({
              ...payload,
              id: editingAddressId || createLocalRecordId("addr"),
            });
          }
        } else {
          nextAddresses.push({
            ...payload,
            id: createLocalRecordId("addr"),
          });
        }

        setAddresses(nextAddresses);
        setLocalAddresses(userId, nextAddresses);
      }

      if (isEditing) {
        toast.success("Address updated successfully!", { autoClose: 3500 });
      }

      resetForm();
      setShowAddressForm(false);
      return;
    }

    if (isEditing) {
      const hasPersistedId =
        editingAddressId !== null &&
        editingAddressId !== undefined &&
        editingAddressId !== "";

      if (hasPersistedId) {
        try {
          const res = await fetch(`http://localhost:5000/addresses/${editingAddressId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            const updated = await res.json();
            setAddresses((prev) =>
              prev.map((item) => (item.id === editingAddressId ? updated : item))
            );
          } else {
            setAddresses((prev) =>
              prev.map((item, index) =>
                index === editingAddressIndex ? { ...item, ...payload } : item
              )
            );
          }
        } catch (err) {
          setAddresses((prev) =>
            prev.map((item, index) =>
              index === editingAddressIndex ? { ...item, ...payload } : item
            )
          );
        }
      } else {
        setAddresses((prev) =>
          prev.map((item, index) =>
            index === editingAddressIndex ? { ...item, ...payload } : item
          )
        );
      }
    } else if (userId) {
      try {
        const res = await fetch("http://localhost:5000/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const saved = await res.json();
          setAddresses((prev) => [...prev, saved]);
        } else {
          setAddresses((prev) => [...prev, payload]);
        }
      } catch (err) {
        setAddresses((prev) => [...prev, payload]);
      }
    }

    if (isEditing) {
      toast.success("Address updated successfully!", { autoClose: 3500 });
    }

    resetForm();
    setShowAddressForm(false);
  };

  const handleCancel = () => {
    resetForm();
    setShowAddressForm(false);
  };

  const fieldClassName = (fieldName) =>
    `address-field ${errors[fieldName] ? "error" : ""}`;

  const selectedStateOption = stateOptions.find((stateOption) => {
    const normalizedSelected = normalizeLocationText(formData.state);
    return (
      normalizeLocationText(stateOption.label) === normalizedSelected ||
      normalizeLocationText(stateOption.rawName) === normalizedSelected
    );
  });

  const selectedStateRawName = selectedStateOption?.rawName || "";

  useEffect(() => {
    if (!showAddressForm) return undefined;

    if (!selectedStateRawName) {
      setDistrictOptions([]);
      setCityLoading(false);
      setCityError("");
      return undefined;
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
      return undefined;
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
  }, [showAddressForm, selectedStateRawName]);

  const handleSelectState = (stateOption) => {
    setFormData((prev) => ({ ...prev, state: stateOption.label, city: "" }));
    setErrors((prev) => ({ ...prev, state: "", city: "" }));
    setIsStateOpen(false);
    setStateSearch("");
    setCitySearch("");
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
    if (!selectedStateRawName) return;
    setIsCityOpen((prev) => !prev);
    setIsStateOpen(false);
    setCitySearch("");
  };

  const filteredStates = stateOptions.filter((stateOption) =>
    stateOption.label.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const cityOptions = Array.from(
    new Set(
      districtOptions
        .filter(
          (district) =>
            normalizeLocationText(district.rawStateName) ===
            normalizeLocationText(selectedStateRawName)
        )
        .map((district) => district.name)
    )
  ).sort((a, b) => a.localeCompare(b));

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
              navigate("/user-profile/orders");
            }}
          >
            Order History
          </button>

          <button
            className={activeTab === "address" ? "active" : ""}
            onClick={() => {
              setActiveTab("address");
              navigate("/user-profile");
            }}
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




          {activeTab === "address" && (
            <div className="address-section">
              <div className="address-hero">
                <p className="address-kicker">Your Account</p>
                <h2 className="address-title">Address Book</h2>
                <p className="address-subtitle">
                  Save and manage your delivery locations for faster checkout.
                </p>
                <button
                  className="add-address-btn"
                  onClick={() => navigate("/user-profile/address/new")}
                >
                  + Add New Address
                </button>
              </div>

              {!showAddressForm ? (
                <div className="address-directory">
                  {addresses.length === 0 ? (
                    <div className="address-empty">
                      <h3>No saved addresses yet</h3>
                      <p>Add your first delivery address to get started.</p>
                    </div>
                  ) : (
                    <div className="address-grid">
                      {addresses.map((addr, index) => (
                        <article
                          className="address-card"
                          key={addr.id ?? `address-${index}`}
                        >
                          <div className="address-card-head">
                            <h3 className="address-card-name">
                              {[addr.firstName, addr.middleName, addr.lastName]
                                .filter(Boolean)
                                .join(" ") || "Saved Address"}
                            </h3>
                            <span className="address-chip">
                              {addr.pincode || "No PIN"}
                            </span>
                          </div>

                          <p className="address-card-line">
                            {[addr.address1, addr.address2].filter(Boolean).join(", ")}
                          </p>
                          <p className="address-card-line muted">
                            {[addr.city, addr.state].filter(Boolean).join(", ")}
                          </p>
                          <div className="address-card-meta">
                            {addr.mobile && <span>Mobile: {addr.mobile}</span>}
                            {addr.email && <span>{addr.email}</span>}
                          </div>

                          <div className="address-actions">
                            <button
                              type="button"
                              className="address-action"
                              onClick={() => handleEditAddress(addr, index)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="address-action delete"
                              onClick={() => handleDeleteAddress(addr, index)}
                            >
                              Delete
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="address-form-wrap">
                <form className="address-form" onSubmit={handleSubmit}>
                  <div className="address-form-head">
                    <h3>
                      {editingAddressId !== null || editingAddressIndex !== null
                        ? "Edit Address"
                        : "Add New Address"}
                    </h3>
                    <p>Fields marked with * are required.</p>
                  </div>
                  <div className="address-form-grid">
                    <div className={fieldClassName("firstName")}>
                      <label>
                        First Name <span className="required">*</span>
                      </label>
                      <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        autoComplete="given-name"
                        aria-invalid={Boolean(errors.firstName)}
                      />
                      {errors.firstName && (
                        <span className="field-error">{errors.firstName}</span>
                      )}
                    </div>

                    <div className={fieldClassName("middleName")}>
                      <label>
                        Middle Name <span className="required">*</span>
                      </label>
                      <input
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleChange}
                        autoComplete="additional-name"
                        aria-invalid={Boolean(errors.middleName)}
                      />
                      {errors.middleName && (
                        <span className="field-error">{errors.middleName}</span>
                      )}
                    </div>

                    <div className={fieldClassName("lastName")}>
                      <label>
                        Last Name <span className="required">*</span>
                      </label>
                      <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        autoComplete="family-name"
                        aria-invalid={Boolean(errors.lastName)}
                      />
                      {errors.lastName && (
                        <span className="field-error">{errors.lastName}</span>
                      )}
                    </div>

                    <div className={fieldClassName("mobile")}>
                      <label>
                        Mobile Number <span className="required">*</span>
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
                        autoComplete="tel"
                        aria-invalid={Boolean(errors.mobile)}
                      />
                      {errors.mobile && (
                        <span className="field-error">{errors.mobile}</span>
                      )}
                    </div>

                    <div className={fieldClassName("email")}>
                      <label>
                        Email ID <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                      />
                      {errors.email && (
                        <span className="field-error">{errors.email}</span>
                      )}
                    </div>

                    <div className={fieldClassName("company")}>
                      <label>
                        Company <span className="required">*</span>
                      </label>
                      <input
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        autoComplete="organization"
                        aria-invalid={Boolean(errors.company)}
                      />
                      {errors.company && (
                        <span className="field-error">{errors.company}</span>
                      )}
                    </div>

                    <div className={fieldClassName("address1")}>
                      <label>
                        Address <span className="required">*</span>
                      </label>
                      <textarea
                        name="address1"
                        placeholder="House number and street name"
                        value={formData.address1}
                        onChange={handleChange}
                        autoComplete="address-line1"
                        aria-invalid={Boolean(errors.address1)}
                      />
                      {errors.address1 && (
                        <span className="field-error">{errors.address1}</span>
                      )}
                    </div>

                    <div className="address-field">
                      <label>Address Line 2 (Optional)</label>
                      <textarea
                        name="address2"
                        placeholder="Apartment, suite, unit, etc."
                        value={formData.address2}
                        onChange={handleChange}
                        autoComplete="address-line2"
                      />
                    </div>

                    <div className={fieldClassName("country")}>
                      <label>
                        Country <span className="required">*</span>
                      </label>
                      <input
                        name="country"
                        value={formData.country}
                        disabled
                        autoComplete="country-name"
                        aria-invalid={Boolean(errors.country)}
                      />
                      {errors.country && (
                        <span className="field-error">{errors.country}</span>
                      )}
                    </div>

                    <div className={fieldClassName("state")}>
                      <label>
                        State <span className="required">*</span>
                      </label>
                      <div
                        className={`select-wrapper ${isStateOpen ? "open" : ""} ${
                          errors.state ? "invalid" : ""
                        }`}
                        ref={stateRef}
                      >
                        <button
                          type="button"
                          className="select-trigger"
                          onClick={toggleStateDropdown}
                          aria-expanded={isStateOpen}
                        >
                          <span
                            className={
                              formData.state ? "" : "select-placeholder"
                            }
                          >
                            {formData.state || "Select State"}
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
                              {locationLoading ? (
                                <div className="select-empty">Loading states...</div>
                              ) : locationError ? (
                                <div className="select-empty">{locationError}</div>
                              ) : filteredStates.length === 0 ? (
                                <div className="select-empty">No states found</div>
                              ) : (
                                filteredStates.map((stateOption) => (
                                  <button
                                    key={stateOption.rawName}
                                    type="button"
                                    className={`select-option ${
                                      normalizeLocationText(formData.state) ===
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
                      {errors.state && (
                        <span className="field-error">{errors.state}</span>
                      )}
                    </div>

                    <div className={fieldClassName("city")}>
                      <label>
                        City <span className="required">*</span>
                      </label>
                      <div
                        className={`select-wrapper ${
                          !selectedStateRawName ? "disabled" : ""
                        } ${isCityOpen ? "open" : ""} ${
                          errors.city ? "invalid" : ""
                        }`}
                        ref={cityRef}
                      >
                        <button
                          type="button"
                          className="select-trigger"
                          onClick={toggleCityDropdown}
                          disabled={!selectedStateRawName}
                          aria-expanded={isCityOpen}
                        >
                          <span
                            className={
                              formData.city ? "" : "select-placeholder"
                            }
                          >
                            {formData.city || "Select City"}
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
                              {cityLoading ? (
                                <div className="select-empty">Loading cities...</div>
                              ) : cityError ? (
                                <div className="select-empty">{cityError}</div>
                              ) : filteredCities.length === 0 ? (
                                <div className="select-empty">
                                  No cities found
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

                    <div className={fieldClassName("pincode")}>
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
                        autoComplete="postal-code"
                        aria-invalid={Boolean(errors.pincode)}
                      />
                      {errors.pincode && (
                        <span className="field-error">{errors.pincode}</span>
                      )}
                    </div>
                  </div>

                  <div className="address-form-actions">
                    <button type="submit" className="submit-btn">
                      {editingAddressId !== null || editingAddressIndex !== null
                        ? "UPDATE"
                        : "SUBMIT"}
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {deleteTarget?.address && (
        <div className="address-delete-overlay" onClick={closeDeleteDialog}>
          <div
            className="address-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-address-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-address-title">Delete Address?</h3>
            <p>
              This will remove the saved address for{" "}
              <strong>
                {deleteTarget.address.firstName} {deleteTarget.address.lastName}
              </strong>
              .
            </p>
            <div className="address-delete-actions">
              <button
                type="button"
                className="delete-cancel-btn"
                onClick={closeDeleteDialog}
                disabled={isDeletingAddress}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-confirm-btn"
                onClick={confirmDeleteAddress}
                disabled={isDeletingAddress}
              >
                {isDeletingAddress ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
