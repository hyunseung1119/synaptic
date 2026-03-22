import { loadIndex } from "../core/index-manager.js";
import { buildGraph } from "../core/graph-builder.js";
import { renderGraph, renderTimeline, renderTree } from "../render/terminal-graph.js";
import * as c from "../render/colors.js";

export async function graphCommand(options: {
  focus?: string;
  depth?: number;
  format?: string;
}): Promise<void> {
  const root = process.cwd();
  const result = await loadIndex(root);

  if (!result.ok) {
    console.log(c.error("  .synaptic/index.json을 찾을 수 없습니다."));
    return;
  }

  const graph = buildGraph(result.value);

  if (graph.nodes.length === 0) {
    console.log(c.dim("\n  기록된 의사결정이 없습니다. /synaptic-extract로 시작하세요.\n"));
    return;
  }

  switch (options.format) {
    case "timeline":
      console.log(renderTimeline(graph.nodes));
      break;
    case "tree":
      if (!options.focus) {
        console.log(c.warn("  --focus <ID>를 지정해주세요."));
        return;
      }
      console.log(renderTree(graph, options.focus));
      break;
    default:
      console.log(
        renderGraph(graph, {
          focusId: options.focus,
          maxDepth: options.depth ?? 2,
        })
      );
  }
}
