import { withPublicUrl } from "./assetPath";

const LOCAL_USERS_KEY = "aashaka_users";

export const isStaticHost = () => {
  if (typeof window === "undefined") return false;
  return window.location.hostname.includes("github.io");
};

export const loadLocalUsers = async () => {
  try {
    const stored = localStorage.getItem(LOCAL_USERS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed)
        ? parsed.map((user) => ({
            ...user,
            image: withPublicUrl(user.image),
          }))
        : [];
    }
  } catch {
    // ignore malformed storage
  }

  try {
    const res = await fetch(`${process.env.PUBLIC_URL}/data/users.json`);
    if (!res.ok) return [];
    const data = await res.json();
    const users = Array.isArray(data) ? data : data?.users;
    if (Array.isArray(users)) {
      const normalized = users.map((user) => ({
        ...user,
        image: withPublicUrl(user.image),
      }));
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(normalized));
      return normalized;
    }
  } catch {
    // ignore fetch errors
  }

  return [];
};

export const saveLocalUsers = (users) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};
