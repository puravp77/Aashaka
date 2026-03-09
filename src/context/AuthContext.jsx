import { createContext, useContext, useEffect, useState } from "react";
import { isStaticHost, loadLocalUsers } from "../utils/localAuth";

const AuthContext = createContext();

const CUSTOMER_STORAGE_KEY = "store_user";
const ADMIN_STORAGE_KEY = "admin_user";
const LEGACY_STORAGE_KEY = "user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const storedCustomer = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    const storedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
    const legacyUser = localStorage.getItem(LEGACY_STORAGE_KEY);

    if (storedCustomer) {
      setUser(JSON.parse(storedCustomer));
    }

    if (storedAdmin) {
      setAdminUser(JSON.parse(storedAdmin));
    }

    if (legacyUser) {
      const parsedLegacy = JSON.parse(legacyUser);
      if (parsedLegacy?.role === "admin") {
        setAdminUser(parsedLegacy);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(parsedLegacy));
      } else {
        setUser(parsedLegacy);
        localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(parsedLegacy));
      }
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }

    setAuthReady(true);
  }, []);

  const authenticate = async (id, password) => {
    const authenticateFromLocalUsers = async () => {
      const users = await loadLocalUsers();
      const matchedUser = users.find((entry) => entry.id === id);
      if (!matchedUser) throw new Error("EMAIL_NOT_FOUND");
      if (matchedUser.password !== password) throw new Error("WRONG_PASSWORD");

      if (matchedUser.role === "admin") {
        try {
          const allowRes = await fetch("http://localhost:5000/allowlist");
          const allowList = await allowRes.json();
          matchedUser.isAuthorized = allowList.some(
            (entry) => entry.email.toLowerCase() === matchedUser.id.toLowerCase()
          );
        } catch {
          matchedUser.isAuthorized = false;
        }
      }

      return matchedUser;
    };

    if (isStaticHost()) {
      return authenticateFromLocalUsers();
    }

    try {
      const res = await fetch(`http://localhost:5000/users?id=${id}`);
      if (!res.ok) throw new Error("SERVER_ERROR");
      const users = await res.json();
      if (users.length === 0) throw new Error("EMAIL_NOT_FOUND");

      const matchedUser = users[0];
      if (matchedUser.password !== password) throw new Error("WRONG_PASSWORD");

      if (matchedUser.role === "admin") {
        try {
          const allowRes = await fetch("http://localhost:5000/allowlist");
          const allowList = await allowRes.json();
          matchedUser.isAuthorized = allowList.some(
            (entry) => entry.email.toLowerCase() === matchedUser.id.toLowerCase()
          );
        } catch (error) {
          console.error("Allowlist check failed:", error);
          matchedUser.isAuthorized = false;
        }
      }

      return matchedUser;
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "EMAIL_NOT_FOUND" || error.message === "WRONG_PASSWORD")
      ) {
        throw error;
      }
      return authenticateFromLocalUsers();
    }
  };

  const login = async (id, password) => {
    const customerUser = await authenticate(id, password);
    if (customerUser.role === "admin") {
      throw new Error("ADMIN_USE_ADMIN_PORTAL");
    }
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customerUser));
    setUser(customerUser);
    return customerUser;
  };

  const adminLogin = async (id, password) => {
    const authenticatedAdmin = await authenticate(id, password);
    if (authenticatedAdmin.role !== "admin") {
      throw new Error("NOT_ADMIN");
    }
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(authenticatedAdmin));
    setAdminUser(authenticatedAdmin);
    return authenticatedAdmin;
  };

  const logout = () => {
    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
    setUser(null);
  };

  const adminLogout = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setAdminUser(null);
  };

  if (!authReady) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{ user, adminUser, login, adminLogin, logout, adminLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
