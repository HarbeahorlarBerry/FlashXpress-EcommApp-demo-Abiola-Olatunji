/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, createContext } from "react";
import api from "../api/api";

const AuthContext = createContext();

const PORTAL_ENDPOINTS = {
  buyer: "/api/auth/login/buyer",
  seller: "/api/auth/login/seller",
  admin: "/api/auth/login/admin",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get("/api/auth/me");
      setUser(response.data?.user || null);
      return response.data?.user || null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ======================
  // LOGIN (DEFAULT OR PORTAL-SPECIFIC: "buyer" | "seller" | "admin")
  // ======================
  const login = async (identifier, password, portal = null) => {
    try {
      const trimmedId = String(identifier || "").trim();
      const endpoint =
        portal && PORTAL_ENDPOINTS[portal] ? PORTAL_ENDPOINTS[portal] : "/api/auth/login";

      const response = await api.post(endpoint, {
        identifier: trimmedId,
        gmail: trimmedId,
        password,
        ...(portal ? { portal } : {}),
      });

      const loggedInUser = response.data?.user || null;
      setUser(loggedInUser);

      return {
        success: true,
        user: loggedInUser,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  // ======================
  // LOGOUT
  // ======================
  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Handle logout error gracefully
    }
    localStorage.removeItem("token");
    setUser(null);
  };

  // ======================
  // FETCH CURRENT USER
  // ======================
  useEffect(() => {
    let mounted = true;
    fetchUser().finally(() => {
      if (!mounted) setUser(null);
    });
    return () => {
      mounted = false;
    };
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;