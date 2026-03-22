import { readFile, writeFile, readdir, mkdir, access } from "node:fs/promises";
import { join } from "node:path";
import type { Result } from "../core/types.js";

export async function readTextFile(path: string): Promise<Result<string>> {
  try {
    const content = await readFile(path, "utf-8");
    return { ok: true, value: content };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

export async function writeTextFile(path: string, content: string): Promise<Result<void>> {
  try {
    await writeFile(path, content, "utf-8");
    return { ok: true, value: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

export async function readJsonFile<T>(path: string): Promise<Result<T>> {
  const result = await readTextFile(path);
  if (!result.ok) return result;
  try {
    return { ok: true, value: JSON.parse(result.value) as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

export async function writeJsonFile(path: string, data: unknown): Promise<Result<void>> {
  return writeTextFile(path, JSON.stringify(data, null, 2) + "\n");
}

export async function listFiles(dir: string, ext?: string): Promise<Result<string[]>> {
  try {
    const entries = await readdir(dir);
    const filtered = ext ? entries.filter((f) => f.endsWith(ext)) : entries;
    return { ok: true, value: filtered.map((f) => join(dir, f)) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

export async function ensureDir(dir: string): Promise<Result<void>> {
  try {
    await mkdir(dir, { recursive: true });
    return { ok: true, value: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

export async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export function synapticDir(projectRoot: string): string {
  return join(projectRoot, ".synaptic");
}

export function decisionsDir(projectRoot: string): string {
  return join(synapticDir(projectRoot), "decisions");
}

export function indexPath(projectRoot: string): string {
  return join(synapticDir(projectRoot), "index.json");
}

export function configPath(projectRoot: string): string {
  return join(synapticDir(projectRoot), "config.json");
}
