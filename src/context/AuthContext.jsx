import { createContext, useContext, useEffect, useState } from "react";
import { isStaticHost, loadLocalUsers } from "../utils/localAuth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false); // ✅ NEW

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setAuthReady(true); 
  }, []);

  const login = async (id, password) => {
    const loginFromLocalUsers = async () => {
      const users = await loadLocalUsers();
      const user = users.find((u) => u.id === id);
      if (!user) {
        throw new Error("EMAIL_NOT_FOUND");
      }
      if (user.password !== password) {
        throw new Error("WRONG_PASSWORD");
      }

      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      return user;
    };

    if (isStaticHost()) {
      return loginFromLocalUsers();
    }

    try {
      const res = await fetch(`http://localhost:5000/users?id=${id}`);

      if (!res.ok) {
        throw new Error("SERVER_ERROR");
      }

      const users = await res.json();

      if (users.length === 0) {
        throw new Error("EMAIL_NOT_FOUND");
      }

      const user = users[0];

      if (user.password !== password) {
        throw new Error("WRONG_PASSWORD");
      }

      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      return user;
    } catch {
      // Fallback for local-only development without json-server backend.
      return loginFromLocalUsers();
    }
  };


  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  if (!authReady) {
    return null; 
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
