const LIVE_BACKEND_ORIGIN = "https://flashxpress-ecommapp-backend.onrender.com";

function cleanUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

export function getBackendOrigin() {
  const envUrl = cleanUrl(
    import.meta.env.VITE_API_ORIGIN ||
      import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_BACKEND_URL ||
      ""
  );

  if (envUrl) {
    return envUrl.replace(/\/api$/i, "");
  }

  return LIVE_BACKEND_ORIGIN;
}

export function getApiBaseUrl() {
  return `${getBackendOrigin()}/api`;
}

export function getGoogleAuthUrl() {
  return `${getBackendOrigin()}/auth/google`;
}