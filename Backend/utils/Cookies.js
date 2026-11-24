// utils/Cookies.js
const isProd = process.env.NODE_ENV === "production";
const useCrossSiteHttps =
  isProd && process.env.COOKIE_SECURE !== "false";

export const cookieOptions = {
  httpOnly: true,
  secure: useCrossSiteHttps,
  sameSite: useCrossSiteHttps ? "none" : "lax",
  path: "/",
  maxAge: 5 * 60 * 60 * 1000,
};

export const setAuthCookie = (res, token) =>
  res.cookie("token", token, cookieOptions);

export const clearAuthCookie = (res) => {
  const { maxAge, ...opts } = cookieOptions;
  res.clearCookie("token", opts);
};