import type {
  DecisionIndex,
  DecisionIndexEntry,
  SearchQuery,
  SearchResult,
} from "./types.js";
import { readTextFile } from "../utils/fs.js";

export function search(
  index: DecisionIndex,
  query: SearchQuery
): readonly SearchResult[] {
  const results: SearchResult[] = [];

  for (const entry of index.decisions) {
    let score = 0;
    const matchedFields: string[] = [];

    if (query.status && entry.status !== query.status) continue;

    if (query.keyword) {
      const kw = query.keyword.toLowerCase();
      if (entry.title.toLowerCase().includes(kw)) {
        score += 10;
        matchedFields.push("title");
      }
      if (entry.id.toLowerCase().includes(kw)) {
        score += 5;
        matchedFields.push("id");
      }
      if (entry.tags.some((t) => t.toLowerCase().includes(kw))) {
        score += 7;
        matchedFields.push("tags");
      }
    }

    if (query.tags && query.tags.length > 0) {
      const matched = query.tags.filter((t) =>
        entry.tags.some((et) => et.toLowerCase() === t.toLowerCase())
      );
      if (matched.length > 0) {
        score += matched.length * 5;
        matchedFields.push("tags");
      }
    }

    if (query.files && query.files.length > 0) {
      const matched = query.files.filter((f) =>
        entry.files.some((ef) => ef.includes(f) || f.includes(ef))
      );
      if (matched.length > 0) {
        score += matched.length * 8;
        matchedFields.push("files");
      }
    }

    if (!query.keyword && !query.tags?.length && !query.files?.length) {
      score = 1;
    }

    if (score > 0) {
      results.push({ decision: entry, score, matchedFields });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

export function searchByFile(
  index: DecisionIndex,
  filePath: string
): readonly DecisionIndexEntry[] {
  return index.decisions.filter((d) =>
    d.files.some((f) => f.includes(filePath) || filePath.includes(f))
  );
}

export function searchByTag(
  index: DecisionIndex,
  tag: string
): readonly DecisionIndexEntry[] {
  const lower = tag.toLowerCase();
  return index.decisions.filter((d) =>
    d.tags.some((t) => t.toLowerCase() === lower)
  );
}

export async function searchFullText(
  decisionsDir: string,
  keyword: string,
  index: DecisionIndex
): Promise<readonly SearchResult[]> {
  const results: SearchResult[] = [];
  const kw = keyword.toLowerCase();

  for (const entry of index.decisions) {
    const content = await readTextFile(`${decisionsDir}/${entry.filePath.split("/").pop()}`);
    if (!content.ok) continue;

    if (content.value.toLowerCase().includes(kw)) {
      results.push({
        decision: entry,
        score: 3,
        matchedFields: ["body"],
      });
    }
  }

  return results;
}
