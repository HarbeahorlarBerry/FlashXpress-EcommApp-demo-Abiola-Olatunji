import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!token) {
      const msg = "Missing or invalid reset token";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }
    if (newPassword.length < 8) {
      const msg = "Password must be at least 8 characters";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = "Passwords do not match";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/password-reset", {
        token,
        newPassword,
      });

      if (data?.status === "error") {
        const msg = data.message || "Invalid or expired token";
        setErrorMsg(msg);
        toast.error(msg);
      } else {
        toast.success(data?.message || "Password reset successful");
        navigate("/login");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Invalid or expired reset token";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col justify-center items-center px-4 py-12 text-zinc-900 dark:text-zinc-100">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl">
        <h1 className="text-2xl font-black tracking-tight mb-2">
          Set a new password
        </h1>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mb-6">
          Choose a strong password of at least 8 characters.
        </p>

        {errorMsg && (
          <div
            role="alert"
            className="mb-5 rounded-2xl border border-rose-500/40 bg-rose-50 dark:bg-rose-950/50 px-4 py-3 text-xs font-bold text-rose-700 dark:text-rose-300"
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">
              Confirm Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-2xl text-sm transition shadow-lg cursor-pointer disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs">
          <Link to="/login" className="text-orange-600 font-bold hover:underline">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}