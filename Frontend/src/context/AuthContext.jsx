/* eslint-disable no-unused-vars */
import { useState, useEffect, createContext } from "react";
import api from "../api/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ======================
  // LOGIN
  // ======================
  const login = async (gmail, password) => {
    try {
      const response = await api.post("/auth/login", {
        gmail,
        password,
      });

      // Save token to localStorage so subsequent requests are authenticated
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      setUser(response.data.user);

      return {
        success: true,
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
      await api.post("/auth/logout");
    } catch (e) {
      // Handle logout error gracefully
    }
    localStorage.removeItem("token");
    setUser(null);
  };

  // ======================
  // FETCH USER
  // ======================
  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        const response = await api.get("/auth/me");
        if (mounted) {
          setUser(response.data.user);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;