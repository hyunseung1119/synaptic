import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { listCommand } from "./commands/list.js";
import { searchCommand } from "./commands/search.js";
import { graphCommand } from "./commands/graph.js";
import { statsCommand } from "./commands/stats.js";
import { installCommand } from "./commands/install.js";

const program = new Command();

program
  .name("synaptic")
  .description("코드베이스 의사결정 그래프 — AI 세션에서 '왜'를 추출하고 쿼리합니다")
  .version("0.1.0");

program
  .command("init")
  .description("현재 프로젝트에 .synaptic/ 디렉토리를 생성합니다")
  .option("-n, --name <name>", "프로젝트 이름")
  .action(initCommand);

program
  .command("list")
  .alias("ls")
  .description("기록된 의사결정 목록을 출력합니다")
  .option("-s, --status <status>", "상태 필터 (accepted|superseded|deprecated|proposed)")
  .option("-t, --tag <tag>", "태그 필터")
  .action(listCommand);

program
  .command("search <query>")
  .alias("s")
  .description("의사결정을 검색합니다")
  .option("-f, --file <path>", "관련 파일로 검색")
  .option("-t, --tag <tag>", "태그로 검색")
  .action(searchCommand);

program
  .command("graph")
  .alias("g")
  .description("의사결정 그래프를 터미널에 시각화합니다")
  .option("--focus <id>", "특정 Decision ID를 중심으로 보기")
  .option("--depth <n>", "탐색 깊이", "2")
  .option("--format <type>", "출력 형식 (graph|timeline|tree)", "graph")
  .action((opts) => graphCommand({ ...opts, depth: parseInt(opts.depth) }));

program
  .command("stats")
  .description("의사결정 그래프 통계를 출력합니다")
  .action(statsCommand);

program
  .command("install")
  .description("Claude Code 스킬을 설치합니다")
  .option("-g, --global", "글로벌 설치 (~/.claude/commands/)")
  .action(installCommand);

program.parse();
