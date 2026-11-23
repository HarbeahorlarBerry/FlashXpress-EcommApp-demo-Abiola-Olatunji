import { getRates } from "../../utils/Currency.js";

// GET /api/currency  ->  { base, rates, chargeable, stale, updatedAt }
export const getCurrency = async (req, res, next) => {
  try {
    return res.status(200).json({ status: "success", ...(await getRates()) });
  } catch (error) {
    next(error);
  }
};
