const LIVE_CLIENT_URL = "https://aliexpress-ecommapp-demo-abiola-olatunji.onrender.com";
const CLIENT_URL = String(process.env.CLIENT_URL || LIVE_CLIENT_URL).replace(/\/+$/, "");

// Lists the 5 supported continue options (no passkey)
export const listContinueProviders = (req, res) => {
  return res.json({
    status: "success",
    passkeyEnabled: false,
    providers: [
      { id: "email", label: "Email / Gmail OTP", mode: "otp-register-login" },
      {
        id: "google",
        label: "Google",
        mode: "oauth",
        authUrl: "/auth/google",
        configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      },
      {
        id: "facebook",
        label: "Facebook",
        mode: "oauth",
        authUrl: "/api/auth/oauth/facebook",
        configured: Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
      },
      {
        id: "apple",
        label: "Apple",
        mode: "oauth",
        authUrl: "/api/auth/oauth/apple",
        configured: Boolean(process.env.APPLE_CLIENT_ID),
      },
      {
        id: "x",
        label: "X",
        mode: "oauth",
        authUrl: "/api/auth/oauth/x",
        configured: Boolean(process.env.X_CLIENT_ID && process.env.X_CLIENT_SECRET),
      },
    ],
  });
};

// Placeholder OAuth redirect handlers for Facebook, Apple, X until provider credentials are configured
export const startSocialOAuth = (provider) => (req, res) => {
  return res.redirect(`${CLIENT_URL}/login?error=provider_not_configured&provider=${provider}`);
};