import { Router } from "express";
import { getCurrency } from "../Controllers/currencyApis/Currencycontroller.js";

const r = Router();
r.get("/", getCurrency);
export default r;
