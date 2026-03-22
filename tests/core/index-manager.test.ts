import { describe, it, expect } from "vitest";
import {
  createEmptyIndex,
  addToIndex,
  removeFromIndex,
  addEdge,
  getNextNumber,
} from "../../src/core/index-manager.js";
import type { Decision } from "../../src/core/types.js";

const sampleDecision: Decision = {
  id: "DEC-001",
  title: "Test Decision",
  date: "2026-03-22",
  status: "accepted",
  context: "test context",
  decision: "test decision",
  consequences: "test consequences",
  alternatives: [],
  tags: ["test"],
  files: ["src/test.ts"],
  related: [],
};

describe("createEmptyIndex", () => {
  it("빈 인덱스를 생성한다", () => {
    const index = createEmptyIndex();
    expect(index.version).toBe(1);
    expect(index.decisions).toHaveLength(0);
    expect(index.edges).toHaveLength(0);
  });
});

describe("addToIndex", () => {
  it("Decision을 인덱스에 추가한다", () => {
    const index = createEmptyIndex();
    const updated = addToIndex(index, sampleDecision, ".synaptic/decisions/dec-001.md");

    expect(updated.decisions).toHaveLength(1);
    expect(updated.decisions[0].id).toBe("DEC-001");
    expect(updated.decisions[0].filePath).toBe(".synaptic/decisions/dec-001.md");
  });

  it("같은 ID의 Decision을 덮어쓴다", () => {
    const index = createEmptyIndex();
    const first = addToIndex(index, sampleDecision, "path1.md");
    const second = addToIndex(
      first,
      { ...sampleDecision, title: "Updated" },
      "path2.md"
    );

    expect(second.decisions).toHaveLength(1);
    expect(second.decisions[0].title).toBe("Updated");
  });
});

describe("removeFromIndex", () => {
  it("Decision을 인덱스에서 제거한다", () => {
    let index = createEmptyIndex();
    index = addToIndex(index, sampleDecision, "path.md");
    const removed = removeFromIndex(index, "DEC-001");

    expect(removed.decisions).toHaveLength(0);
  });

  it("관련 엣지도 함께 제거한다", () => {
    let index = createEmptyIndex();
    index = addToIndex(index, sampleDecision, "path.md");
    index = addEdge(index, { from: "DEC-001", to: "DEC-002", relation: "related-to" });
    const removed = removeFromIndex(index, "DEC-001");

    expect(removed.edges).toHaveLength(0);
  });
});

describe("addEdge", () => {
  it("엣지를 추가한다", () => {
    const index = createEmptyIndex();
    const updated = addEdge(index, { from: "DEC-001", to: "DEC-002", relation: "depends-on" });
    expect(updated.edges).toHaveLength(1);
  });

  it("중복 엣지는 추가하지 않는다", () => {
    const index = createEmptyIndex();
    const edge = { from: "DEC-001", to: "DEC-002", relation: "depends-on" as const };
    const first = addEdge(index, edge);
    const second = addEdge(first, edge);
    expect(second.edges).toHaveLength(1);
  });
});

describe("getNextNumber", () => {
  it("빈 인덱스에서 1을 반환한다", () => {
    const index = createEmptyIndex();
    expect(getNextNumber(index)).toBe(1);
  });

  it("기존 Decision 이후 번호를 반환한다", () => {
    let index = createEmptyIndex();
    index = addToIndex(index, sampleDecision, "path.md");
    index = addToIndex(
      index,
      { ...sampleDecision, id: "DEC-005", title: "Fifth" },
      "path5.md"
    );
    expect(getNextNumber(index)).toBe(6);
  });
});
