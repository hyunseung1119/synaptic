import matter from "gray-matter";
import type { Decision, Alternative, DecisionStatus, Result } from "./types.js";

const VALID_STATUSES = new Set<string>(["accepted", "superseded", "deprecated", "proposed"]);

function toDecisionStatus(raw: unknown): DecisionStatus {
  const s = String(raw ?? "proposed");
  return VALID_STATUSES.has(s) ? (s as DecisionStatus) : "proposed";
}

export function parseDecisionMarkdown(content: string): Result<Decision> {
  try {
    const { data, content: body } = matter(content);

    const decision: Decision = {
      id: String(data.id ?? ""),
      title: String(data.title ?? ""),
      date: String(data.date ?? ""),
      status: toDecisionStatus(data.status),
      context: extractSection(body, "Context"),
      decision: extractSection(body, "Decision"),
      consequences: extractSection(body, "Consequences"),
      alternatives: parseAlternatives(extractSection(body, "Alternatives")),
      tags: Array.isArray(data.tags) ? data.tags : [],
      files: Array.isArray(data.files) ? data.files : [],
      related: Array.isArray(data.related) ? data.related : [],
    };

    return { ok: true, value: decision };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

export function serializeDecision(decision: Decision): string {
  const frontmatter = {
    id: decision.id,
    title: decision.title,
    date: decision.date,
    status: decision.status,
    tags: [...decision.tags],
    files: [...decision.files],
    related: [...decision.related],
  };

  const body = [
    "",
    "## Context",
    "",
    decision.context,
    "",
    "## Decision",
    "",
    decision.decision,
    "",
    "## Consequences",
    "",
    decision.consequences,
    "",
    "## Alternatives",
    "",
    ...decision.alternatives.map(
      (alt) => `### ${alt.name}\n- Rejected because: ${alt.reason}`
    ),
    "",
  ].join("\n");

  return matter.stringify(body, frontmatter);
}

function extractSection(body: string, heading: string): string {
  const regex = new RegExp(
    `## ${heading}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`,
    "i"
  );
  const match = body.match(regex);
  return match ? match[1].trim() : "";
}

function parseAlternatives(section: string): Alternative[] {
  if (!section) return [];

  const alternatives: Alternative[] = [];
  const blocks = section.split(/### /).filter(Boolean);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    const name = lines[0]?.trim() ?? "";
    const reasonLine = lines.find((l) =>
      l.toLowerCase().includes("rejected because:")
    );
    const reason = reasonLine
      ? reasonLine.replace(/.*rejected because:\s*/i, "").trim()
      : "";

    if (name) {
      alternatives.push({ name, reason });
    }
  }

  return alternatives;
}
