import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterModal from "../components/register/RegisterModel.jsx";

export default function Auth() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
          Welcome to Flash<span className="text-orange-600">Xpress+</span>
        </h1>
        <p className="text-sm text-gray-600 dark:text-zinc-400">
          Register with Gmail OTP verification or sign in to your account.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-gray-950 dark:bg-orange-600 text-white text-sm font-bold hover:opacity-90 transition cursor-pointer"
          >
            Register with Gmail OTP
          </button>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="px-6 py-3 rounded-xl bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm font-bold hover:opacity-90 transition cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>

      <RegisterModal
        isOpen={modalOpen}
        initialStep="overview"
        onClose={() => {
          setModalOpen(false);
          navigate("/login");
        }}
        onSwitchToLogin={() => navigate("/login")}
      />
    </div>
  );
}