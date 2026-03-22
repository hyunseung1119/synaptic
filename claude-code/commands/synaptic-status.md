# 의사결정 그래프 현황

현재 프로젝트의 의사결정 그래프 상태를 요약합니다.

## 프로세스

1. `.synaptic/index.json`을 읽으세요
2. 다음 통계를 계산하고 출력하세요:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Synaptic Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Decisions:  {total}개
  ├ accepted:    {n}
  ├ proposed:    {n}
  ├ superseded:  {n}
  └ deprecated:  {n}

  Tags: #auth(4)  #database(6)  #api(3)  #frontend(8)

  Graph:
  ├ Edges:    {n} (depends-on: {n}, supersedes: {n}, related: {n})
  ├ Orphans:  {n}개 (연결 없는 결정)
  └ Chains:   최장 {n} hops

  Latest: DEC-024 "Redis session store" (2026-03-20)

  Coverage:
  └ 관련 파일 수: {n}개 (중복 제거)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 중요

- `.synaptic/` 없으면: "synaptic init을 먼저 실행하세요"
- 빈 그래프면: "/synaptic-extract로 첫 번째 의사결정을 기록하세요"
- `synaptic stats` CLI 명령으로도 동일한 정보를 볼 수 있다고 안내
