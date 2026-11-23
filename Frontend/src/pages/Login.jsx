import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";
import useAuth from "../hooks/useAuth";
import RegisterModal from "../components/register/RegisterModel.jsx";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "recovery"
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [recoveryNotice, setRecoveryNotice] = useState("");

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalStep, setAuthModalStep] = useState("overview");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await login(identifier.trim(), password);
      if (res?.success) {
        toast.success("Welcome back!");
        navigate("/home");
      } else {
        const msg = res?.message || "Password or username is incorrect";
        setErrorMsg(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Password or username is incorrect";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setRecoveryNotice("");

    const trimmedEmail = recoveryEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      const msg = "Please enter your email/gmail address";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/password-reset-request", {
        gmail: trimmedEmail,
        email: trimmedEmail,
      });

      if (data?.status === "error") {
        const msg = data.message || "Could not send recovery link";
        setErrorMsg(msg);
        toast.error(msg);
      } else {
        const msg =
          data?.message || "If that email exists, a reset link has been sent";
        setRecoveryNotice(msg);
        toast.success(msg);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Could not send recovery link right now";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const openRegisterFlow = (step = "overview") => {
    setAuthModalStep(step);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col justify-center items-center px-4 py-12">
      {/* Brand Header with Flash Logo */}
      <div className="mb-8 text-center">
        <Link
          to="/home"
          className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-black tracking-tighter text-orange-600 dark:text-orange-500 group"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span>
            Flash<span className="text-zinc-900 dark:text-white">Xpress+</span>
          </span>
        </Link>
      </div>

      {/* Main Login / Recovery Card */}
      <div className="w-full max-w-md md:max-w-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-8 md:p-12 shadow-xl text-zinc-900 dark:text-zinc-100">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
            {mode === "login" ? "Sign in to your account" : "Recover your password"}
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400">
            {mode === "login"
              ? "Welcome back! Enter your username or email and password to continue."
              : "Enter your registered email/gmail address and we will send you a reset link."}
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-rose-500/40 bg-rose-50 dark:bg-rose-950/50 px-4 py-3 text-xs font-bold text-rose-700 dark:text-rose-300"
          >
            {errorMsg}
          </div>
        )}

        {recoveryNotice && (
          <div
            role="status"
            className="mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/50 px-4 py-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
          >
            {recoveryNotice}
          </div>
        )}

        {mode === "login" ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">
                Username or Email / Gmail
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="username or name@example.com"
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-orange-500 transition"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setRecoveryNotice("");
                    setRecoveryEmail(identifier.includes("@") ? identifier : "");
                    setMode("recovery");
                  }}
                  className="text-xs font-bold text-orange-600 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="••••••••"
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-orange-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl text-sm transition shadow-lg cursor-pointer disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRecoverySubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">
                Email / Gmail Address
              </label>
              <input
                type="email"
                required
                value={recoveryEmail}
                onChange={(e) => {
                  setRecoveryEmail(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="name@example.com"
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-orange-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl text-sm transition shadow-lg cursor-pointer disabled:opacity-50"
            >
              {loading ? "Sending reset link..." : "Send Password Reset Link"}
            </button>

            <button
              type="button"
              onClick={() => {
                setErrorMsg("");
                setRecoveryNotice("");
                setMode("login");
              }}
              className="w-full text-xs font-bold text-gray-600 dark:text-zinc-400 hover:text-orange-600 transition cursor-pointer"
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-xs text-gray-500 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => openRegisterFlow("overview")}
            className="text-orange-600 font-bold hover:underline cursor-pointer"
          >
            Create account (Gmail OTP)
          </button>
        </div>
      </div>

      <RegisterModal
        isOpen={authModalOpen}
        initialStep={authModalStep}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}