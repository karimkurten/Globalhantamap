import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { adminLogin, adminLogout, adminMe } from "./api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from server: cookie-backed session, no localStorage.
  const refresh = useCallback(async () => {
    try {
      const u = await adminMe();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email, password) => {
    await adminLogin(email, password); // sets HttpOnly cookie server-side
    const u = await adminMe();
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminLogout();
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
