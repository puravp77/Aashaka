import { isStaticHost } from "./localAuth";

const buildScopedKey = (baseKey, userId) => {
  if (userId === null || userId === undefined || userId === "") return null;
  return `${baseKey}_${String(userId)}`;
};

const readArray = (key) => {
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeArray = (key, list) => {
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(Array.isArray(list) ? list : []));
  } catch {
    // ignore storage failures
  }
};

export const shouldUseLocalCheckoutStore = () => isStaticHost();

export const createLocalRecordId = (prefix) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

export const getLocalAddresses = (userId) =>
  readArray(buildScopedKey("aashaka_addresses", userId));

export const setLocalAddresses = (userId, addresses) =>
  writeArray(buildScopedKey("aashaka_addresses", userId), addresses);

export const getLocalOrders = (userId) =>
  readArray(buildScopedKey("aashaka_orders", userId));

export const appendLocalOrder = (userId, orderRecord) => {
  const key = buildScopedKey("aashaka_orders", userId);
  if (!key) return;
  const orders = readArray(key);
  orders.push(orderRecord);
  writeArray(key, orders);
};
