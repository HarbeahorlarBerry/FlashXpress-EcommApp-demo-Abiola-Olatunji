/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import useAuth from "../../hooks/useAuth";

const BACKEND_ORIGIN =
  import.meta.env.VITE_API_ORIGIN || "http://localhost:9000";

function ContinueWithFive({ onEmailOtp, onNotice }) {
  const handleGoogle = () => {
    window.location.href = `${BACKEND_ORIGIN}/auth/google`;
  };

  const handleOtherProvider = (name) => {
    onNotice(
      `${name} sign-in is not configured yet. Please continue with Gmail OTP or Google.`
    );
  };

  return (
    <div className="mt-5">
      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-gray-200 dark:border-zinc-800 w-full" />
        <span className="bg-white dark:bg-zinc-900 px-3 text-xs text-gray-500 dark:text-zinc-400 whitespace-nowrap">
          Or continue with
        </span>
        <div className="border-t border-gray-200 dark:border-zinc-800 w-full" />
      </div>

      {/* 5 continue options: Email/Gmail, Google, Facebook, Apple, X */}
      <div className="flex items-center justify-center gap-3.5">
        {/* 1. Email / Gmail OTP */}
        <button
          type="button"
          onClick={onEmailOtp}
          title="Continue with Gmail OTP"
          aria-label="Continue with Gmail OTP"
          className="w-10 h-10 rounded-full border border-gray-300 dark:border-zinc-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 transition cursor-pointer"
        >
          <svg className="w-5 h-5 text-gray-800 dark:text-zinc-200" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
        </button>

        {/* 2. Google */}
        <button
          type="button"
          onClick={handleGoogle}
          title="Continue with Google"
          aria-label="Continue with Google"
          className="w-10 h-10 rounded-full border border-gray-300 dark:border-zinc-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 transition cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.5-1.14 2.77-2.4 3.62v3.01h3.88c2.27-2.09 3.54-5.17 3.54-8.87z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.01c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.26v3.1C3.23 21.3 7.28 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.62H1.26A11.97 11.97 0 0 0 0 12c0 1.94.46 3.77 1.26 5.38l4.02-3.1z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.28 0 3.23 2.7 1.26 6.62l4.02 3.1c.95-2.85 3.6-4.97 6.72-4.97z"
            />
          </svg>
        </button>

        {/* 3. Facebook */}
        <button
          type="button"
          onClick={() => handleOtherProvider("Facebook")}
          title="Continue with Facebook"
          aria-label="Continue with Facebook"
          className="w-10 h-10 rounded-full border border-gray-300 dark:border-zinc-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 transition cursor-pointer"
        >
          <svg className="w-5 h-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.324V1.325C24 .597 23.403 0 22.675 0z" />
          </svg>
        </button>

        {/* 4. Apple */}
        <button
          type="button"
          onClick={() => handleOtherProvider("Apple")}
          title="Continue with Apple"
          aria-label="Continue with Apple"
          className="w-10 h-10 rounded-full border border-gray-300 dark:border-zinc-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 transition cursor-pointer"
        >
          <svg className="w-5 h-5 text-gray-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z" />
          </svg>
        </button>

        {/* 5. X */}
        <button
          type="button"
          onClick={() => handleOtherProvider("X")}
          title="Continue with X"
          aria-label="Continue with X"
          className="w-10 h-10 rounded-full border border-gray-300 dark:border-zinc-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 transition cursor-pointer"
        >
          <svg className="w-4 h-4 text-gray-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function RegisterModal({
  isOpen = false,
  onClose,
  onSwitchToLogin,
  initialStep = "overview",
}) {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // "overview" | "email" | "otp" | "details"
  const [step, setStep] = useState(initialStep);
  const [gmail, setGmail] = useState("");
  const [otp, setOtp] = useState("");
  const [registrationToken, setRegistrationToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [location, setLocation] = useState("Nigeria");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      setError("");
      setInfo("");
    }
  }, [isOpen, initialStep]);

  if (!isOpen) return null;

  const resetMessages = () => {
    setError("");
    setInfo("");
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    resetMessages();

    const cleanEmail = gmail.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your Gmail address.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/register/send-otp", {
        gmail: cleanEmail,
      });
      setGmail(cleanEmail);
      setInfo(data.message || "Verification code sent to your Gmail.");
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    resetMessages();

    const cleanOtp = otp.trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/register/verify-otp", {
        gmail,
        otp: cleanOtp,
      });
      setRegistrationToken(data.registrationToken);
      setInfo(data.message || "Gmail verified. Complete your registration.");
      setStep("details");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    resetMessages();

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/register", {
        gmail,
        username: username.trim(),
        password,
        registrationToken,
        country: location,
      });
      if (data.user) {
        setUser(data.user);
      }
      onClose?.();
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Could not complete registration.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    resetMessages();
    setStep("overview");
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 border border-gray-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close registration modal"
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white cursor-pointer"
        >
          ✕
        </button>

        {/* Left Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 dark:from-zinc-800 dark:to-zinc-900 p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Welcome to FlashXpress+
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-zinc-300">
              Enjoy welcome deals only for new shoppers
            </p>
          </div>

          <div className="my-8 bg-white/95 dark:bg-zinc-900/90 border border-orange-100 dark:border-zinc-700 rounded-2xl p-5 shadow-sm">
            <span className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
              Welcome Deals
            </span>
            <p className="mt-3 text-3xl font-black text-gray-900 dark:text-white">
              UP TO 70% OFF
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
              Verify your Gmail via OTP first, then finish your account setup.
            </p>
          </div>

          <div className="text-xs text-gray-500 dark:text-zinc-400">
            Gmail OTP verification • No passkey required
          </div>
        </div>

        {/* Right Panel */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          {step === "overview" && (
            <div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                Register with Gmail OTP
              </h3>
              <p className="mt-1.5 text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <span>✔</span>
                <span>Your information is protected</span>
              </p>

              {error && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    resetMessages();
                    setStep("email");
                  }}
                  className="w-full py-3.5 px-4 rounded-full bg-gray-950 dark:bg-orange-600 text-white font-bold hover:opacity-90 transition cursor-pointer"
                >
                  Register
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    if (onSwitchToLogin) onSwitchToLogin();
                    else navigate("/login");
                  }}
                  className="w-full py-3.5 px-4 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                >
                  Already have an account?
                </button>
              </div>

              <ContinueWithFive
                onEmailOtp={() => {
                  resetMessages();
                  setStep("email");
                }}
                onNotice={(msg) => {
                  resetMessages();
                  setError(msg);
                }}
              />

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-zinc-400">
                <span>Location:</span>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border border-gray-300 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-gray-800 dark:text-zinc-200 bg-white dark:bg-zinc-800"
                >
                  <option value="Nigeria">Nigeria</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-center text-gray-500 dark:text-zinc-400">
                By continuing, you confirm that you have read and accepted our{" "}
                <span className="underline">Terms of Service</span> and{" "}
                <span className="underline">Privacy Policy</span>.
              </p>
            </div>
          )}

          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  resetMessages();
                  setStep("overview");
                }}
                className="text-xs font-bold text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
              >
                ← Back to options
              </button>

              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Step 1: Verify your Gmail
                </h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                  Enter your Gmail to receive a 6-digit OTP before creating your account.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-1.5">
                  Gmail Address
                </label>
                <input
                  type="email"
                  required
                  value={gmail}
                  onChange={(e) => setGmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-full bg-gray-950 dark:bg-orange-600 text-white font-bold hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
              >
                {submitting ? "Sending OTP..." : "Send OTP Code"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  resetMessages();
                  setStep("email");
                }}
                className="text-xs font-bold text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
              >
                ← Change Gmail
              </button>

              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Step 2: Verify OTP
                </h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                  Enter the 6-digit code sent to{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">{gmail}</span>
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}
              {info && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-700">
                  {info}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-1.5">
                  6-Digit OTP
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-center text-lg font-bold tracking-widest outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-full bg-gray-950 dark:bg-orange-600 text-white font-bold hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
              >
                {submitting ? "Verifying..." : "Verify & Continue"}
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSendOtp()}
                className="w-full py-2 text-xs font-bold text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
              >
                Resend OTP
              </button>
            </form>
          )}

          {step === "details" && (
            <form onSubmit={handleCompleteRegistration} className="space-y-4">
              <div>
                <span className="inline-block text-xs font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Verified: {gmail}
                </span>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mt-2">
                  Step 3: Finalize Registration
                </h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                  Choose a username and password to finish registering.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={30}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_username"
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold disabled:opacity-50 transition cursor-pointer"
              >
                {submitting ? "Completing Registration..." : "Complete Registration"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}