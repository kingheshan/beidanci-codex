import { describe, expect, it } from "vitest";
import { getActiveWordbook, getWordbook, getWordbookWords, listWordbooks } from "./wordbooks";

describe("wordbooks", () => {
  it("exposes the requested real-study wordbook catalogs", () => {
    expect(listWordbooks().map((book) => book.id)).toEqual([
      "primary",
      "zhongkao-1600",
      "gaokao-3500",
      "ielts",
      "toefl",
      "new-concept"
    ]);
    expect(getActiveWordbook("zhongkao-1600")).toMatchObject({ title: "中考 1600", total: 1600 });
    expect(getActiveWordbook("unknown")).toMatchObject({ id: "zhongkao-1600" });
  });

  it("returns searchable words for each catalog", () => {
    expect(getWordbookWords("primary").some((word) => word.word === "apple")).toBe(true);
    expect(getWordbookWords("zhongkao-1600").some((word) => word.word === "environment")).toBe(true);
    expect(getWordbookWords("gaokao-3500").some((word) => word.word === "phenomenon")).toBe(true);
    expect(getWordbookWords("ielts").some((word) => word.word === "sustainable")).toBe(true);
    expect(getWordbookWords("toefl").some((word) => word.word === "hypothesis")).toBe(true);
    expect(getWordbookWords("new-concept").some((word) => word.word === "detective")).toBe(true);
  });

  it("loads every catalog as a full wordbook instead of a preview seed list", () => {
    for (const book of listWordbooks()) {
      expect(getWordbookWords(book.id)).toHaveLength(book.total);
    }
  });

  it("keeps book metadata and word tags aligned", () => {
    const book = getWordbook("ielts");
    const words = getWordbookWords("ielts");

    expect(book).toBeDefined();
    expect(words.length).toBeGreaterThanOrEqual(8);
    expect(words.every((word) => word.tags.some((tag) => tag.includes("雅思")))).toBe(true);
  });
});
