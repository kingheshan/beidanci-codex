import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "爱上背单词",
    short_name: "背单词",
    description: "AI 陪伴式 K12 背单词应用，覆盖刷词、SRS 复习、AI 故事、PK、OCR 和家长周报。",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#F4F1FF",
    theme_color: "#6C5CE7",
    categories: ["education", "kids", "productivity"],
    lang: "zh-CN",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ]
  };
}
