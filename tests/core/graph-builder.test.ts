import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildGraph,
  getConnectedDecisions,
  getDecisionLineage,
  topologicalSort,
  detectConflicts,
  getOrphanNodes,
} from "../../src/core/graph-builder.js";
import type { DecisionIndex } from "../../src/core/types.js";

const indexPath = join(__dirname, "../fixtures/sample-index.json");
const index: DecisionIndex = JSON.parse(readFileSync(indexPath, "utf-8"));

describe("buildGraph", () => {
  it("인덱스에서 그래프를 구축한다", () => {
    const graph = buildGraph(index);
    expect(graph.nodes).toHaveLength(3);
    expect(graph.edges).toHaveLength(2);
  });

  it("각 노드에 연결된 엣지를 포함한다", () => {
    const graph = buildGraph(index);
    const dec001 = graph.nodes.find((n) => n.id === "DEC-001");
    expect(dec001?.edges.length).toBeGreaterThan(0);
  });
});

describe("getConnectedDecisions", () => {
  it("1-depth로 연결된 노드를 반환한다", () => {
    const graph = buildGraph(index);
    const connected = getConnectedDecisions(graph, "DEC-001", 1);
    expect(connected.length).toBe(1);
    expect(connected[0].id).toBe("DEC-002");
  });

  it("2-depth로 전이적 연결을 반환한다", () => {
    const graph = buildGraph(index);
    const connected = getConnectedDecisions(graph, "DEC-001", 2);
    expect(connected.length).toBe(2);
  });

  it("존재하지 않는 ID는 빈 결과", () => {
    const graph = buildGraph(index);
    const connected = getConnectedDecisions(graph, "DEC-999", 1);
    expect(connected.length).toBe(0);
  });
});

describe("topologicalSort", () => {
  it("depends-on 관계에 따라 정렬한다", () => {
    const graph = buildGraph(index);
    const sorted = topologicalSort(graph);
    expect(sorted.length).toBeGreaterThan(0);

    const ids = sorted.map((n) => n.id);
    const dec003Idx = ids.indexOf("DEC-003");
    const dec002Idx = ids.indexOf("DEC-002");
    // DEC-003는 DEC-002보다 먼저 (DEC-002가 DEC-003에 depends-on)
    expect(dec003Idx).toBeLessThan(dec002Idx);
  });
});

describe("getDecisionLineage", () => {
  it("supersedes 체인을 추적한다", () => {
    const graph = buildGraph(index);
    const lineage = getDecisionLineage(graph, "DEC-001");
    expect(lineage).toHaveLength(1); // no supersedes in sample
    expect(lineage[0].id).toBe("DEC-001");
  });
});

describe("detectConflicts", () => {
  it("충돌 엣지가 없으면 빈 배열", () => {
    const graph = buildGraph(index);
    expect(detectConflicts(graph)).toHaveLength(0);
  });
});

describe("getOrphanNodes", () => {
  it("연결 없는 노드를 찾는다", () => {
    const graph = buildGraph(index);
    const orphans = getOrphanNodes(graph);
    // DEC-003는 incoming edge만 있으므로 edges에 포함됨
    expect(orphans.length).toBeLessThanOrEqual(1);
  });
});
