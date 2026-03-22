import type { DecisionGraph, GraphNode, GraphEdge } from "../core/types.js";
import * as c from "./colors.js";

export function renderGraph(
  graph: DecisionGraph,
  options?: { focusId?: string; maxDepth?: number }
): string {
  if (graph.nodes.length === 0) return c.dim("  빈 그래프입니다.");

  const lines: string[] = [
    "",
    c.heading("  Decision Graph"),
    "",
  ];

  const nodes = options?.focusId
    ? filterByFocus(graph, options.focusId, options.maxDepth ?? 2)
    : graph.nodes;

  for (const node of nodes) {
    const isFocused = node.id === options?.focusId;
    const prefix = isFocused ? ">>> " : "    ";
    const nodeStr = isFocused
      ? c.success(`[${node.id}] ${node.title}`)
      : `${c.id(node.id)} ${node.title}`;

    lines.push(`${prefix}${nodeStr}  ${c.status(node.status)}`);

    const outEdges = graph.edges.filter((e) => e.from === node.id);
    for (const edge of outEdges) {
      const target = graph.nodes.find((n) => n.id === edge.to);
      const targetName = target ? target.title : edge.to;
      lines.push(
        `${prefix}  ${c.dim("└─")} ${c.edge[edge.relation]} ${c.dim("→")} ${edge.to} ${c.dim(targetName)}`
      );
    }

    const inEdges = graph.edges.filter((e) => e.to === node.id);
    for (const edge of inEdges) {
      const source = graph.nodes.find((n) => n.id === edge.from);
      const sourceName = source ? source.title : edge.from;
      lines.push(
        `${prefix}  ${c.dim("└─")} ${c.dim("←")} ${c.edge[edge.relation]} ${edge.from} ${c.dim(sourceName)}`
      );
    }

    lines.push("");
  }

  return lines.join("\n");
}

export function renderTimeline(
  decisions: readonly GraphNode[]
): string {
  if (decisions.length === 0) return c.dim("  타임라인이 비어있습니다.");

  const lines: string[] = [
    "",
    c.heading("  Decision Timeline"),
    "",
  ];

  for (let i = 0; i < decisions.length; i++) {
    const node = decisions[i];
    const isLast = i === decisions.length - 1;
    const connector = isLast ? "└" : "├";
    const line = isLast ? " " : "│";

    lines.push(
      `  ${connector}── ${c.id(node.id)} ${c.title(node.title)}`,
      `  ${line}   ${c.status(node.status)}  ${node.tags.map((t) => c.tag(t)).join(" ")}`,
      `  ${line}`
    );
  }

  return lines.join("\n");
}

export function renderTree(
  graph: DecisionGraph,
  rootId: string
): string {
  const lines: string[] = [];
  const visited = new Set<string>();

  function walk(nodeId: string, prefix: string, isLast: boolean): void {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = graph.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const connector = isLast ? "└── " : "├── ";
    const childPrefix = isLast ? "    " : "│   ";

    lines.push(
      `${prefix}${connector}${c.id(node.id)} ${node.title} ${c.status(node.status)}`
    );

    const children = graph.edges
      .filter((e) => e.to === nodeId && e.relation === "depends-on")
      .map((e) => e.from);

    for (let i = 0; i < children.length; i++) {
      walk(children[i], prefix + childPrefix, i === children.length - 1);
    }
  }

  const root = graph.nodes.find((n) => n.id === rootId);
  if (!root) return c.dim(`  ${rootId}를 찾을 수 없습니다.`);

  lines.push(`${c.id(root.id)} ${c.title(root.title)} ${c.status(root.status)}`);

  const children = graph.edges
    .filter((e) => e.to === rootId && e.relation === "depends-on")
    .map((e) => e.from);

  for (let i = 0; i < children.length; i++) {
    walk(children[i], "", i === children.length - 1);
  }

  return lines.join("\n");
}

function filterByFocus(
  graph: DecisionGraph,
  focusId: string,
  maxDepth: number
): readonly GraphNode[] {
  const visited = new Set<string>();
  const queue: Array<{ id: string; depth: number }> = [{ id: focusId, depth: 0 }];

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (visited.has(id) || depth > maxDepth) continue;
    visited.add(id);

    const edges = graph.edges.filter((e) => e.from === id || e.to === id);
    for (const e of edges) {
      const nextId = e.from === id ? e.to : e.from;
      queue.push({ id: nextId, depth: depth + 1 });
    }
  }

  return graph.nodes.filter((n) => visited.has(n.id));
}
