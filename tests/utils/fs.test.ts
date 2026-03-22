import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  readTextFile,
  writeTextFile,
  readJsonFile,
  writeJsonFile,
  ensureDir,
  exists,
  listFiles,
  synapticDir,
  decisionsDir,
  indexPath,
  configPath,
} from "../../src/utils/fs.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "synaptic-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("writeTextFile + readTextFile", () => {
  it("파일을 쓰고 읽는다", async () => {
    const path = join(tempDir, "test.txt");
    const writeResult = await writeTextFile(path, "hello");
    expect(writeResult.ok).toBe(true);

    const readResult = await readTextFile(path);
    expect(readResult.ok).toBe(true);
    if (readResult.ok) expect(readResult.value).toBe("hello");
  });

  it("존재하지 않는 파일 읽기는 에러", async () => {
    const result = await readTextFile(join(tempDir, "nonexistent.txt"));
    expect(result.ok).toBe(false);
  });
});

describe("writeJsonFile + readJsonFile", () => {
  it("JSON을 쓰고 읽는다", async () => {
    const path = join(tempDir, "data.json");
    const data = { name: "test", count: 42 };

    await writeJsonFile(path, data);
    const result = await readJsonFile<typeof data>(path);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("test");
      expect(result.value.count).toBe(42);
    }
  });

  it("타입 가드로 검증한다", async () => {
    const path = join(tempDir, "bad.json");
    await writeTextFile(path, '{"wrong": true}');

    const isValid = (d: unknown): d is { name: string } =>
      typeof d === "object" && d !== null && "name" in d;

    const result = await readJsonFile(path, isValid);
    expect(result.ok).toBe(false);
  });

  it("잘못된 JSON은 에러", async () => {
    const path = join(tempDir, "broken.json");
    await writeTextFile(path, "not json{{{");
    const result = await readJsonFile(path);
    expect(result.ok).toBe(false);
  });
});

describe("ensureDir", () => {
  it("중첩 디렉토리를 생성한다", async () => {
    const dir = join(tempDir, "a", "b", "c");
    const result = await ensureDir(dir);
    expect(result.ok).toBe(true);
    expect(await exists(dir)).toBe(true);
  });
});

describe("exists", () => {
  it("존재하는 파일은 true", async () => {
    const path = join(tempDir, "exists.txt");
    await writeTextFile(path, "hi");
    expect(await exists(path)).toBe(true);
  });

  it("존재하지 않는 파일은 false", async () => {
    expect(await exists(join(tempDir, "nope.txt"))).toBe(false);
  });
});

describe("listFiles", () => {
  it("디렉토리의 파일 목록을 반환한다", async () => {
    await writeTextFile(join(tempDir, "a.md"), "");
    await writeTextFile(join(tempDir, "b.md"), "");
    await writeTextFile(join(tempDir, "c.txt"), "");

    const result = await listFiles(tempDir, ".md");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toHaveLength(2);
  });

  it("존재하지 않는 디렉토리는 에러", async () => {
    const result = await listFiles(join(tempDir, "nope"));
    expect(result.ok).toBe(false);
  });
});

describe("경로 헬퍼", () => {
  it("synapticDir", () => {
    expect(synapticDir("/project")).toBe("/project/.synaptic");
  });
  it("decisionsDir", () => {
    expect(decisionsDir("/project")).toBe("/project/.synaptic/decisions");
  });
  it("indexPath", () => {
    expect(indexPath("/project")).toBe("/project/.synaptic/index.json");
  });
  it("configPath", () => {
    expect(configPath("/project")).toBe("/project/.synaptic/config.json");
  });
});
