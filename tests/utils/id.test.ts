import { describe, it, expect } from "vitest";
import {
  generateDecisionId,
  parseDecisionId,
  slugify,
  decisionFileName,
} from "../../src/utils/id.js";

describe("generateDecisionId", () => {
  it("기본 prefix로 ID를 생성한다", () => {
    expect(generateDecisionId(1)).toBe("DEC-001");
    expect(generateDecisionId(42)).toBe("DEC-042");
    expect(generateDecisionId(999)).toBe("DEC-999");
  });

  it("커스텀 prefix를 지원한다", () => {
    expect(generateDecisionId(1, "ADR")).toBe("ADR-001");
  });
});

describe("parseDecisionId", () => {
  it("유효한 ID를 파싱한다", () => {
    const result = parseDecisionId("DEC-042");
    expect(result).toEqual({ prefix: "DEC", number: 42 });
  });

  it("잘못된 ID는 null", () => {
    expect(parseDecisionId("invalid")).toBeNull();
    expect(parseDecisionId("dec-001")).toBeNull();
    expect(parseDecisionId("")).toBeNull();
  });
});

describe("slugify", () => {
  it("영문을 슬러그화한다", () => {
    expect(slugify("Redis Cache Layer")).toBe("redis-cache-layer");
  });

  it("한국어를 보존한다", () => {
    expect(slugify("Redis를 캐시로 선택")).toBe("redis를-캐시로-선택");
  });

  it("특수문자를 제거한다", () => {
    expect(slugify("test! @#$ value")).toBe("test-value");
  });

  it("50자로 제한한다", () => {
    const long = "a".repeat(100);
    expect(slugify(long).length).toBeLessThanOrEqual(50);
  });

  it("앞뒤 하이픈을 제거한다", () => {
    expect(slugify("-test-")).toBe("test");
  });
});

describe("decisionFileName", () => {
  it("ID와 제목으로 파일명을 생성한다", () => {
    const name = decisionFileName("DEC-001", "Redis Cache");
    expect(name).toBe("dec-001-redis-cache.md");
  });
});
