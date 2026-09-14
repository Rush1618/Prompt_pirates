import { MetadataRoute } from "next";
import { GHOST_BLOG_POSTS } from "@/lib/blogs";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes = [
    { url: "", priority: 1.0, changeFrequency: "daily" as const },
    { url: "/compose", priority: 0.9, changeFrequency: "weekly" as const },
    { url: "/inspect", priority: 0.9, changeFrequency: "weekly" as const },
    { url: "/identity", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/stego", priority: 0.8, changeFrequency: "weekly" as const },
    { url: "/attack-lab", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/cracker", priority: 0.7, changeFrequency: "monthly" as const },
    { url: "/threat", priority: 0.7, changeFrequency: "daily" as const },
    { url: "/audit", priority: 0.7, changeFrequency: "daily" as const },
    { url: "/blog", priority: 0.9, changeFrequency: "daily" as const },
  ];

  const blogRoutes = GHOST_BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const staticEntries = staticRoutes.map((r) => ({
    url: `${baseUrl}${r.url}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  return [...staticEntries, ...blogRoutes];
}
