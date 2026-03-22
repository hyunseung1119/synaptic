import type {
  DecisionIndex,
  DecisionGraph,
  GraphNode,
  GraphEdge,
} from "./types.js";

export function buildGraph(index: DecisionIndex): DecisionGraph {
  const nodes: GraphNode[] = index.decisions.map((d) => ({
    id: d.id,
    title: d.title,
    status: d.status,
    tags: [...d.tags],
    edges: index.edges.filter((e) => e.from === d.id || e.to === d.id),
  }));

  return { nodes, edges: [...index.edges] };
}

export function getConnectedDecisions(
  graph: DecisionGraph,
  decisionId: string,
  depth = 1
): readonly GraphNode[] {
  const visited = new Set<string>();
  const queue: Array<{ id: string; currentDepth: number }> = [
    { id: decisionId, currentDepth: 0 },
  ];
  const result: GraphNode[] = [];

  while (queue.length > 0) {
    const item = queue.shift()!;
    if (visited.has(item.id) || item.currentDepth > depth) continue;
    visited.add(item.id);

    const node = graph.nodes.find((n) => n.id === item.id);
    if (node && item.id !== decisionId) {
      result.push(node);
    }

    if (item.currentDepth < depth) {
      const connectedEdges = graph.edges.filter(
        (e) => e.from === item.id || e.to === item.id
      );
      for (const edge of connectedEdges) {
        const nextId = edge.from === item.id ? edge.to : edge.from;
        queue.push({ id: nextId, currentDepth: item.currentDepth + 1 });
      }
    }
  }

  return result;
}

export function getDecisionLineage(
  graph: DecisionGraph,
  decisionId: string
): readonly GraphNode[] {
  const lineage: GraphNode[] = [];
  let currentId: string | null = decisionId;
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const node = graph.nodes.find((n) => n.id === currentId);
    if (node) lineage.push(node);

    const supersededEdge = graph.edges.find(
      (e) => e.from === currentId && e.relation === "supersedes"
    );
    currentId = supersededEdge?.to ?? null;
  }

  return lineage;
}

export function topologicalSort(graph: DecisionGraph): readonly GraphNode[] {
  const dependsOn = graph.edges.filter((e) => e.relation === "depends-on");
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of graph.nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  for (const edge of dependsOn) {
    inDegree.set(edge.from, (inDegree.get(edge.from) ?? 0) + 1);
    adjacency.get(edge.to)?.push(edge.from);
  }

  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const sorted: GraphNode[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    const node = graph.nodes.find((n) => n.id === id);
    if (node) sorted.push(node);

    for (const next of adjacency.get(id) ?? []) {
      const newDegree = (inDegree.get(next) ?? 1) - 1;
      inDegree.set(next, newDegree);
      if (newDegree === 0) queue.push(next);
    }
  }

  return sorted;
}

export function detectConflicts(graph: DecisionGraph): readonly GraphEdge[] {
  return graph.edges.filter((e) => e.relation === "contradicts");
}

export function getOrphanNodes(graph: DecisionGraph): readonly GraphNode[] {
  return graph.nodes.filter((n) => n.edges.length === 0);
}
