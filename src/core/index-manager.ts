import type {
  DecisionIndex,
  DecisionIndexEntry,
  Decision,
  GraphEdge,
  Result,
} from "./types.js";
import { parseDecisionMarkdown } from "./markdown-parser.js";
import {
  readJsonFile,
  writeJsonFile,
  listFiles,
  readTextFile,
  indexPath,
  decisionsDir,
} from "../utils/fs.js";

export function createEmptyIndex(): DecisionIndex {
  return {
    version: 1,
    lastUpdated: new Date().toISOString().split("T")[0],
    decisions: [],
    edges: [],
  };
}

export async function loadIndex(projectRoot: string): Promise<Result<DecisionIndex>> {
  return readJsonFile<DecisionIndex>(indexPath(projectRoot));
}

export async function saveIndex(
  projectRoot: string,
  index: DecisionIndex
): Promise<Result<void>> {
  const updated: DecisionIndex = {
    ...index,
    lastUpdated: new Date().toISOString().split("T")[0],
  };
  return writeJsonFile(indexPath(projectRoot), updated);
}

export function addToIndex(
  index: DecisionIndex,
  decision: Decision,
  filePath: string
): DecisionIndex {
  const entry: DecisionIndexEntry = {
    id: decision.id,
    title: decision.title,
    date: decision.date,
    status: decision.status,
    tags: [...decision.tags],
    files: [...decision.files],
    filePath,
  };

  const filtered = index.decisions.filter((d) => d.id !== decision.id);

  return {
    ...index,
    decisions: [...filtered, entry],
  };
}

export function removeFromIndex(
  index: DecisionIndex,
  decisionId: string
): DecisionIndex {
  return {
    ...index,
    decisions: index.decisions.filter((d) => d.id !== decisionId),
    edges: index.edges.filter(
      (e) => e.from !== decisionId && e.to !== decisionId
    ),
  };
}

export function addEdge(index: DecisionIndex, edge: GraphEdge): DecisionIndex {
  const duplicate = index.edges.some(
    (e) => e.from === edge.from && e.to === edge.to && e.relation === edge.relation
  );
  if (duplicate) return index;

  return { ...index, edges: [...index.edges, edge] };
}

export function getNextNumber(index: DecisionIndex): number {
  if (index.decisions.length === 0) return 1;

  const numbers = index.decisions
    .map((d) => {
      const match = d.id.match(/(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });

  return Math.max(...numbers) + 1;
}

export async function rebuildIndex(projectRoot: string): Promise<Result<DecisionIndex>> {
  const files = await listFiles(decisionsDir(projectRoot), ".md");
  if (!files.ok) return files;

  let index = createEmptyIndex();

  for (const filePath of files.value) {
    const content = await readTextFile(filePath);
    if (!content.ok) continue;

    const parsed = parseDecisionMarkdown(content.value);
    if (!parsed.ok) continue;

    const relativePath = filePath.replace(projectRoot + "/", "");
    index = addToIndex(index, parsed.value, relativePath);

    for (const relatedId of parsed.value.related) {
      index = addEdge(index, {
        from: parsed.value.id,
        to: relatedId,
        relation: "related-to",
      });
    }
  }

  return { ok: true, value: index };
}
