import { getApiBaseUrl } from "./api";

const BASE_URL = getApiBaseUrl();
const ORDERS_API_URL = `${BASE_URL}/api/orders`;
const ORDER_PLACEHOLDER_IMAGE = `${BASE_URL}/uploads/placeholder-product.jpg`;

const buildImageUrl = (image) => {
  if (!image) return ORDER_PLACEHOLDER_IMAGE;
  if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(image)) return image;
  const normalized = String(image).replace(/^\/+/, "");
  return `${BASE_URL}/uploads/${normalized}`;
};

const toTitleCase = (value) =>
  String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

export const normalizeOrder = (order) => {
  const rawItems = Array.isArray(order?.orderItems)
    ? order.orderItems
    : Array.isArray(order?.products)
      ? order.products
      : [];

  const items = rawItems.map((entry, index) => {
        const product = entry?.product || {};
        const imageName = entry?.image || (Array.isArray(product?.images) ? product.images[0] : null);

        return {
          id: String(product?.productId || product?._id || index),
          title: entry?.name || product?.name || "Product",
          image: buildImageUrl(imageName),
          size: entry?.size || null,
          qty: Number(entry?.quantity || 0),
          price: Number(entry?.price || product?.price || 0),
        };
      });

  const orderStatus = String(order?.orderStatus || "pending").toLowerCase();
  const paymentMethod = order?.paymentMethod || "COD";

  return {
    ...order,
    id: String(order?._id || ""),
    orderId: String(order?._id || ""),
    date: order?.createdAt || order?.updatedAt || new Date().toISOString(),
    total: Number(order?.totalPrice || 0),
    discount: 0,
    paymentMode: paymentMethod,
    statusLabel: toTitleCase(orderStatus),
    isDelivered: Boolean(order?.isDelivered) || orderStatus === "delivered",
    isPaid: Boolean(order?.isPaid),
    items,
  };
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    throw new Error("Please log in to view your orders.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const fetchMyOrders = async () => {
  const response = await fetch(`${ORDERS_API_URL}/my-orders`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  const data = await response.json().catch(() => []);

  if (!response.ok) {
    throw new Error(data?.message || "Unable to load your orders right now.");
  }

  return Array.isArray(data) ? data.map(normalizeOrder) : [];
};

export const fetchOrderById = async (orderId) => {
  if (!orderId) {
    throw new Error("Missing order ID.");
  }

  const response = await fetch(`${ORDERS_API_URL}/${encodeURIComponent(orderId)}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Unable to load your order right now.");
  }

  return normalizeOrder(data);
};
