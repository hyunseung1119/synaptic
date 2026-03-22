import { loadIndex } from "../core/index-manager.js";
import { buildGraph, getOrphanNodes } from "../core/graph-builder.js";
import { renderStats } from "../render/table.js";
import * as c from "../render/colors.js";

export async function statsCommand(): Promise<void> {
  const root = process.cwd();
  const result = await loadIndex(root);

  if (!result.ok) {
    console.log(c.error("  .synaptic/index.json을 찾을 수 없습니다."));
    return;
  }

  const index = result.value;
  const graph = buildGraph(index);

  const byStatus: Record<string, number> = {};
  const byTag: Record<string, number> = {};

  for (const d of index.decisions) {
    byStatus[d.status] = (byStatus[d.status] ?? 0) + 1;
    for (const t of d.tags) {
      byTag[t] = (byTag[t] ?? 0) + 1;
    }
  }

  const orphans = getOrphanNodes(graph);
  const sorted = [...index.decisions].sort((a, b) => b.date.localeCompare(a.date));

  console.log(
    renderStats(
      index.decisions.length,
      byStatus,
      byTag,
      index.edges.length,
      orphans.length,
      sorted[0]
    )
  );
}
