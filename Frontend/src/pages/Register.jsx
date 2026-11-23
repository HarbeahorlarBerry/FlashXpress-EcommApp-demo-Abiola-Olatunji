import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterModal from "../components/register/RegisterModel.jsx";

export default function Register() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [initialStep, setInitialStep] = useState("overview");

  const handleClose = () => {
    setIsOpen(false);
    navigate("/login");
  };

  const handleSwitchToLogin = () => {
    setIsOpen(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
          Register with Gmail OTP
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Verify your Gmail address with a 6-digit code before completing registration.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setInitialStep("email");
              setIsOpen(true);
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition cursor-pointer"
          >
            Start Gmail OTP Registration
          </button>
          <button
            type="button"
            onClick={() => {
              setInitialStep("overview");
              setIsOpen(true);
            }}
            className="bg-gray-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold px-5 py-2.5 rounded-xl text-sm transition cursor-pointer"
          >
            View All Options
          </button>
        </div>
      </div>

      <RegisterModal
        isOpen={isOpen}
        initialStep={initialStep}
        onClose={handleClose}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
}