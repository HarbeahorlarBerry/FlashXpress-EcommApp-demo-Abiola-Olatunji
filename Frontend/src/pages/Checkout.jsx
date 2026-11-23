/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { createCheckout } from "../api/cartApi";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
import useRegion from "../hooks/useRegion";

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

function getItemId(item) {
  const raw = item?.productId || item?._id || item?.id || "";
  if (typeof raw === "object" && raw !== null) {
    return String(raw._id || raw.id || "");
  }
  return String(raw || "");
}

function hasValidDbId(item) {
  return OBJECT_ID_RE.test(getItemId(item));
}

export default function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const { cart } = useCart();
  const { activeCountry, currency } = useRegion();

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
  });

  useEffect(() => {
    setAddress((prev) => ({
      ...prev,
      fullName: prev.fullName || user?.username || user?.name || "",
      country: activeCountry?.name || prev.country || "Nigeria",
    }));
  }, [user, activeCountry]);

  const handleChange = (field) => (e) => {
    setFeedback("");
    setAddress((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setFeedback("");

    if (authLoading) {
      const msg = "Checking your session, please wait a second and try again.";
      setFeedback(msg);
      toast.error(msg);
      return;
    }

    if (!user) {
      const msg = "Please log in before proceeding to payment.";
      setFeedback(msg);
      toast.error(msg);
      return;
    }

    const shippingAddress = {
      fullName: address.fullName.trim(),
      phone: address.phone.trim(),
      street: address.street.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      postalCode: address.postalCode.trim(),
      country: address.country.trim(),
    };

    if (
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.country
    ) {
      const msg =
        "Please fill in Full Name, Phone Number, Street Address, City, and Country.";
      setFeedback(msg);
      toast.error(msg);
      return;
    }

    const dbItems = (cart || []).filter(hasValidDbId);
    if (dbItems.length === 0) {
      const msg =
        "Your cart has no database products yet. Add a live catalog product from Home first.";
      setFeedback(msg);
      toast.error(msg);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        shippingAddress,
        currency: (currency || "usd").toLowerCase(),
        items: dbItems.map((item) => ({
          productId: getItemId(item),
          quantity: Number(item.quantity) || 1,
        })),
      };

      const response = await createCheckout(payload);
      const redirectUrl =
        response?.data?.url ??
        response?.data?.data?.url ??
        response?.data?.checkoutUrl ??
        "";

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        const msg =
          response?.data?.message ||
          "Checkout succeeded on server, but no redirect URL was returned.";
        setFeedback(msg);
        toast.error(msg);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not start checkout. Check that you are logged in and your cart has items.";
      setFeedback(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleCheckout}
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl space-y-5"
      >
        <div className="text-center">
          <div className="w-14 h-14 bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-3">
            🔒
          </div>
          <h1 className="text-2xl font-black">Secure Checkout</h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Enter your shipping details to continue to payment.
          </p>
        </div>

        {feedback && (
          <div
            role="alert"
            className="rounded-xl border border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/50 px-4 py-3 text-xs font-semibold text-rose-700 dark:text-rose-300"
          >
            {feedback}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
          <div>
            <label className="block text-xs font-bold mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={address.fullName}
              onChange={handleChange("fullName")}
              placeholder="Jane Doe"
              className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Phone Number *</label>
            <input
              type="tel"
              required
              value={address.phone}
              onChange={handleChange("phone")}
              placeholder="+234 800 000 0000"
              className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div className="text-left">
          <label className="block text-xs font-bold mb-1">Street Address *</label>
          <input
            type="text"
            required
            value={address.street}
            onChange={handleChange("street")}
            placeholder="123 Admiralty Way, Lekki Phase 1"
            className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm outline-none focus:border-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
          <div>
            <label className="block text-xs font-bold mb-1">City *</label>
            <input
              type="text"
              required
              value={address.city}
              onChange={handleChange("city")}
              placeholder="Lagos"
              className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">State / Region</label>
            <input
              type="text"
              value={address.state}
              onChange={handleChange("state")}
              placeholder="Lagos State"
              className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
          <div>
            <label className="block text-xs font-bold mb-1">Postal Code</label>
            <input
              type="text"
              value={address.postalCode}
              onChange={handleChange("postalCode")}
              placeholder="105102"
              className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Country *</label>
            <input
              type="text"
              required
              value={address.country}
              onChange={handleChange("country")}
              placeholder="Nigeria"
              className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl text-sm transition shadow-lg disabled:opacity-70 cursor-pointer"
        >
          {loading ? "Redirecting to Gateway..." : "Proceed to Secure Payment"}
        </button>
      </form>
    </div>
  );
}