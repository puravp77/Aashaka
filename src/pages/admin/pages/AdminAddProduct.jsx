import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../AdminLayout.css";
import "./AdminPages.css";

const categoryOptions = ["CLOTH", "JEWELLERY"];
const subCategoryMap = {
  CLOTH: ["Kurti"],
  JEWELLERY: ["Oxidised Set", "Bangles-Kada", "Earrings", "Necklace"],
};
const colorOptions = ["Red", "Blue", "Green", "Black", "White", "Pink", "Yellow"];
const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Free"];

const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function AdminCustomSelect({
  label,
  value,
  placeholder,
  options,
  onChange,
  disabled = false,
  hideLabel = false,
  openUp = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onDocClick = (event) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selectedLabel = value || placeholder;

  return (
    <div className={`adm-add-field ${hideLabel ? "adm-add-field-no-label" : ""}`}>
      {!hideLabel && <span>{label}</span>}
      <div className={`adm-custom-select ${disabled ? "is-disabled" : ""}`} ref={rootRef}>
        <button
          type="button"
          className={`adm-custom-select-trigger ${isOpen ? "is-open" : ""}`}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          disabled={disabled}
        >
          <span className={!value ? "is-placeholder" : ""}>{selectedLabel}</span>
          <i className={`adm-custom-caret ${isOpen ? "open" : ""}`} />
        </button>

        {isOpen && !disabled && (
          <ul className={`adm-custom-select-menu ${openUp ? "open-up" : ""}`} role="listbox" aria-label={label}>
            <li>
              <button
                type="button"
                className={`adm-custom-option ${!value ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                  setIsOpen(false);
                }}
              >
                {placeholder}
              </button>
            </li>
            {options.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className={`adm-custom-option ${item === value ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(item);
                    setIsOpen(false);
                  }}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function AdminAddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    category: "",
    subCategory: "",
    itemName: "",
    itemPrice: "",
    percentage: "",
    discount: "",
    color: "",
    description: "",
    material: "",
    specification: "",
    styleNotes: "",
    finalPrice: "",
  });
  const [itemImageName, setItemImageName] = useState("");
  const [multiImageNames, setMultiImageNames] = useState([]);
  const [inventoryRows, setInventoryRows] = useState([{ size: "", stock: "" }]);

  const computedFinalPrice = useMemo(() => {
    const price = parseNumber(form.itemPrice);
    const discount = parseNumber(form.discount);
    const percentage = parseNumber(form.percentage);
    const discountByPercent = price * (percentage / 100);
    const totalDiscount = discount + discountByPercent;
    const finalValue = Math.max(0, price - totalDiscount);
    return finalValue > 0 ? Math.round(finalValue) : 0;
  }, [form.itemPrice, form.discount, form.percentage]);

  const availableSubCategories = useMemo(() => {
    return subCategoryMap[form.category] || [];
  }, [form.category]);

  const finalPriceValue = form.finalPrice || String(computedFinalPrice || "");

  const onChangeField = (field) => (event) => {
    const { value } = event.target;
    setForm((prev) => {
      if (field === "category") {
        return { ...prev, category: value, subCategory: "" };
      }
      return { ...prev, [field]: value };
    });
  };

  const onChangeItemImage = (event) => {
    const file = event.target.files?.[0];
    setItemImageName(file ? file.name : "");
  };

  const onChangeMultipleImages = (event) => {
    const files = Array.from(event.target.files || []);
    setMultiImageNames(files.map((file) => file.name));
  };

  const onInventoryChange = (index, key, value) => {
    setInventoryRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    );
  };

  const addInventoryRow = () => {
    setInventoryRows((prev) => [...prev, { size: "", stock: "" }]);
  };

  const removeInventoryRow = (index) => {
    setInventoryRows((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/admin/products");
  };

  return (
    <section className="adm-widget adm-add-product-page">
      <div className="adm-widget-head">
        <h2>Add Product</h2>
      </div>

      <form className="adm-add-product-form" onSubmit={handleSubmit}>
        <div className="adm-add-section">
          <h3>Basic Details</h3>
          <div className="adm-add-grid adm-add-grid-4">
            <AdminCustomSelect
              label="Category Name"
              value={form.category}
              placeholder="---Select Category---"
              options={categoryOptions}
              onChange={(nextValue) =>
                setForm((prev) => ({ ...prev, category: nextValue, subCategory: "" }))
              }
            />

            <AdminCustomSelect
              label="SubCategory Name"
              value={form.subCategory}
              placeholder="---Select SubCategory---"
              options={availableSubCategories}
              onChange={(nextValue) =>
                setForm((prev) => ({ ...prev, subCategory: nextValue }))
              }
              disabled={!form.category}
            />

            <label className="adm-add-field">
              <span>Item Name</span>
              <input className="adm-input adm-add-input" value={form.itemName} onChange={onChangeField("itemName")} placeholder="Enter item name" required />
            </label>

            <label className="adm-add-field">
              <span>Item Price</span>
              <input className="adm-input adm-add-input" type="number" min="0" value={form.itemPrice} onChange={onChangeField("itemPrice")} placeholder="Enter item price" required />
            </label>
          </div>
        </div>

        <div className="adm-add-section">
          <h3>Pricing and Variants</h3>
          <div className="adm-add-grid adm-add-grid-4">
            <label className="adm-add-field">
              <span>Percentage</span>
              <input className="adm-input adm-add-input" type="number" min="0" value={form.percentage} onChange={onChangeField("percentage")} placeholder="Enter percentage" />
            </label>
            <label className="adm-add-field">
              <span>Discount</span>
              <input className="adm-input adm-add-input" type="number" min="0" value={form.discount} onChange={onChangeField("discount")} placeholder="Enter discount" />
            </label>
            <label className="adm-add-field">
              <span>Final Price</span>
              <input className="adm-input adm-add-input" value={finalPriceValue} readOnly placeholder="Final price" />
            </label>
            <AdminCustomSelect
              label="Color"
              value={form.color}
              placeholder="---Select Color---"
              options={colorOptions}
              onChange={(nextValue) => setForm((prev) => ({ ...prev, color: nextValue }))}
            />
          </div>
        </div>

        <div className="adm-add-section">
          <h3>Media Uploads</h3>
          <div className="adm-add-grid adm-add-grid-2">
            <label className="adm-add-field">
              <span>Item Image</span>
              <div className="adm-upload-box">
                <input className="adm-input adm-input-file" type="file" onChange={onChangeItemImage} />
                <small className="adm-file-hint">{itemImageName || "Upload single cover image"}</small>
              </div>
            </label>
            <label className="adm-add-field">
              <span>Multiple Image</span>
              <div className="adm-upload-box">
                <input className="adm-input adm-input-file" type="file" multiple onChange={onChangeMultipleImages} />
                <small className="adm-file-hint">
                  {multiImageNames.length > 0 ? `${multiImageNames.length} files uploaded` : "Upload gallery images"}
                </small>
              </div>
            </label>
          </div>
        </div>

        <div className="adm-add-section">
          <h3>Product Content</h3>
          <div className="adm-add-grid adm-add-grid-2">
            <label className="adm-add-field">
              <span>Description</span>
              <textarea className="adm-input adm-rich-text" value={form.description} onChange={onChangeField("description")} placeholder="Write description..." />
            </label>
            <label className="adm-add-field">
              <span>Material</span>
              <textarea className="adm-input adm-rich-text" value={form.material} onChange={onChangeField("material")} placeholder="Write material details..." />
            </label>
          </div>

          <div className="adm-add-grid adm-add-grid-2">
            <label className="adm-add-field">
              <span>Specification</span>
              <textarea className="adm-input adm-rich-text" value={form.specification} onChange={onChangeField("specification")} placeholder="Write specification..." />
            </label>
            <label className="adm-add-field">
              <span>Style Notes</span>
              <textarea className="adm-input adm-rich-text" value={form.styleNotes} onChange={onChangeField("styleNotes")} placeholder="Write style notes..." />
            </label>
          </div>
        </div>

        <div className="adm-add-section">
          <h3>Inventory</h3>
          <div className="adm-add-field">
            <span>Size and Stock</span>
            <div className="adm-inventory-list">
              {inventoryRows.map((row, index) => (
                <div className="adm-inventory-row" key={`${index}-${row.size}`}>
                  <AdminCustomSelect
                    label="Size"
                    value={row.size}
                    placeholder="Select size"
                    options={sizeOptions}
                    onChange={(nextValue) => onInventoryChange(index, "size", nextValue)}
                    hideLabel
                    openUp
                  />
                  <input
                    className="adm-input adm-add-input"
                    type="number"
                    min="0"
                    value={row.stock}
                    onChange={(event) => onInventoryChange(index, "stock", event.target.value)}
                    placeholder="Item total stock"
                  />
                  <button type="button" className="adm-circle-btn add" onClick={addInventoryRow}>
                    +
                  </button>
                  <button
                    type="button"
                    className="adm-circle-btn remove"
                    onClick={() => removeInventoryRow(index)}
                    disabled={inventoryRows.length === 1}
                  >
                    -
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="adm-add-actions">
          <button type="submit" className="adm-btn primary">Submit</button>
          <button type="button" className="adm-btn danger" onClick={() => navigate("/admin/products")}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
