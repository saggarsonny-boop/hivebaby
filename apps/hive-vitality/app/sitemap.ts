import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://vitality.hive.baby";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: APP_URL,                     lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${APP_URL}/ritual`,         lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${APP_URL}/reflection`,     lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${APP_URL}/check-in`,       lastModified: now, changeFrequency: "weekly", priority: 0.6 },
  ];
}
