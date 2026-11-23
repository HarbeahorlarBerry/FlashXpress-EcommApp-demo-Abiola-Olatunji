import { Router } from "express";
import { search, trending, suggestions } from "../Controllers/searchApis/Searchcontroller.js";

const r = Router();
r.get("/", search);
r.get("/trending", trending);
r.get("/suggestions", suggestions);
export default r;