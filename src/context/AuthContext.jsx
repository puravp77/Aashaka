import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getApiBaseUrl } from "../utils/api";

const AuthContext = createContext();

const AUTH_TOKEN_KEY = "auth_token";
const CUSTOMER_STORAGE_KEY = "store_user";
const ADMIN_STORAGE_KEY = "admin_user";
const AUTH_BASE_URL = `${getApiBaseUrl()}/api/auth`;

const normalizeUser = (apiUser) => {
  if (!apiUser) return null;

  return {
    ...apiUser,
    id: apiUser.email,
    isAuthorized: apiUser.role === "admin",
  };
};

const hydrateStoredUser = (storageKey) => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const clearSession = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setUser(null);
    setAdminUser(null);
  };

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      localStorage.removeItem(CUSTOMER_STORAGE_KEY);
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      setUser(null);
      setAdminUser(null);
      return null;
    }

    try {
      const response = await fetch(`${AUTH_BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = new Error("SESSION_EXPIRED");
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      const normalizedUser = normalizeUser(data?.user);

      if (normalizedUser?.role === "admin") {
        setAdminUser(normalizedUser);
        setUser(null);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(normalizedUser));
        localStorage.removeItem(CUSTOMER_STORAGE_KEY);
      } else {
        setUser(normalizedUser);
        setAdminUser(null);
        localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(normalizedUser));
        localStorage.removeItem(ADMIN_STORAGE_KEY);
      }

      return normalizedUser;
    } catch (error) {
      const storedAdminUser = hydrateStoredUser(ADMIN_STORAGE_KEY);
      const storedCustomerUser = hydrateStoredUser(CUSTOMER_STORAGE_KEY);
      const isAuthError = error?.status === 401 || error?.status === 403 || error?.message === "SESSION_EXPIRED";

      console.error("[auth] session restore failed", {
        message: error.message,
        status: error?.status || null,
        hasStoredAdminUser: Boolean(storedAdminUser),
        hasStoredCustomerUser: Boolean(storedCustomerUser),
      });

      if (isAuthError) {
        clearSession();
        return null;
      }

      if (storedAdminUser?.role === "admin") {
        setAdminUser(storedAdminUser);
        setUser(null);
        return storedAdminUser;
      }

      if (storedCustomerUser) {
        setUser(storedCustomerUser);
        setAdminUser(null);
        return storedCustomerUser;
      }

      return null;
    }
  }, []);

  useEffect(() => {
    const bootstrapAuth = async () => {
      await loadUser();
      setAuthReady(true);
    };

    bootstrapAuth();
  }, [loadUser]);

  const authenticate = async (email, password) => {
    const payload = { email, password };
    console.debug("[auth] POST login", {
      url: `${AUTH_BASE_URL}/login`,
      email,
    });

    try {
      const response = await fetch(`${AUTH_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      console.debug("[auth] login response", {
        status: response.status,
        ok: response.ok,
        user: data?.user ? {
          _id: data.user._id,
          email: data.user.email,
          role: data.user.role,
        } : null,
      });

      if (!response.ok) {
        throw new Error(data?.message || "LOGIN_FAILED");
      }

      const normalizedUser = normalizeUser(data?.user);
      console.debug("[auth] normalized user", {
        email: normalizedUser?.email,
        role: normalizedUser?.role,
      });

      return {
        token: data?.token,
        user: normalizedUser,
      };
    } catch (error) {
      if (error instanceof TypeError) {
        console.error("[auth] backend unreachable", error);
        throw new Error("BACKEND_UNREACHABLE");
      }

      console.error("[auth] login failed", error);
      throw error;
    }
  };

  const login = async (email, password) => {
    const session = await authenticate(email, password);
    if (session.user?.role === "admin") {
      throw new Error("ADMIN_USE_ADMIN_PORTAL");
    }

    localStorage.setItem(AUTH_TOKEN_KEY, session.token);
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(session.user));
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setUser(session.user);
    setAdminUser(null);
    return session.user;
  };

  const adminLogin = async (email, password) => {
    const session = await authenticate(email, password);
    console.debug("[auth] admin role check", {
      email: session.user?.email,
      role: session.user?.role,
    });
    if (session.user?.role !== "admin") {
      throw new Error("NOT_ADMIN");
    }

    localStorage.setItem(AUTH_TOKEN_KEY, session.token);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session.user));
    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
    setAdminUser(session.user);
    setUser(null);
    return session.user;
  };

  const logout = () => {
    clearSession();
  };

  const adminLogout = () => {
    clearSession();
  };

  if (!authReady) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{ user, adminUser, login, adminLogin, logout, adminLogout, loadUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
