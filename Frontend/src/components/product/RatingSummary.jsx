export default function RatingSummary({ reviews = [] }) {
  if (!reviews.length) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
        <h2 className="font-bold text-lg mb-2">Ratings & Reviews</h2>
        <p className="text-xs text-gray-500">No reviews yet</p>
      </div>
    );
  }

  const totalReviews = reviews.length;
  const averageRating = (
    reviews.reduce((sum, item) => sum + item.rating, 0) / totalReviews
  ).toFixed(1);

  const countStars = (star) => reviews.filter((item) => item.rating === star).length;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
      <h2 className="text-lg font-bold mb-4">Ratings & Reviews</h2>
      <div className="flex items-center gap-4 mb-6">
        <span className="text-4xl font-black text-orange-600">{averageRating}</span>
        <div>
          <p className="font-semibold text-sm">{totalReviews} Verified Reviews</p>
          <p className="text-xs text-gray-500">Based on customer purchases</p>
        </div>
      </div>

      {[5, 4, 3, 2, 1].map((star) => {
        const count = countStars(star);
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

        return (
          <div key={star} className="flex items-center gap-3 mb-2 text-xs font-semibold">
            <span className="w-8">{star} ★</span>
            <div className="flex-1 bg-gray-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
            </div>
            <span className="w-6 text-right text-gray-500">{count}</span>
          </div>
        );
      })}
    </div>
  );
}