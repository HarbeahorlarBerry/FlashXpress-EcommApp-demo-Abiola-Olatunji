// Ordinary least squares on y = a + b*x with x = 0..n-1
export const linearRegression = (ys) => {
  const n = ys.length;
  if (n < 2) return { slope: 0, intercept: ys[0] || 0, r2: 0 };
  const mx = (n - 1) / 2;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0, ssTot = 0;
  for (let i = 0; i < n; i++) {
    num += (i - mx) * (ys[i] - my);
    den += (i - mx) ** 2;
    ssTot += (ys[i] - my) ** 2;
  }
  const slope = den ? num / den : 0;
  const intercept = my - slope * mx;
  let ssRes = 0;
  for (let i = 0; i < n; i++) ssRes += (ys[i] - (intercept + slope * i)) ** 2;
  return { slope, intercept, r2: ssTot ? Math.max(0, 1 - ssRes / ssTot) : 0 };
};

export const predictAt = (model, x) => model.intercept + model.slope * x;

// Rank-based 1..5 scores (5 = best)
export const quintileScores = (values, higherIsBetter = true) => {
  const n = values.length;
  const scores = new Array(n);
  values
    .map((v, i) => [v, i])
    .sort((a, b) => a[0] - b[0])
    .forEach(([, i], rank) => {
      const q = Math.min(5, Math.floor((rank / n) * 5) + 1);
      scores[i] = higherIsBetter ? q : 6 - q;
    });
  return scores;
};