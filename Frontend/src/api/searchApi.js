import api from "./api";


export const searchProducts =
  (params) =>
    api.get(
      "/search",
      {
        params,
      }
    );


export const getTrending =
  () =>
    api.get(
      "/search/trending"
    );


export const getSuggestions =
  (query) =>
    api.get(
      `/search/suggestions?q=${query}`
    );