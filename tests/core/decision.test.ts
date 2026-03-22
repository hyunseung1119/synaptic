import { describe, it, expect } from "vitest";
import { createDecision, validateDecision, updateDecision } from "../../src/core/decision.js";

describe("createDecision", () => {
  const validInput = {
    title: "Redis를 캐시 레이어로 선택",
    date: "2026-03-22",
    status: "accepted" as const,
    context: "읽기 성능 개선 필요",
    decision: "Redis 사용",
    consequences: "성능 향상, 인프라 추가",
    alternatives: [{ name: "Memcached", reason: "클러스터링 부족" }],
    tags: ["cache"],
    files: ["src/cache/redis.ts"],
    related: [],
  };

  it("유효한 입력으로 Decision을 생성한다", () => {
    const result = createDecision(validInput, 1);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.id).toBe("DEC-001");
    expect(result.value.title).toBe("Redis를 캐시 레이어로 선택");
  });

  it("ID를 순번에 맞게 생성한다", () => {
    const result = createDecision(validInput, 42);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.id).toBe("DEC-042");
  });

  it("커스텀 prefix를 지원한다", () => {
    const result = createDecision(validInput, 1, "ADR");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.id).toBe("ADR-001");
  });
});

describe("validateDecision", () => {
  it("유효한 Decision은 통과한다", () => {
    const result = validateDecision({
      id: "DEC-001",
      title: "Test",
      date: "2026-03-22",
      status: "accepted",
      context: "",
      decision: "",
      consequences: "",
      alternatives: [],
      tags: [],
      files: [],
      related: [],
    });
    expect(result.ok).toBe(true);
  });

  it("빈 id는 실패한다", () => {
    const result = validateDecision({
      id: "",
      title: "Test",
      date: "2026-03-22",
      status: "accepted",
      context: "",
      decision: "",
      consequences: "",
      alternatives: [],
      tags: [],
      files: [],
      related: [],
    });
    expect(result.ok).toBe(false);
  });

  it("잘못된 날짜 형식은 실패한다", () => {
    const result = validateDecision({
      id: "DEC-001",
      title: "Test",
      date: "2026/03/22",
      status: "accepted",
      context: "",
      decision: "",
      consequences: "",
      alternatives: [],
      tags: [],
      files: [],
      related: [],
    });
    expect(result.ok).toBe(false);
  });
});

describe("updateDecision", () => {
  const base = {
    id: "DEC-001",
    title: "Original",
    date: "2026-03-22",
    status: "accepted" as const,
    context: "",
    decision: "",
    consequences: "",
    alternatives: [],
    tags: ["old"],
    files: [],
    related: [],
  };

  it("부분 업데이트가 동작한다", () => {
    const result = updateDecision(base, { title: "Updated", tags: ["new"] });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.title).toBe("Updated");
    expect(result.value.tags).toEqual(["new"]);
    expect(result.value.id).toBe("DEC-001");
  });
});
