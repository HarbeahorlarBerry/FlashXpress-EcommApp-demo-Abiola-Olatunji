import { createContext, useCallback, useEffect, useState } from "react";
import api from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const openRegisterModal = useCallback(() => {
    setRegisterModalOpen(true);
  }, []);

  const closeRegisterModal = useCallback(() => {
    setRegisterModalOpen(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user || null);
      return data.user || null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (active) setUser(data.user || null);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const login = async (identifierOrEmail, password) => {
    try {
      const trimmed = String(identifierOrEmail || "").trim();
      const { data } = await api.post("/auth/login", {
        identifier: trimmed,
        username: trimmed,
        gmail: trimmed.toLowerCase(),
        email: trimmed.toLowerCase(),
        password,
      });
      setUser(data.user || null);
      return {
        success: true,
        user: data.user,
        message: data.message || "Login successful",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Password or username is incorrect",
      };
    }
  };

  const requestPasswordReset = async (gmailOrEmail) => {
    try {
      const normalizedEmail = String(gmailOrEmail || "").trim().toLowerCase();
      const { data } = await api.post("/auth/password-reset-request", {
        gmail: normalizedEmail,
        email: normalizedEmail,
      });
      return {
        success: data.status !== "error",
        message:
          data.message || "If that email exists, a reset link has been sent",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Could not send password recovery email right now",
      };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const { data } = await api.post("/auth/password-reset", {
        token,
        newPassword,
      });
      return {
        success: data.status !== "error",
        message: data.message || "Password reset successful",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Invalid or expired reset token",
      };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Clear local user state even if network request fails
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        requestPasswordReset,
        resetPassword,
        logout,
        refreshUser,
        registerModalOpen,
        openRegisterModal,
        closeRegisterModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;