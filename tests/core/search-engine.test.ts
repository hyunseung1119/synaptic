import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { search, searchByFile, searchByTag } from "../../src/core/search-engine.js";
import type { DecisionIndex } from "../../src/core/types.js";

const indexPath = join(__dirname, "../fixtures/sample-index.json");
const index: DecisionIndex = JSON.parse(readFileSync(indexPath, "utf-8"));

describe("search", () => {
  it("키워드로 검색한다", () => {
    const results = search(index, { keyword: "Redis" });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].decision.id).toBe("DEC-001");
  });

  it("태그로 검색한다", () => {
    const results = search(index, { tags: ["auth"] });
    expect(results.length).toBe(1);
    expect(results[0].decision.id).toBe("DEC-002");
  });

  it("파일로 검색한다", () => {
    const results = search(index, { files: ["src/auth/jwt.ts"] });
    expect(results.length).toBe(1);
    expect(results[0].decision.id).toBe("DEC-002");
  });

  it("상태로 필터링한다", () => {
    const results = search(index, { status: "accepted" });
    expect(results.length).toBe(3);
  });

  it("존재하지 않는 키워드는 빈 결과", () => {
    const results = search(index, { keyword: "nonexistent-xyz" });
    expect(results.length).toBe(0);
  });

  it("복합 검색: 키워드 + 태그", () => {
    const results = search(index, { keyword: "JWT", tags: ["security"] });
    expect(results.length).toBe(1);
    expect(results[0].decision.id).toBe("DEC-002");
    expect(results[0].score).toBeGreaterThan(10);
  });
});

describe("searchByFile", () => {
  it("파일 경로로 관련 결정을 찾는다", () => {
    const results = searchByFile(index, "redis-client");
    expect(results.length).toBe(1);
    expect(results[0].id).toBe("DEC-001");
  });

  it("매칭 안 되는 경로는 빈 결과", () => {
    const results = searchByFile(index, "nonexistent.ts");
    expect(results.length).toBe(0);
  });
});

describe("searchByTag", () => {
  it("태그로 결정을 찾는다", () => {
    const results = searchByTag(index, "architecture");
    expect(results.length).toBe(2);
  });

  it("대소문자 무시", () => {
    const results = searchByTag(index, "CACHE");
    expect(results.length).toBe(1);
  });
});
