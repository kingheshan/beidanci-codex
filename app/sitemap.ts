import type { MetadataRoute } from "next";

const siteUrl = "https://aishang-vocab.app";
const lastModified = new Date("2026-05-20T00:00:00.000+08:00");

const routes = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/dashboard", priority: 0.95, changeFrequency: "daily" },
  { path: "/study", priority: 0.9, changeFrequency: "daily" },
  { path: "/review", priority: 0.9, changeFrequency: "daily" },
  { path: "/dictionary", priority: 0.86, changeFrequency: "weekly" },
  { path: "/leaderboard", priority: 0.8, changeFrequency: "daily" },
  { path: "/story", priority: 0.78, changeFrequency: "daily" },
  { path: "/mistakes", priority: 0.76, changeFrequency: "weekly" },
  { path: "/camera", priority: 0.72, changeFrequency: "weekly" },
  { path: "/pro", priority: 0.7, changeFrequency: "monthly" },
  { path: "/parent", priority: 0.68, changeFrequency: "weekly" },
  { path: "/me", priority: 0.65, changeFrequency: "weekly" },
  { path: "/settings", priority: 0.55, changeFrequency: "monthly" }
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));
}
