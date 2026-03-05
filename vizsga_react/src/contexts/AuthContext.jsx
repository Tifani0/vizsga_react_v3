import { createContext, useState, useContext, useEffect } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { user, token } = await authService.login(email, password);
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    return { success: true };
  };

  const register = async (name, email, phonenumber, password, role, profession, providerCode) => {
    return authService.register(name, email, phonenumber, password, role, profession, providerCode);
  };

  const logout = async () => {
    try { await authService.logout(); } catch {}
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const isProvider = user?.role === "PROVIDER";
  const isAdmin = user?.role === "ADMIN";
  const isProviderOrAdmin = isProvider || isAdmin;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token, isProvider, isAdmin, isProviderOrAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
