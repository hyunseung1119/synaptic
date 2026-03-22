import { join } from "node:path";
import { ensureDir, exists, synapticDir, decisionsDir } from "../utils/fs.js";
import { createDefaultConfig, saveConfig } from "../utils/config.js";
import { createEmptyIndex, saveIndex } from "../core/index-manager.js";
import * as c from "../render/colors.js";

export async function initCommand(options: { name?: string }): Promise<void> {
  const root = process.cwd();
  const dir = synapticDir(root);

  if (await exists(dir)) {
    console.log(c.warn("  .synaptic/ 디렉토리가 이미 존재합니다."));
    return;
  }

  await ensureDir(decisionsDir(root));

  const projectName = options.name ?? root.split("/").pop() ?? "project";
  const config = createDefaultConfig(projectName);
  await saveConfig(root, config);

  const index = createEmptyIndex();
  await saveIndex(root, index);

  console.log(c.success("\n  Synaptic 초기화 완료!"));
  console.log(`
  ${c.dim("생성된 파일:")}
  ${c.file(".synaptic/config.json")}   ${c.dim("- 프로젝트 설정")}
  ${c.file(".synaptic/index.json")}    ${c.dim("- 의사결정 인덱스")}
  ${c.file(".synaptic/decisions/")}    ${c.dim("- 의사결정 저장소")}

  ${c.dim("다음 단계:")}
  ${c.title("synaptic install")}       ${c.dim("- Claude Code 연동 설치")}
  ${c.title("/synaptic-extract")}      ${c.dim("- 세션에서 의사결정 추출")}
`);
}
