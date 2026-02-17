import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import "./UserProfilePage.css";
import {
  createLocalRecordId,
  getLocalAddresses,
  setLocalAddresses,
  shouldUseLocalCheckoutStore,
} from "../../utils/localCheckoutData";

const STATES_API_URL = "https://www.india-location-hub.in/api/locations/states";
const DISTRICTS_API_URL =
  "https://www.india-location-hub.in/api/locations/districts";

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

const EditAddressPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const useLocalCheckoutStore = shouldUseLocalCheckoutStore();

  const storedUser = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  })();

  const userId = user?.id || storedUser?.id || null;
  const isEditMode = location.pathname.endsWith("/edit");
  const queryAddressId = searchParams.get("id");
  const queryIndex = searchParams.get("index");

  const [addresses, setAddresses] = useState([]);
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isStateOpen, setIsStateOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [stateOptions, setStateOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState("");

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

  const redirectToProfileWithSuccess = (message) => {
    navigate("/user-profile", {
      state: {
        addressToastMessage: message,
        addressToastId: Date.now(),
      },
    });
  };

  useEffect(() => {
    if (!userId) {
      setAddresses([]);
      setIsAddressLoading(false);
      return;
    }

    let ignore = false;

    const loadAddresses = async () => {
      setIsAddressLoading(true);

      if (useLocalCheckoutStore) {
        if (!ignore) {
          setAddresses(getLocalAddresses(userId));
          setIsAddressLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:5000/addresses?userId=${encodeURIComponent(userId)}`
        );
        if (!res.ok) {
          throw new Error("Failed to load addresses");
        }
        const data = await res.json();
        if (!ignore) {
          setAddresses(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!ignore) {
          setAddresses([]);
        }
      } finally {
        if (!ignore) {
          setIsAddressLoading(false);
        }
      }
    };

    loadAddresses();

    return () => {
      ignore = true;
    };
  }, [userId, useLocalCheckoutStore]);

  useEffect(() => {
    let ignore = false;

    const loadLocations = async () => {
      setLocationLoading(true);
      setLocationError("");

      try {
        const [statesRes, districtsRes] = await Promise.all([
          fetch(STATES_API_URL),
          fetch(DISTRICTS_API_URL),
        ]);

        if (!statesRes.ok || !districtsRes.ok) {
          throw new Error("Failed to load locations");
        }

        const statesJson = await statesRes.json();
        const districtsJson = await districtsRes.json();

        const apiStates = Array.isArray(statesJson?.data?.states)
          ? statesJson.data.states
          : [];
        const apiDistricts = Array.isArray(districtsJson?.data?.districts)
          ? districtsJson.data.districts
          : [];

        const normalizedStates = apiStates
          .map((state) => ({
            rawName: state?.name || "",
            label: formatLocationName(state?.name || ""),
          }))
          .filter((state) => state.rawName && state.label)
          .sort((a, b) => a.label.localeCompare(b.label));

        const normalizedDistricts = apiDistricts
          .map((district) => ({
            name: formatLocationName(district?.name || ""),
            rawStateName: district?.state_name || "",
          }))
          .filter((district) => district.name && district.rawStateName);

        if (!ignore) {
          setStateOptions(normalizedStates);
          setDistrictOptions(normalizedDistricts);
        }
      } catch (err) {
        if (!ignore) {
          setLocationError("Unable to load states and cities right now.");
          setStateOptions([]);
          setDistrictOptions([]);
        }
      } finally {
        if (!ignore) {
          setLocationLoading(false);
        }
      }
    };

    loadLocations();
    return () => {
      ignore = true;
    };
  }, []);

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

  useEffect(() => {
    if (!isEditMode || isAddressLoading) return;

    let targetIndex = -1;
    let targetAddress = null;

    if (queryAddressId) {
      targetIndex = addresses.findIndex(
        (item) => String(item.id) === String(queryAddressId)
      );
      if (targetIndex >= 0) {
        targetAddress = addresses[targetIndex];
      }
    }

    if (!targetAddress && queryIndex !== null && queryIndex !== undefined) {
      const parsedIndex = Number(queryIndex);
      if (Number.isInteger(parsedIndex) && parsedIndex >= 0) {
        targetIndex = parsedIndex;
        targetAddress = addresses[parsedIndex] || null;
      }
    }

    if (!targetAddress) {
      toast.error("Address not found.");
      navigate("/user-profile", { replace: true });
      return;
    }

    setEditingAddressId(targetAddress.id ?? null);
    setEditingAddressIndex(targetIndex);
    setFormData({
      firstName: targetAddress.firstName || "",
      middleName: targetAddress.middleName || "",
      lastName: targetAddress.lastName || "",
      mobile: targetAddress.mobile || "",
      email: targetAddress.email || "",
      company: targetAddress.company || "",
      address1: targetAddress.address1 || "",
      address2: targetAddress.address2 || "",
      country: targetAddress.country || "India",
      state: targetAddress.state || "",
      city: targetAddress.city || "",
      pincode: targetAddress.pincode || "",
    });
    setErrors({});
  }, [
    addresses,
    isAddressLoading,
    isEditMode,
    navigate,
    queryAddressId,
    queryIndex,
  ]);

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

  const selectedStateOption = stateOptions.find((stateOption) => {
    const normalizedSelected = normalizeLocationText(formData.state);
    return (
      normalizeLocationText(stateOption.label) === normalizedSelected ||
      normalizeLocationText(stateOption.rawName) === normalizedSelected
    );
  });

  const selectedStateRawName = selectedStateOption?.rawName || "";

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

  const fieldClassName = (fieldName) =>
    `address-field ${errors[fieldName] ? "error" : ""}`;

  const handleCancel = () => {
    navigate("/user-profile");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

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

    setIsSubmitting(true);

    if (useLocalCheckoutStore) {
      let nextAddresses = [...addresses];

      if (isEditMode) {
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

      setLocalAddresses(userId, nextAddresses);
      redirectToProfileWithSuccess(
        isEditMode ? "Address updated successfully!" : "Address added successfully!"
      );
      return;
    }

    try {
      if (isEditMode) {
        const hasPersistedId =
          editingAddressId !== null &&
          editingAddressId !== undefined &&
          editingAddressId !== "";

        if (hasPersistedId) {
          const res = await fetch(
            `http://localhost:5000/addresses/${editingAddressId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );

          if (!res.ok) {
            throw new Error("Failed to update address");
          }
        } else {
          throw new Error("Missing address id for update");
        }

        redirectToProfileWithSuccess("Address updated successfully!");
      } else {
        const res = await fetch("http://localhost:5000/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error("Failed to add address");
        }

        redirectToProfileWithSuccess("Address added successfully!");
      }
    } catch (err) {
      toast.error(
        isEditMode
          ? "Unable to update address right now."
          : "Unable to add address right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-inner">
        <div className="address-section">
          <div className="address-hero">
            <p className="address-kicker">Your Account</p>
            <h2 className="address-title">
              {isEditMode ? "Edit Address" : "Add Address"}
            </h2>
            <p className="address-subtitle">
              {isEditMode
                ? "Update your saved delivery address details."
                : "Add a new delivery address for faster checkout."}
            </p>
          </div>

          <div className="address-form-wrap">
            <form className="address-form" onSubmit={handleSubmit}>
              <div className="address-form-head">
                <h3>{isEditMode ? "Edit Address" : "Add New Address"}</h3>
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
                      <span className={formData.state ? "" : "select-placeholder"}>
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
                      <span className={formData.city ? "" : "select-placeholder"}>
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
                          {locationLoading ? (
                            <div className="select-empty">Loading cities...</div>
                          ) : locationError ? (
                            <div className="select-empty">{locationError}</div>
                          ) : filteredCities.length === 0 ? (
                            <div className="select-empty">No cities found</div>
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
                  {errors.city && <span className="field-error">{errors.city}</span>}
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
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting || isAddressLoading}
                >
                  {isEditMode ? "UPDATE" : "SAVE ADDRESS"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAddressPage;
