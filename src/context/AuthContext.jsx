import { createContext, useContext, useEffect, useState } from "react";

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
  const res = await fetch(
    `http://localhost:5000/users?id=${id}`
  );

  if (!res.ok) {
    throw new Error("Server error");
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
