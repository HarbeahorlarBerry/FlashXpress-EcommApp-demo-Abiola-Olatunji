import Product from "../../Models/productSchema.js";
import SearchQuery from "../../Models/Searchqueryschema.js";
import { tokenize, expandTokens, correctTokens, getVocabulary, escapeRegex } from "../../utils/Searchengine.js";

const SORTS = {
  newest: { createdAt: -1 }, priceAsc: { price: 1 }, priceDesc: { price: -1 },
  rating: { averageRating: -1, reviewCount: -1 }, popular: { soldCount: -1 },
};

// GET /api/search?q=&category=&minPrice=&maxPrice=&minRating=&inStock=&sort=&page=&limit=
// Typo-tolerant, synonym-aware product search.
export const search = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, minRating, inStock, sort } = req.query;
    const raw = String(req.query.q || "").trim().slice(0, 100);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 12));

    const filter = { isActive: true };
    if (category) filter.category = String(category).toLowerCase();
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minRating) filter.averageRating = { $gte: Number(minRating) };
    if (inStock === "true") filter.stock = { $gt: 0 };

    let correctedQuery = null;
    let expandedTerms = [];
    let useText = false;

    if (raw) {
      const words = await getVocabulary(Product);
      let tokens = tokenize(raw);
      const fix = correctTokens(tokens, words);
      if (fix.changed) {
        tokens = fix.tokens;
        correctedQuery = tokens.join(" ");
      }
      expandedTerms = expandTokens(tokens);
      if (expandedTerms.length) {
        filter.$text = { $search: expandedTerms.join(" ") };
        useText = true;
      }
    }

    const run = async (f, text) => {
      const projection = text ? { reviews: 0, score: { $meta: "textScore" } } : { reviews: 0 };
      const order = SORTS[sort] || (text ? { score: { $meta: "textScore" } } : SORTS.newest);
      return Promise.all([
        Product.find(f, projection).sort(order).skip((page - 1) * limit).limit(limit).populate("userId", "username").lean(),
        Product.countDocuments(f),
      ]);
    };

    let [products, total] = await run(filter, useText);

    // Nothing matched by words: fall back to partial matching (e.g. "sneak" -> sneakers)
    if (raw && total === 0 && expandedTerms.length) {
      const rx = new RegExp(expandedTerms.map(escapeRegex).join("|"), "i");
      const loose = { ...filter, $or: [{ name: rx }, { category: rx }, { description: rx }] };
      delete loose.$text;
      [products, total] = await run(loose, false);
    }

    if (raw) {
      try {
        await SearchQuery.create({ q: (correctedQuery || raw).toLowerCase(), results: total });
      } catch (error) {
        console.error("Search log failed:", error.message); // analytics must never break search
      }
    }

    return res.status(200).json({
      status: "success", total, page, pages: Math.ceil(total / limit), products, correctedQuery, expandedTerms,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/search/trending
export const trending = async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [queries, categories] = await Promise.all([
      SearchQuery.aggregate([
        { $match: { createdAt: { $gte: since }, results: { $gt: 0 } } },
        { $group: { _id: "$q", count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 8 },
      ]),
      Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$category", sold: { $sum: "$soldCount" }, count: { $sum: 1 } } },
        { $sort: { sold: -1, count: -1 } }, { $limit: 6 },
      ]),
    ]);
    return res.status(200).json({
      status: "success",
      queries: queries.map((q) => ({ q: q._id, count: q.count })),
      categories: categories.map((c) => c._id),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/search/suggestions?q=
export const suggestions = async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim().toLowerCase().slice(0, 50);
    if (q.length < 2) return res.status(200).json({ status: "success", suggestions: [] });

    const rx = new RegExp("^" + escapeRegex(q), "i");
    const [names, cats, past] = await Promise.all([
      Product.find({ isActive: true, name: rx }, "name").limit(5).lean(),
      Product.distinct("category", { isActive: true, category: rx }),
      SearchQuery.aggregate([
        { $match: { q: rx, results: { $gt: 0 } } },
        { $group: { _id: "$q", c: { $sum: 1 } } }, { $sort: { c: -1 } }, { $limit: 3 },
      ]),
    ]);

    const seen = new Set();
    const out = [];
    const push = (text, type) => {
      const k = text.toLowerCase();
      if (!seen.has(k) && out.length < 8) { seen.add(k); out.push({ text, type }); }
    };
    names.forEach((n) => push(n.name, "product"));
    cats.slice(0, 3).forEach((c) => push(c, "category"));
    past.forEach((p) => push(p._id, "popular"));
    return res.status(200).json({ status: "success", suggestions: out });
  } catch (error) {
    next(error);
  }
};