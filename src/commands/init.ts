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

  const dirResult = await ensureDir(decisionsDir(root));
  if (!dirResult.ok) {
    console.log(c.error(`  디렉토리 생성 실패: ${dirResult.error.message}`));
    return;
  }

  const projectName = options.name ?? root.split("/").pop() ?? "project";
  const config = createDefaultConfig(projectName);
  const configResult = await saveConfig(root, config);
  if (!configResult.ok) {
    console.log(c.error(`  설정 저장 실패: ${configResult.error.message}`));
    return;
  }

  const index = createEmptyIndex();
  const indexResult = await saveIndex(root, index);
  if (!indexResult.ok) {
    console.log(c.error(`  인덱스 저장 실패: ${indexResult.error.message}`));
    return;
  }

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
