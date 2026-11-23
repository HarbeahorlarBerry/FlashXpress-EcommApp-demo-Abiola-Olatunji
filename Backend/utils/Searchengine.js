const SYNONYMS = {
  phone: ["mobile", "smartphone", "cellphone", "iphone"], mobile: ["phone", "smartphone"], smartphone: ["phone", "mobile"],
  laptop: ["notebook", "computer", "macbook"], notebook: ["laptop"], computer: ["laptop", "pc"],
  shoes: ["sneakers", "footwear", "trainers"], sneakers: ["shoes", "trainers"], footwear: ["shoes"],
  tv: ["television", "screen"], television: ["tv"], headphones: ["earphones", "earbuds", "headset"],
  earbuds: ["earphones", "headphones"], earphones: ["earbuds", "headphones"], watch: ["smartwatch", "wristwatch"],
  smartwatch: ["watch"], dress: ["gown", "outfit"], bag: ["backpack", "handbag"], backpack: ["bag"],
  sofa: ["couch"], couch: ["sofa"], fridge: ["refrigerator"], refrigerator: ["fridge"], gaming: ["game", "console"],
  makeup: ["cosmetics", "beauty"], cosmetics: ["makeup", "beauty"], tshirt: ["shirt", "tee"], shirt: ["tshirt", "top"],
};

export const tokenize = (q) =>
  String(q || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);

export const expandTokens = (tokens) => [...new Set(tokens.flatMap((t) => [t, ...(SYNONYMS[t] || [])]))];

export const levenshtein = (a, b) => {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
};

// Typo correction against the store's own vocabulary (edit distance <= 2)
export const correctTokens = (tokens, words) => {
  let changed = false;
  const out = tokens.map((t) => {
    if (t.length < 4 || words.has(t) || SYNONYMS[t]) return t;
    let best = t, bestDist = 3;
    for (const w of words) {
      if (Math.abs(w.length - t.length) > 2) continue;
      const d = levenshtein(t, w);
      if (d < bestDist) { bestDist = d; best = w; }
    }
    if (best !== t) changed = true;
    return best;
  });
  return { tokens: out, changed };
};

let vocab = { words: new Set(), at: 0 };
export const getVocabulary = async (Product) => {
  if (vocab.words.size && Date.now() - vocab.at < 10 * 60 * 1000) return vocab.words;
  const docs = await Product.find({ isActive: true }, "name category").limit(3000).lean();
  const words = new Set();
  docs.forEach((d) => [...tokenize(d.name), ...tokenize(d.category)].forEach((w) => words.add(w)));
  vocab = { words, at: Date.now() };
  return words;
};

export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Relevant products for free text (used by the shopping assistant)
export const matchProducts = async (Product, text, limit = 6) => {
  const expanded = expandTokens(tokenize(text));
  let found = [];
  if (expanded.length) {
    found = await Product.find(
      { isActive: true, stock: { $gt: 0 }, $text: { $search: expanded.join(" ") } },
      { score: { $meta: "textScore" }, reviews: 0 }
    ).sort({ score: { $meta: "textScore" } }).limit(limit).lean();
  }
  if (!found.length) {
    found = await Product.find({ isActive: true, stock: { $gt: 0 } }, { reviews: 0 })
      .sort({ averageRating: -1, soldCount: -1 }).limit(limit).lean();
  }
  return found;
};