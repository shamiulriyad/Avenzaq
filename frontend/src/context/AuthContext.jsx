import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";

export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsAuthLoading(false);
      return;
    }

    setIsAuthLoading(true);

    authService.getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
        setToken("");
        setUser(null);
      })
      .finally(() => {
        setIsAuthLoading(false);
      });
  }, [token]);

  const login = async (payload) => {
    setIsAuthLoading(true);
    try {
      const auth = await authService.login(payload);
      localStorage.setItem("token", auth.token);
      setToken(auth.token);
      setUser({ email: auth.email, fullName: auth.fullName, role: auth.role });
      return auth;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const register = async (payload) => {
    setIsAuthLoading(true);
    try {
      const auth = await authService.register(payload);
      localStorage.setItem("token", auth.token);
      setToken(auth.token);
      setUser({ email: auth.email, fullName: auth.fullName, role: auth.role });
      return auth;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setIsAuthLoading(false);
  };

  const value = useMemo(
    () => ({ token, user, login, register, logout, isAuthenticated: !!token, isAuthLoading }),
    [token, user, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
