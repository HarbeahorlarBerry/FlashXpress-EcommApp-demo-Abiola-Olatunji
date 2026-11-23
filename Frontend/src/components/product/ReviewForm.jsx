import { useState } from "react";
import { addReview } from "../../api/productApi";
import { eventBus } from "../../core/eventBus";

function ReviewForm({ productId, onReviewAdded }) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!review.trim()) return setError("Please enter a review");
    setBusy(true);
    setError("");
    try {
      await addReview(productId, { rating: Number(rating), review });
      eventBus.emit("review_created", { rating: Number(rating), review });
      setReview("");
      setRating(5);
      if (onReviewAdded) await onReviewAdded();
    } catch (err) {
      // e.g. "Only customers who bought this product can review it"
      setError(err.response?.data?.message || "Could not submit your review");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card mt-10 space-y-4 p-6">
      <h2 className="text-2xl font-bold">Leave a review</h2>
      <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="input !w-auto">
        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"⭐".repeat(n)}</option>)}
      </select>
      <textarea value={review} onChange={(e) => setReview(e.target.value)} placeholder="Write your review..." className="input" rows={4} maxLength={1000} required />
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary">{busy ? "Submitting..." : "Submit review"}</button>
      <p className="text-xs text-gray-500">Only customers who bought this product can review it.</p>
    </form>
  );
}

export default ReviewForm;