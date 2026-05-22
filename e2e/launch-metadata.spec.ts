import { expect, test } from "./fixtures";

test("Gate 31 launch metadata endpoints are available", async ({ request }) => {
  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBeTruthy();
  const manifestJson = await manifest.json();
  expect(manifestJson.name).toBe("爱上背单词");
  expect(manifestJson.display).toBe("standalone");
  expect(manifestJson.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ src: "/icon.svg", purpose: "any" }),
      expect.objectContaining({ src: "/icon-maskable.svg", purpose: "maskable" })
    ])
  );

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain("Sitemap: https://aishang-vocab.app/sitemap.xml");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain("https://aishang-vocab.app/dashboard");
  expect(sitemapText).toContain("https://aishang-vocab.app/leaderboard");
});
