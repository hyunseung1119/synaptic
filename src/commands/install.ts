import { join } from "node:path";
import { homedir } from "node:os";
import { ensureDir, exists, readTextFile, writeTextFile } from "../utils/fs.js";
import * as c from "../render/colors.js";

export async function installCommand(options: { global?: boolean }): Promise<void> {
  const target = options.global
    ? join(homedir(), ".claude", "commands")
    : join(process.cwd(), ".claude", "commands");

  const dirResult = await ensureDir(target);
  if (!dirResult.ok) {
    console.log(c.error(`  디렉토리 생성 실패: ${dirResult.error.message}`));
    return;
  }

  const skillsDir = new URL("../../claude-code/commands/", import.meta.url).pathname;

  const skills = [
    "synaptic-extract.md",
    "synaptic-why.md",
    "synaptic-onboard.md",
    "synaptic-status.md",
  ];

  let installed = 0;
  for (const skill of skills) {
    const sourcePath = join(skillsDir, skill);
    if (!(await exists(sourcePath))) {
      console.log(c.warn(`  ${skill} 스킬 파일을 찾을 수 없습니다.`));
      continue;
    }

    const content = await readTextFile(sourcePath);
    if (!content.ok) {
      console.log(c.warn(`  ${skill} 읽기 실패: ${content.error.message}`));
      continue;
    }

    const targetPath = join(target, skill);
    const writeResult = await writeTextFile(targetPath, content.value);

    if (writeResult.ok) {
      console.log(`  ${c.success("+")} ${c.file(skill)}`);
      installed++;
    } else {
      console.log(c.warn(`  ${skill} 쓰기 실패: ${writeResult.error.message}`));
    }
  }

  console.log(`\n  ${c.success(`${installed}개 스킬 설치 완료!`)}`);
  console.log(`  ${c.dim(`위치: ${target}`)}`);
  console.log(`\n  ${c.dim("사용 가능한 스킬:")}`);
  console.log(`  ${c.title("/synaptic-extract")}  ${c.dim("세션에서 의사결정 추출")}`);
  console.log(`  ${c.title("/synaptic-why")}      ${c.dim("코드 의사결정 추적")}`);
  console.log(`  ${c.title("/synaptic-onboard")}  ${c.dim("온보딩 학습 경로 생성")}`);
  console.log(`  ${c.title("/synaptic-status")}   ${c.dim("결정 그래프 현황")}\n`);
}
