export function generateDecisionId(nextNumber: number, prefix = "DEC"): string {
  return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
}

export function parseDecisionId(id: string): { prefix: string; number: number } | null {
  const match = id.match(/^([A-Z]+)-(\d+)$/);
  if (!match) return null;
  return { prefix: match[1], number: parseInt(match[2], 10) };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export function decisionFileName(id: string, title: string): string {
  return `${id.toLowerCase()}-${slugify(title)}.md`;
}
