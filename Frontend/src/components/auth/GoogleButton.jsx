import { getGoogleAuthUrl } from "../utils/apiOrigin";

export default function GoogleButton() {
  const googleLoginUrl = getGoogleAuthUrl();

  return (
    <a
      href={googleLoginUrl}
      className="flex items-center justify-center gap-3 w-full bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 font-bold py-3.5 px-4 rounded-xl text-sm transition shadow-sm"
    >
      <span className="text-lg">🌐</span>
      <span>Continue with Google</span>
    </a>
  );
}