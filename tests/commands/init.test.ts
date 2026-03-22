import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { initCommand } from "../../src/commands/init.js";
import { exists, readJsonFile } from "../../src/utils/fs.js";

let tempDir: string;
const originalCwd = process.cwd;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "synaptic-init-test-"));
  vi.spyOn(process, "cwd").mockReturnValue(tempDir);
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  await rm(tempDir, { recursive: true, force: true });
});

describe("initCommand", () => {
  it(".synaptic 디렉토리를 생성한다", async () => {
    await initCommand({});

    expect(await exists(join(tempDir, ".synaptic"))).toBe(true);
    expect(await exists(join(tempDir, ".synaptic", "decisions"))).toBe(true);
    expect(await exists(join(tempDir, ".synaptic", "config.json"))).toBe(true);
    expect(await exists(join(tempDir, ".synaptic", "index.json"))).toBe(true);
  });

  it("config.json에 프로젝트 이름을 저장한다", async () => {
    await initCommand({ name: "test-project" });

    const config = await readJsonFile<{ projectName: string }>(
      join(tempDir, ".synaptic", "config.json")
    );
    expect(config.ok).toBe(true);
    if (config.ok) expect(config.value.projectName).toBe("test-project");
  });

  it("index.json이 빈 인덱스로 생성된다", async () => {
    await initCommand({});

    const index = await readJsonFile<{ version: number; decisions: unknown[] }>(
      join(tempDir, ".synaptic", "index.json")
    );
    expect(index.ok).toBe(true);
    if (index.ok) {
      expect(index.value.version).toBe(1);
      expect(index.value.decisions).toHaveLength(0);
    }
  });

  it("이미 존재하면 스킵한다", async () => {
    await initCommand({});
    const logSpy = vi.spyOn(console, "log");

    await initCommand({});

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("이미 존재합니다")
    );
  });
});
