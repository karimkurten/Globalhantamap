import { createContext, useContext, useEffect, useState } from "react";
import { adminLogin, adminMe } from "./api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("hanta_admin_token");
    if (!t) {
      setLoading(false);
      return;
    }
    adminMe()
      .then((u) => setUser(u))
      .catch(() => localStorage.removeItem("hanta_admin_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await adminLogin(email, password);
    localStorage.setItem("hanta_admin_token", data.access_token);
    const u = await adminMe();
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem("hanta_admin_token");
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
