import { withPublicUrl } from "./assetPath";
import { fetchCollection } from "./api";

const LOCAL_USERS_KEY = "aashaka_users";

export const isStaticHost = () => {
  if (typeof window === "undefined") return false;
  return window.location.hostname.includes("github.io");
};

export const loadLocalUsers = async () => {
  let storedUsers = [];
  try {
    const stored = localStorage.getItem(LOCAL_USERS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      storedUsers = Array.isArray(parsed)
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
    const users = await fetchCollection("users");
    if (Array.isArray(users)) {
      const normalizedFromFile = users.map((user) => ({
        ...user,
        image: withPublicUrl(user.image),
      }));
      const byId = new Map(
        [...storedUsers, ...normalizedFromFile].map((user) => [user.id, user])
      );
      const mergedUsers = Array.from(byId.values());
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(mergedUsers));
      return mergedUsers;
    }
  } catch {
    // ignore fetch errors
  }

  return storedUsers;
};

export const saveLocalUsers = (users) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};
