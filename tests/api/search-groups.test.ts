import { describe, it, expect } from "bun:test";
import { search, suggest } from "../../src/lib/search";
import { getUniversitiesInGroup, getGroupsForUniversity, isUniversityGroup } from "../../src/lib/groups";

describe("University Groups (大学群) search", () => {
  it("recognizes canonical groups and aliases", () => {
    expect(isUniversityGroup("MARCH")).toBe(true);
    expect(isUniversityGroup("マーチ")).toBe(true);
    expect(isUniversityGroup("march")).toBe(true);
    expect(isUniversityGroup("早慶")).toBe(true);
    expect(isUniversityGroup("日東駒専")).toBe(true);
    expect(isUniversityGroup("関関同立")).toBe(true);
    expect(isUniversityGroup("旧帝大")).toBe(true);
    expect(isUniversityGroup("5S")).toBe(true);
    expect(isUniversityGroup("STARS")).toBe(true);
  });

  it("searches MARCH universities and returns Meiji, Aoyama, Rikkyo, Chuo, Hosei", () => {
    const marchRes = search({ q: "MARCH", page: 1, limit: 1000 });
    expect(marchRes.total).toBeGreaterThan(0);
    const univs = new Set(marchRes.results.map((r) => r.university));
    expect(univs.has("明治大学")).toBe(true);
    expect(univs.has("青山学院大学")).toBe(true);
    expect(univs.has("立教大学")).toBe(true);
    expect(univs.has("中央大学")).toBe(true);
    expect(univs.has("法政大学")).toBe(true);
    // Should not contain unrelated university
    expect(univs.has("早稲田大学")).toBe(false);
  });

  it("searches katakana マーチ with identical group results", () => {
    const katakanaRes = search({ q: "マーチ", page: 1, limit: 1000 });
    expect(katakanaRes.total).toBeGreaterThan(0);
    const univs = new Set(katakanaRes.results.map((r) => r.university));
    expect(univs.has("明治大学")).toBe(true);
    expect(univs.has("青山学院大学")).toBe(true);
    expect(univs.has("立教大学")).toBe(true);
    expect(univs.has("中央大学")).toBe(true);
    expect(univs.has("法政大学")).toBe(true);
  });

  it("handles multi-keyword queries with group, e.g. MARCH 法学部", () => {
    const res = search({ q: "MARCH 法学部", page: 1, limit: 100 });
    expect(res.total).toBeGreaterThan(0);
    for (const r of res.results) {
      expect(["明治大学", "青山学院大学", "立教大学", "中央大学", "法政大学"]).toContain(r.university);
      expect(r.faculty).toContain("法");
    }
  });

  it("searches 早慶 and returns Waseda and Keio", () => {
    const res = search({ q: "早慶", page: 1, limit: 50 });
    expect(res.total).toBeGreaterThan(0);
    const univs = new Set(res.results.map((r) => r.university));
    expect(univs.has("早稲田大学")).toBe(true);
    expect(univs.has("慶應義塾大学")).toBe(true);
    expect(univs.has("明治大学")).toBe(false);
  });

  it("searches 旧帝大 and returns imperial universities", () => {
    const res = search({ q: "旧帝大", page: 1, limit: 300 });
    expect(res.total).toBeGreaterThan(0);
    const univs = new Set(res.results.map((r) => r.university));
    expect(univs.has("東京大学")).toBe(true);
    expect(univs.has("京都大学")).toBe(true);
    expect(univs.has("大阪大学")).toBe(true);
    expect(univs.has("名古屋大学")).toBe(true);
    expect(univs.has("東北大学")).toBe(true);
    expect(univs.has("九州大学")).toBe(true);
    expect(univs.has("北海道大学")).toBe(true);
  });

  it("suggests member universities when group query is passed to suggest()", () => {
    const marchSuggestions = suggest("MARCH");
    expect(marchSuggestions).toContain("明治大学");
    expect(marchSuggestions).toContain("青山学院大学");
  });

  it("reverse lookups groups for a university", () => {
    const wasedaGroups = getGroupsForUniversity("早稲田大学");
    expect(wasedaGroups).toContain("早慶");
    expect(wasedaGroups).toContain("早慶上理");

    const meijiGroups = getGroupsForUniversity("明治大学");
    expect(meijiGroups).toContain("MARCH");
    expect(meijiGroups).toContain("GMARCH");
  });
});
