import api from "./api";

export const getRecommendations = () =>
  api.get("/ai/recommendations");

export const semanticSearch = (query) =>
  api.get(`/ai/search?q=${query}`);

// Add this export to fix the Chat.jsx import error
export const askAssistant = (data) =>
  api.post("/ai/assistant", data);