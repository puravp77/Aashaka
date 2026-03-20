import { getApiBaseUrl } from "./api";

const BASE_URL = getApiBaseUrl();

const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    throw new Error("Please log in as admin.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const readJson = async (response, fallback) => {
  try {
    return await response.json();
  } catch {
    return fallback;
  }
};

export const fetchAdminOrders = async () => {
  const response = await fetch(`${BASE_URL}/api/orders`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  const data = await readJson(response, []);

  if (!response.ok) {
    throw new Error(data?.message || "Unable to load orders.");
  }

  return Array.isArray(data) ? data : [];
};

export const updateAdminOrder = async (orderId, payload) => {
  const response = await fetch(`${BASE_URL}/api/orders/${encodeURIComponent(orderId)}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await readJson(response, {});

  if (!response.ok) {
    throw new Error(data?.message || "Unable to update order.");
  }

  return data?.order || data;
};

export const updateAdminOrderStatus = async (orderId, status) => {
  const response = await fetch(
    `${BASE_URL}/api/orders/${encodeURIComponent(orderId)}/status`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    }
  );
  const data = await readJson(response, {});

  if (!response.ok) {
    throw new Error(data?.message || "Unable to update order status.");
  }

  return data?.order || data;
};

export const fetchAdminProducts = async () => {
  const response = await fetch(`${BASE_URL}/api/products`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  const data = await readJson(response, []);

  if (!response.ok) {
    throw new Error(data?.message || "Unable to load products.");
  }

  return Array.isArray(data) ? data : [];
};

export const fetchAdminProductById = async (productId) => {
  const response = await fetch(`${BASE_URL}/api/products/${encodeURIComponent(productId)}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  const data = await readJson(response, {});

  if (!response.ok) {
    throw new Error(data?.message || "Unable to load product.");
  }

  return data;
};

export const createAdminProduct = async (payload) => {
  const response = await fetch(`${BASE_URL}/api/products`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await readJson(response, {});

  if (!response.ok) {
    throw new Error(data?.message || "Unable to create product.");
  }

  return data?.product || data;
};

export const updateAdminProduct = async (productId, payload) => {
  const response = await fetch(`${BASE_URL}/api/products/${encodeURIComponent(productId)}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await readJson(response, {});

  if (!response.ok) {
    throw new Error(data?.message || "Unable to update product.");
  }

  return data?.product || data;
};

export const deleteAdminProduct = async (productId) => {
  const response = await fetch(`${BASE_URL}/api/products/${encodeURIComponent(productId)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await readJson(response, {});

  if (!response.ok) {
    throw new Error(data?.message || "Unable to delete product.");
  }

  return data;
};

export const fetchAdminCustomers = async () => {
  const response = await fetch(`${BASE_URL}/api/users`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  const data = await readJson(response, []);

  if (!response.ok) {
    throw new Error(data?.message || "Unable to load customers.");
  }

  return Array.isArray(data) ? data : [];
};

export const fetchAdminUsers = async () => {
  const response = await fetch(`${BASE_URL}/api/users/admins`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  const data = await readJson(response, []);

  if (!response.ok) {
    throw new Error(data?.message || "Unable to load admin users.");
  }

  return Array.isArray(data) ? data : [];
};

export const createAdminUser = async (payload) => {
  const response = await fetch(`${BASE_URL}/api/users/admins`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await readJson(response, {});

  if (!response.ok) {
    throw new Error(data?.message || "Unable to create admin user.");
  }

  return data?.user || data;
};

export const deleteAdminUser = async (adminId) => {
  const response = await fetch(`${BASE_URL}/api/users/admins/${encodeURIComponent(adminId)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await readJson(response, {});

  if (!response.ok) {
    throw new Error(data?.message || "Unable to remove admin user.");
  }

  return data;
};
