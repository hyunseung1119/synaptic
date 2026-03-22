import type { Decision, Result } from "./types.js";
import { generateDecisionId } from "../utils/id.js";

export function createDecision(
  input: Omit<Decision, "id">,
  nextNumber: number,
  prefix = "DEC"
): Result<Decision> {
  const id = generateDecisionId(nextNumber, prefix);

  const decision: Decision = { id, ...input };
  const validation = validateDecision(decision);
  if (!validation.ok) return validation;

  return { ok: true, value: decision };
}

export function updateDecision(
  existing: Decision,
  updates: Partial<Omit<Decision, "id">>
): Result<Decision> {
  const updated: Decision = { ...existing, ...updates };
  return validateDecision(updated);
}

export function validateDecision(decision: Decision): Result<Decision, Error> {
  const errors: string[] = [];

  if (!decision.id) errors.push("id는 필수입니다");
  if (!decision.title) errors.push("title은 필수입니다");
  if (!decision.date) errors.push("date는 필수입니다");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(decision.date)) {
    errors.push("date는 YYYY-MM-DD 형식이어야 합니다");
  }
  if (!["accepted", "superseded", "deprecated", "proposed"].includes(decision.status)) {
    errors.push(`유효하지 않은 status: ${decision.status}`);
  }

  if (errors.length > 0) {
    return { ok: false, error: new Error(errors.join(", ")) };
  }

  return { ok: true, value: decision };
}
