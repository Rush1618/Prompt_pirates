/**
 * Returns the resolved base site URL across any environment (Vercel, custom domain, local, staging).
 * Safely strips trailing slashes and handles VERCEL_URL automatically.
 */
export function getSiteUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VITE_SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  let rawUrl = envUrl || "https://prompt-pirates.vercel.app";

  if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
    rawUrl = `https://${rawUrl}`;
  }

  return rawUrl.replace(/\/$/, "");
}
