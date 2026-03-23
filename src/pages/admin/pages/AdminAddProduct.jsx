import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "../AdminLayout.css";
import "./AdminPages.css";
import {
  createAdminProduct,
  fetchAdminProductById,
  fetchAdminProducts,
  updateAdminProduct,
} from "../../../utils/adminApi";

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

const uniqueValues = (values) => Array.from(new Set(values.filter(Boolean)));
const normalizeFilename = (value = "") => String(value).replace(/^.*[\\/]/, "").trim();

const createInventoryRow = (size = "", stock = "") => ({ size, stock });
const createJewelleryInventoryRow = () => createInventoryRow("Free", "10");

const createColorVariant = () => ({
  color: "",
  itemImageName: "",
  multiImageNames: [],
  inventoryRows: [createInventoryRow()],
});

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
            {options.map((item) => {
              const optionValue = typeof item === "string" ? item : item.value;
              const optionLabel = typeof item === "string" ? item : item.label ?? item.value;
              const optionDisabled = typeof item === "string" ? false : Boolean(item.disabled);

              return (
                <li key={optionValue}>
                  <button
                    type="button"
                    className={`adm-custom-option ${optionValue === value ? "active" : ""} ${optionDisabled ? "is-disabled" : ""}`}
                    disabled={optionDisabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (optionDisabled) return;
                      onChange(optionValue);
                      setIsOpen(false);
                    }}
                  >
                    {optionLabel}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function AdminAddProduct({ editMode = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const subCategoryPrefixMap = useMemo(() => ({
    "Kurti": { prefix: "k", category: "kurti" },
    "Oxidised Set": { prefix: "o", category: "oxidised" },
    "Bangles-Kada": { prefix: "b", category: "bangles" },
    "Earrings": { prefix: "e", category: "earrings" },
    "Necklace": { prefix: "n", category: "necklace" },
  }), []);
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
  const [colorVariants, setColorVariants] = useState([createColorVariant()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(editMode);

  useEffect(() => {
    if (editMode && id) {
      const fetchProduct = async () => {
        try {
          const data = await fetchAdminProductById(id);
          const normalizedRows = Array.isArray(data?.sizes) && data.sizes.length > 0
            ? data.sizes.map((entry) => createInventoryRow(entry?.size || "", String(entry?.quantity || 0)))
            : [data.category === "kurti" ? createInventoryRow() : createJewelleryInventoryRow()];
          const normalizedImages = Array.isArray(data?.images)
            ? data.images.map((img) => normalizeFilename(img)).filter(Boolean)
            : [];
          const availableSubCategory =
            Object.keys(subCategoryPrefixMap).find(
              (key) => subCategoryPrefixMap[key].category === data.category
            ) || "";

          setForm({
            category: data.category === "kurti" ? "CLOTH" : "JEWELLERY",
            subCategory: availableSubCategory,
            itemName: data.name || "",
            itemPrice: String(data.price || ""),
            percentage: "",
            discount: "",
            color: Array.isArray(data?.colors) ? data.colors[0] || "" : "",
            description: data.description || "",
            material: "",
            specification: "",
            styleNotes: "",
            finalPrice: String(data.price || ""),
          });

          if (data.category === "kurti") {
            const variants = [
              {
                color: Array.isArray(data?.colors) ? data.colors[0] || "" : "",
                itemImageName: normalizedImages[0] || "",
                multiImageNames: normalizedImages.slice(1),
                inventoryRows: normalizedRows,
              },
            ];

            setColorVariants(variants);
          } else {
            setColorVariants([createColorVariant()]);
            setItemImageName(normalizedImages[0] || "");
            setMultiImageNames(normalizedImages.slice(1));
            setInventoryRows(normalizedRows);
          }

          setIsLoading(false);
        } catch (err) {
          console.error(err);
          toast.error("Error loading product");
          navigate("/admin/products");
        }
      };
      fetchProduct();
    }
  }, [editMode, id, navigate, subCategoryPrefixMap]);

  const computedFinalPrice = useMemo(() => {
    const price = parseNumber(form.itemPrice);
    const percentage = parseNumber(form.percentage);
    const totalDiscount = percentage > 0
      ? price * (percentage / 100)
      : parseNumber(form.discount);
    const finalValue = Math.max(0, price - totalDiscount);
    return finalValue > 0 ? Math.round(finalValue) : 0;
  }, [form.itemPrice, form.discount, form.percentage]);

  const availableSubCategories = useMemo(() => {
    return subCategoryMap[form.category] || [];
  }, [form.category]);

  const computedDiscountValue = useMemo(() => {
    const price = parseNumber(form.itemPrice);
    const percentage = parseNumber(form.percentage);

    if (price <= 0 || percentage <= 0) {
      return "";
    }

    return String(Math.round(price * (percentage / 100)));
  }, [form.itemPrice, form.percentage]);

  const discountValue = form.percentage ? computedDiscountValue : form.discount;
  const finalPriceValue = form.finalPrice || String(computedFinalPrice || "");
  const selectedVariantColors = useMemo(
    () => colorVariants.map((variant) => variant.color).filter(Boolean),
    [colorVariants]
  );

  useEffect(() => {
    if (form.category === "JEWELLERY") {
      setInventoryRows((prev) =>
        prev.length > 0
          ? prev.map((row) => ({
              ...row,
              size: "Free",
              stock: row.stock || "10",
            }))
          : [createJewelleryInventoryRow()]
      );
    }
  }, [form.category]);

  useEffect(() => {
    if (form.category === "CLOTH") {
      setColorVariants((prev) => (prev.length > 0 ? prev : [createColorVariant()]));
    }
  }, [form.category]);

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

  const onVariantChange = (variantIndex, key, value) => {
    setColorVariants((prev) =>
      prev.map((variant, index) =>
        index === variantIndex ? { ...variant, [key]: value } : variant
      )
    );
  };

  const onVariantItemImageChange = (variantIndex, event) => {
    const file = event.target.files?.[0];
    onVariantChange(variantIndex, "itemImageName", file ? file.name : "");
  };

  const onVariantMultiImageChange = (variantIndex, event) => {
    const files = Array.from(event.target.files || []);
    onVariantChange(
      variantIndex,
      "multiImageNames",
      files.map((file) => file.name)
    );
  };

  const onVariantInventoryChange = (variantIndex, rowIndex, key, value) => {
    setColorVariants((prev) =>
      prev.map((variant, index) => {
        if (index !== variantIndex) return variant;
        return {
          ...variant,
          inventoryRows: variant.inventoryRows.map((row, currentRowIndex) =>
            currentRowIndex === rowIndex ? { ...row, [key]: value } : row
          ),
        };
      })
    );
  };

  const addColorVariant = () => {
    setColorVariants((prev) => (prev.length >= colorOptions.length ? prev : [...prev, createColorVariant()]));
  };

  const removeColorVariant = (variantIndex) => {
    setColorVariants((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, index) => index !== variantIndex);
    });
  };

  const getVariantColorOptions = (variantIndex) => {
    const currentColor = colorVariants[variantIndex]?.color;

    return colorOptions
      .filter((color) => color === currentColor || !selectedVariantColors.includes(color))
      .map((color) => ({
        value: color,
        label: color,
      }));
  };

  const getVariantSizeOptions = (variantIndex, rowIndex) => {
    const selectedSizes = colorVariants[variantIndex]?.inventoryRows
      .map((row) => row.size)
      .filter(Boolean) || [];
    const currentSize = colorVariants[variantIndex]?.inventoryRows?.[rowIndex]?.size;

    return sizeOptions
      .filter((size) => size !== "Free")
      .filter((size) => size === currentSize || !selectedSizes.includes(size))
      .map((size) => ({
        value: size,
        label: size,
      }));
  };

  const addVariantInventoryRow = (variantIndex) => {
    setColorVariants((prev) =>
      prev.map((variant, index) =>
        index === variantIndex
          ? { ...variant, inventoryRows: [...variant.inventoryRows, createInventoryRow()] }
          : variant
      )
    );
  };

  const removeVariantInventoryRow = (variantIndex, rowIndex) => {
    setColorVariants((prev) =>
      prev.map((variant, index) => {
        if (index !== variantIndex) return variant;
        if (variant.inventoryRows.length === 1) return variant;
        return {
          ...variant,
          inventoryRows: variant.inventoryRows.filter((_, currentRowIndex) => currentRowIndex !== rowIndex),
        };
      })
    );
  };

  const addInventoryRow = () => {
    const defaultRow = form.category === "JEWELLERY"
      ? createJewelleryInventoryRow()
      : createInventoryRow();
    setInventoryRows((prev) => [...prev, defaultRow]);
  };

  const removeInventoryRow = (index) => {
    setInventoryRows((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      let targetId = id;
      let finalCategory = "other";

      if (!editMode) {
        const currentProducts = await fetchAdminProducts();

        const config = subCategoryPrefixMap[form.subCategory] || { prefix: "p", category: "other" };
        const prefix = config.prefix;
        finalCategory = config.category;

        const regex = new RegExp(`^${prefix}(\\d+)$`, 'i');
        let maxNum = 0;
        currentProducts.forEach(p => {
          const match = String(p?.productId || "").match(regex);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
          }
        });
        targetId = `${prefix}${maxNum + 1}`;
      } else {
        const config = subCategoryPrefixMap[form.subCategory] || { category: "other" };
        finalCategory = config.category;
      }

      const inventorySource = form.category === "CLOTH"
        ? colorVariants[0]?.inventoryRows || []
        : inventoryRows;
      const normalizedSizes = inventorySource
        .map((row) => ({
          size: String(row?.size || "").trim(),
          quantity: parseNumber(row?.stock),
        }))
        .filter((row) => row.size);
      const imageSource = form.category === "CLOTH"
        ? [
            colorVariants[0]?.itemImageName || "",
            ...(colorVariants[0]?.multiImageNames || []),
          ]
        : [itemImageName, ...multiImageNames];
      const normalizedImages = uniqueValues(imageSource.map(normalizeFilename));
      const normalizedColors = form.category === "CLOTH"
        ? uniqueValues(colorVariants.map((variant) => variant.color))
        : uniqueValues([form.color]);
      const payload = {
        productId: targetId,
        name: form.itemName,
        price: parseNumber(finalPriceValue || form.itemPrice),
        category: finalCategory,
        description: form.description || form.material || "",
        images: normalizedImages,
        sizes: normalizedSizes,
        colors: normalizedColors,
        isFeatured: false,
      };

      if (editMode) {
        await updateAdminProduct(id, payload);
      } else {
        await createAdminProduct(payload);
      }

      toast.success(`Product ${targetId} ${editMode ? "updated" : "added"} successfully!`);
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("Error saving product: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="adm-widget adm-add-product-page">
      <div className="adm-widget-head">
        <h2>{editMode ? "Edit Product" : "Add Product"}</h2>
      </div>
      {isLoading && <div className="adm-loading-overlay">Loading Product Data...</div>}

      <form className="adm-add-product-form" onSubmit={handleSubmit}>
        {isSubmitting && (
          <div className="adm-submitting-overlay">
            <p>Saving Product...</p>
          </div>
        )}
        <div className="adm-add-section adm-product-content-section">
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
              <input
                className="adm-input adm-add-input"
                type="number"
                min="0"
                value={discountValue}
                onChange={onChangeField("discount")}
                placeholder="Enter discount"
                readOnly={Boolean(form.percentage)}
              />
            </label>
            <label className="adm-add-field">
              <span>Final Price</span>
              <input className="adm-input adm-add-input" value={finalPriceValue} readOnly placeholder="Final price" />
            </label>
            {form.category !== "CLOTH" && (
              <AdminCustomSelect
                label="Color"
                value={form.color}
                placeholder="---Select Color---"
                options={colorOptions}
                onChange={(nextValue) => setForm((prev) => ({ ...prev, color: nextValue }))}
              />
            )}
          </div>
        </div>

        {form.category !== "CLOTH" && (
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
        )}

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
            </label><br></br>
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

        {form.category === "CLOTH" && (
          <div className="adm-add-section">
            <div className="adm-section-head">
              <h3>Color Variants</h3>
              <button
                type="button"
                className="adm-btn secondary adm-variant-add-btn"
                onClick={addColorVariant}
                disabled={colorVariants.length >= colorOptions.length}
              >
                Add Color
              </button>
            </div>
            <div className="adm-color-variant-list">
              {colorVariants.map((variant, variantIndex) => (
                <div className="adm-color-variant-card" key={`variant-${variantIndex}`}>
                  <div className="adm-color-variant-head">
                    <strong>Color {variantIndex + 1}</strong>
                    <button
                      type="button"
                      className="adm-btn ghost adm-variant-remove-btn"
                      onClick={() => removeColorVariant(variantIndex)}
                      disabled={colorVariants.length === 1}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="adm-color-variant-media">
                    <AdminCustomSelect
                      label="Color"
                      value={variant.color}
                      placeholder="---Select Color---"
                      options={getVariantColorOptions(variantIndex)}
                      onChange={(nextValue) => onVariantChange(variantIndex, "color", nextValue)}
                    />

                    <label className="adm-add-field">
                      <span>Color Image</span>
                      <div className="adm-upload-box">
                        <input className="adm-input adm-input-file" type="file" onChange={(event) => onVariantItemImageChange(variantIndex, event)} />
                        <small className="adm-file-hint">{variant.itemImageName || "Upload single cover image"}</small>
                      </div>
                    </label>

                    <label className="adm-add-field">
                      <span>Color Multiple Image</span>
                      <div className="adm-upload-box">
                        <input className="adm-input adm-input-file" type="file" multiple onChange={(event) => onVariantMultiImageChange(variantIndex, event)} />
                        <small className="adm-file-hint">
                          {variant.multiImageNames.length > 0 ? `${variant.multiImageNames.length} files uploaded` : "Upload gallery images"}
                        </small>
                      </div>
                    </label>
                  </div>

                  <div className="adm-add-field">
                    <span>Size and Stock</span>
                    <div className="adm-inventory-list">
                      {variant.inventoryRows.map((row, rowIndex) => (
                        <div className="adm-inventory-row" key={`${variantIndex}-${rowIndex}-${row.size}`}>
                          <AdminCustomSelect
                            label="Size"
                            value={row.size}
                            placeholder="Select size"
                            options={getVariantSizeOptions(variantIndex, rowIndex)}
                            onChange={(nextValue) => onVariantInventoryChange(variantIndex, rowIndex, "size", nextValue)}
                            hideLabel
                            openUp
                          />
                          <input
                            className="adm-input adm-add-input"
                            type="number"
                            min="0"
                            value={row.stock}
                            onChange={(event) => onVariantInventoryChange(variantIndex, rowIndex, "stock", event.target.value)}
                            placeholder="Item total stock"
                          />
                          <button type="button" className="adm-circle-btn add" onClick={() => addVariantInventoryRow(variantIndex)}>
                            +
                          </button>
                          <button
                            type="button"
                            className="adm-circle-btn remove"
                            onClick={() => removeVariantInventoryRow(variantIndex, rowIndex)}
                            disabled={variant.inventoryRows.length === 1}
                          >
                            -
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {form.category !== "CLOTH" && (
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
                      disabled={form.category === "JEWELLERY"}
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
        )}

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
