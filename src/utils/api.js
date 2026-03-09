const JSON_SERVER_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const getPublicDbUrl = () => `${process.env.PUBLIC_URL}/data/db.json`;

export const isStaticDataMode = () => {
  if (typeof window === "undefined") return false;
  return window.location.hostname.includes("github.io");
};

const toQueryString = (query = {}) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }
    params.set(key, value);
  });

  const output = params.toString();
  return output ? `?${output}` : "";
};

const normalizeComparable = (value) => String(value ?? "").toLowerCase();

const applyQuery = (records, query = {}) => {
  let output = Array.isArray(records) ? [...records] : [];
  const { _sort, _order, ...filters } = query;

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      const allowed = value.map(normalizeComparable);
      output = output.filter((item) =>
        allowed.includes(normalizeComparable(item?.[key]))
      );
      return;
    }

    output = output.filter(
      (item) => normalizeComparable(item?.[key]) === normalizeComparable(value)
    );
  });

  if (_sort) {
    const direction = String(_order || "asc").toLowerCase() === "desc" ? -1 : 1;
    output.sort((a, b) => {
      const left = a?.[_sort];
      const right = b?.[_sort];

      if (typeof left === "number" && typeof right === "number") {
        return (left - right) * direction;
      }

      return normalizeComparable(left).localeCompare(normalizeComparable(right)) * direction;
    });
  }

  return output;
};

const loadStaticDb = async (cache = "no-store") => {
  const response = await fetch(getPublicDbUrl(), { cache });
  if (!response.ok) {
    throw new Error("Failed to fetch db snapshot");
  }
  return response.json();
};

export const fetchCollection = async (resource, options = {}) => {
  const { query, cache = "no-store" } = options;

  if (!isStaticDataMode()) {
    const response = await fetch(
      `${JSON_SERVER_BASE_URL}/${resource}${toQueryString(query)}`,
      { cache }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch ${resource}`);
    }
    return response.json();
  }

  const db = await loadStaticDb(cache);
  return applyQuery(db?.[resource], query);
};

export const fetchEntity = async (resource, id, options = {}) => {
  const { cache = "no-store" } = options;

  if (!isStaticDataMode()) {
    const response = await fetch(
      `${JSON_SERVER_BASE_URL}/${resource}/${encodeURIComponent(id)}`,
      { cache }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch ${resource}/${id}`);
    }
    return response.json();
  }

  const records = await fetchCollection(resource, { cache });
  const match = records.find((item) => String(item?.id) === String(id));
  if (!match) {
    throw new Error(`Missing ${resource}/${id}`);
  }
  return match;
};

export const fetchSingleton = async (resource, options = {}) => {
  const { cache = "no-store" } = options;

  if (!isStaticDataMode()) {
    const response = await fetch(`${JSON_SERVER_BASE_URL}/${resource}`, { cache });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${resource}`);
    }
    return response.json();
  }

  const db = await loadStaticDb(cache);
  return db?.[resource] ?? null;
};

export const getApiBaseUrl = () => JSON_SERVER_BASE_URL;
