import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { metadata, viewport } from "./layout";
import manifest from "./manifest";
import robots from "./robots";
import sitemap from "./sitemap";

const siteUrl = "https://aishang-vocab.app";

describe("launch metadata", () => {
  it("exports product metadata for install, sharing, and mobile viewport", () => {
    expect(metadata.applicationName).toBe("爱上背单词");
    expect(metadata.metadataBase?.toString()).toBe(`${siteUrl}/`);
    expect(metadata.title).toEqual({
      default: "爱上背单词",
      template: "%s · 爱上背单词"
    });
    expect(metadata.description).toBe("AI 陪伴式 K12 背单词应用，覆盖刷词、SRS 复习、AI 故事、PK、OCR 和家长周报。");
    expect(metadata.manifest).toBe("/manifest.webmanifest");
    expect(metadata.openGraph).toMatchObject({
      title: "爱上背单词",
      siteName: "爱上背单词",
      locale: "zh_CN",
      type: "website",
      url: siteUrl
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "爱上背单词"
    });
    expect(viewport).toMatchObject({
      width: "device-width",
      initialScale: 1,
      maximumScale: 1
    });
  });

  it("defines a standalone PWA manifest with maskable and apple icons", () => {
    const data = manifest();

    expect(data).toMatchObject({
      name: "爱上背单词",
      short_name: "背单词",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#F4F1FF",
      theme_color: "#6C5CE7"
    });
    expect(data.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }),
        expect.objectContaining({ src: "/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" })
      ])
    );

    for (const icon of ["icon.svg", "icon-maskable.svg", "apple-icon.svg"]) {
      const path = join(process.cwd(), "public", icon);
      expect(existsSync(path)).toBe(true);
      expect(readFileSync(path, "utf8")).toContain("<svg");
    }
  });

  it("allows indexing and lists canonical launch routes in sitemap", () => {
    expect(robots()).toMatchObject({
      rules: { userAgent: "*", allow: "/" },
      sitemap: `${siteUrl}/sitemap.xml`,
      host: siteUrl
    });

    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toEqual(
      expect.arrayContaining([
        siteUrl,
        `${siteUrl}/dashboard`,
        `${siteUrl}/study`,
        `${siteUrl}/review`,
        `${siteUrl}/dictionary`,
        `${siteUrl}/leaderboard`,
        `${siteUrl}/parent`,
        `${siteUrl}/pro`
      ])
    );
  });
});
