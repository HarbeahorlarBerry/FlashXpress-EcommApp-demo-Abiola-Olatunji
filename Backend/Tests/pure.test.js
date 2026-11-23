import { describe, expect, test } from "@jest/globals";
import { linearRegression, predictAt, quintileScores } from "../utils/mlMath.js";
import { correctTokens, expandTokens, levenshtein, tokenize } from "../utils/searchEngine.js";

describe("mlMath", () => {
  test("linear regression recovers a perfect line", () => {
    const m = linearRegression([2, 4, 6, 8, 10]);
    expect(m.slope).toBeCloseTo(2);
    expect(m.intercept).toBeCloseTo(2);
    expect(m.r2).toBeCloseTo(1);
    expect(predictAt(m, 5)).toBeCloseTo(12);
  });
  test("flat data has zero slope", () => {
    expect(linearRegression([5, 5, 5, 5]).slope).toBe(0);
  });
  test("quintile scores rank best as 5", () => {
    const s = quintileScores([1, 2, 3, 4, 5]);
    expect(s).toEqual([1, 2, 3, 4, 5]);
    expect(quintileScores([1, 2, 3, 4, 5], false)).toEqual([5, 4, 3, 2, 1]);
  });
});

describe("searchEngine", () => {
  test("tokenize strips punctuation and lowercases", () => {
    expect(tokenize("  Red SHOES!! ")).toEqual(["red", "shoes"]);
  });
  test("synonyms expand a query", () => {
    expect(expandTokens(["phone"])).toEqual(expect.arrayContaining(["phone", "mobile", "smartphone"]));
  });
  test("levenshtein distance", () => {
    expect(levenshtein("kitten", "sitting")).toBe(3);
    expect(levenshtein("same", "same")).toBe(0);
  });
  test("typos are corrected against the vocabulary, known words are left alone", () => {
    const words = new Set(["laptop", "charger", "wireless"]);
    expect(correctTokens(["lapto", "charger"], words)).toEqual({ tokens: ["laptop", "charger"], changed: true });
    expect(correctTokens(["wireless"], words).changed).toBe(false);
  });
});
