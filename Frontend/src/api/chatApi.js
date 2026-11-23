import api from "./api"; // Adjust this import if your axios instance is named differently (e.g., import api from './api')

export const listConversations = () => api.get("/chat/conversations");

export const getMessages = (conversationId) => api.get(`/chat/messages/${conversationId}`);

export const sendMessage = (data) => api.post("/chat/messages", data);