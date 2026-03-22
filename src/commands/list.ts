import { loadIndex } from "../core/index-manager.js";
import { renderDecisionList } from "../render/table.js";
import type { DecisionStatus } from "../core/types.js";
import * as c from "../render/colors.js";

export async function listCommand(options: {
  status?: string;
  tag?: string;
}): Promise<void> {
  const root = process.cwd();
  const result = await loadIndex(root);

  if (!result.ok) {
    console.log(c.error("  .synaptic/index.json을 찾을 수 없습니다. synaptic init을 먼저 실행하세요."));
    return;
  }

  let entries = [...result.value.decisions];

  if (options.status) {
    entries = entries.filter((d) => d.status === options.status as DecisionStatus);
  }
  if (options.tag) {
    const tag = options.tag.toLowerCase();
    entries = entries.filter((d) => d.tags.some((t) => t.toLowerCase() === tag));
  }

  console.log(`\n${c.heading("  Decisions")} ${c.dim(`(${entries.length}개)`)}\n`);
  console.log(renderDecisionList(entries));
}
