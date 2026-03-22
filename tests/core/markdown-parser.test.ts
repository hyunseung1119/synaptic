import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseDecisionMarkdown, serializeDecision } from "../../src/core/markdown-parser.js";

const samplePath = join(__dirname, "../fixtures/sample-decision.md");
const sampleContent = readFileSync(samplePath, "utf-8");

describe("parseDecisionMarkdown", () => {
  it("frontmatter를 올바르게 파싱한다", () => {
    const result = parseDecisionMarkdown(sampleContent);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.id).toBe("DEC-001");
    expect(result.value.title).toBe("Redis를 캐시 레이어로 선택");
    expect(result.value.date).toBe("2026-03-22");
    expect(result.value.status).toBe("accepted");
    expect(result.value.tags).toEqual(["cache", "infrastructure", "performance"]);
    expect(result.value.files).toEqual(["src/cache/redis-client.ts", "src/config/redis.ts"]);
    expect(result.value.related).toEqual(["DEC-002"]);
  });

  it("본문 섹션을 올바르게 추출한다", () => {
    const result = parseDecisionMarkdown(sampleContent);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.context).toContain("초당 10,000건");
    expect(result.value.decision).toContain("Redis를 메인 캐시 레이어로");
    expect(result.value.consequences).toContain("100K+ ops/sec");
  });

  it("대안을 올바르게 파싱한다", () => {
    const result = parseDecisionMarkdown(sampleContent);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.alternatives).toHaveLength(2);
    expect(result.value.alternatives[0].name).toBe("Memcached");
    expect(result.value.alternatives[0].reason).toContain("클러스터링");
    expect(result.value.alternatives[1].name).toBe("PostgreSQL Materialized View");
  });

  it("빈 문자열에서 에러를 반환한다", () => {
    const result = parseDecisionMarkdown("");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.id).toBe("");
  });

  it("잘못된 YAML에서 에러를 반환한다", () => {
    const result = parseDecisionMarkdown("---\n: invalid:\n---\nbody");
    expect(result.ok).toBe(false);
  });
});

describe("serializeDecision", () => {
  it("Decision을 마크다운으로 직렬화한다", () => {
    const result = parseDecisionMarkdown(sampleContent);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const serialized = serializeDecision(result.value);

    expect(serialized).toContain("id: DEC-001");
    expect(serialized).toContain("title: Redis를 캐시 레이어로 선택");
    expect(serialized).toContain("## Context");
    expect(serialized).toContain("## Decision");
    expect(serialized).toContain("## Alternatives");
    expect(serialized).toContain("### Memcached");
  });

  it("라운드트립: 파싱 → 직렬화 → 재파싱 시 동일한 데이터", () => {
    const parsed = parseDecisionMarkdown(sampleContent);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const serialized = serializeDecision(parsed.value);
    const reparsed = parseDecisionMarkdown(serialized);
    expect(reparsed.ok).toBe(true);
    if (!reparsed.ok) return;

    expect(reparsed.value.id).toBe(parsed.value.id);
    expect(reparsed.value.title).toBe(parsed.value.title);
    expect(reparsed.value.tags).toEqual(parsed.value.tags);
    expect(reparsed.value.alternatives).toHaveLength(parsed.value.alternatives.length);
  });
});
