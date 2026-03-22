import type { DecisionIndexEntry, SearchResult } from "../core/types.js";
import * as c from "./colors.js";

export function renderDecisionList(entries: readonly DecisionIndexEntry[]): string {
  if (entries.length === 0) return c.dim("  기록된 의사결정이 없습니다.");

  const lines: string[] = [];
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  for (const entry of sorted) {
    const tags = entry.tags.map((t) => c.tag(t)).join(" ");
    lines.push(
      `  ${c.id(entry.id)}  ${c.title(entry.title)}`,
      `  ${c.dim(entry.date)}  ${c.status(entry.status)}  ${tags}`,
      `  ${entry.files.map((f) => c.file(f)).join(", ") || c.dim("(파일 없음)")}`,
      ""
    );
  }

  return lines.join("\n");
}

export function renderSearchResults(results: readonly SearchResult[]): string {
  if (results.length === 0) return c.dim("  검색 결과가 없습니다.");

  const lines: string[] = [
    c.heading(`  ${results.length}개 결과`),
    "",
  ];

  for (const r of results) {
    const tags = r.decision.tags.map((t) => c.tag(t)).join(" ");
    const matched = c.dim(`(${r.matchedFields.join(", ")})`);
    lines.push(
      `  ${c.id(r.decision.id)}  ${c.title(r.decision.title)}  ${matched}`,
      `  ${c.dim(r.decision.date)}  ${c.status(r.decision.status)}  ${tags}`,
      ""
    );
  }

  return lines.join("\n");
}

export function renderStats(
  total: number,
  byStatus: Record<string, number>,
  byTag: Record<string, number>,
  edgeCount: number,
  orphanCount: number,
  lastDecision?: DecisionIndexEntry
): string {
  const lines: string[] = [
    "",
    c.heading("  Synaptic Status"),
    "",
    `  Total decisions: ${c.title(String(total))}`,
    `  ${Object.entries(byStatus).map(([k, v]) => `${k}: ${v}`).join(" | ")}`,
    "",
    `  Tags: ${Object.entries(byTag)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${c.tag(k)}(${v})`)
      .join("  ")}`,
    "",
    `  Graph edges: ${edgeCount}  |  Orphans: ${orphanCount}`,
    "",
  ];

  if (lastDecision) {
    lines.push(
      `  Latest: ${c.id(lastDecision.id)} ${lastDecision.title} (${lastDecision.date})`,
      ""
    );
  }

  return lines.join("\n");
}
