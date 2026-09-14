/**
 * Returns the resolved base site URL across any environment (Vercel, custom domain, local, staging).
 * Prioritizes production domain (VERCEL_PROJECT_PRODUCTION_URL or NEXT_PUBLIC_SITE_URL) over temporary deployment hashes
 * so sitemaps and canonical metadata match the exact production host for Google Search Console compliance.
 */
export function getSiteUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VITE_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined) ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  let rawUrl = envUrl || "https://promptpirates.vercel.app";

  if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
    rawUrl = `https://${rawUrl}`;
  }

  return rawUrl.replace(/\/$/, "");
}
