import { loadIndex } from "../core/index-manager.js";
import { search } from "../core/search-engine.js";
import { renderSearchResults } from "../render/table.js";
import * as c from "../render/colors.js";

export async function searchCommand(
  query: string,
  options: { file?: string; tag?: string }
): Promise<void> {
  const root = process.cwd();
  const result = await loadIndex(root);

  if (!result.ok) {
    console.log(c.error("  .synaptic/index.json을 찾을 수 없습니다."));
    return;
  }

  const results = search(result.value, {
    keyword: query,
    tags: options.tag ? [options.tag] : undefined,
    files: options.file ? [options.file] : undefined,
  });

  console.log(`\n${c.heading(`  "${query}" 검색 결과`)}\n`);
  console.log(renderSearchResults(results));
}
