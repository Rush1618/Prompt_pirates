/**
 * Returns the resolved base site URL across any environment.
 * Uses NEXT_PUBLIC_SITE_URL or SITE_URL or VERCEL_PROJECT_PRODUCTION_URL,
 * defaulting to the production domain https://promptpirates.vercel.app.
 * Ignores VERCEL_URL preview hashes so sitemap.xml always matches Search Console domain.
 */
export function getSiteUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VITE_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined);

  let rawUrl = envUrl || "https://promptpirates.vercel.app";

  if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
    rawUrl = `https://${rawUrl}`;
  }

  return rawUrl.replace(/\/$/, "");
}
