# LinkedIn 게시글

---

## 한국어 버전

Git blame은 WHO와 WHEN을 알려줍니다.
그런데 WHY는요?

AI 코딩 도구로 코드 생성 속도가 2-3배 빨라졌지만,
정작 "이 코드가 왜 이렇게 되어 있는지"는 아무도 기록하지 않습니다.

ADR(Architecture Decision Record)을 쓰는 팀은 20% 미만.
개발자 1명이 퇴사하면, 그 사람의 머릿속 의사결정도 함께 사라집니다.
컨텍스트 스위칭 비용? 개발자당 연 $50K+.

이 문제를 풀기 위해 Synaptic을 만들었습니다.

Synaptic은 Claude Code 세션에서 의사결정을 자동으로 추출하여
쿼리 가능한 지식 그래프를 구축하는 CLI 도구입니다.

어떻게 동작하나요?

1. Claude Code로 평소처럼 개발합니다
   "Redis vs Memcached 비교해줘" → "Redis로 가자"

2. /synaptic-extract 실행
   → DEC-001: "Redis를 캐시 레이어로 선택" 자동 추출

3. 3개월 후, 새 개발자가 질문합니다
   /synaptic-why src/cache/redis-client.ts
   → "읽기 10K/sec 요구, Memcached는 클러스터링 부족으로 기각"

핵심 포인트:
- Claude API 토큰 불필요 (Claude Code 자체가 LLM)
- 외부 DB 없음 (로컬 마크다운 + JSON)
- 추가 비용 $0
- 42개 테스트 통과, core 84% 커버리지

기존 도구와 뭐가 다른가요?

| | ADR (수동) | Git Blame | Synaptic |
|---|---|---|---|
| WHO | X | O | O |
| WHEN | X | O | O |
| WHY | O (수동) | X | O (자동) |
| 관계 추적 | X | X | O |
| 온보딩 경로 | X | X | O |

2026년은 하네스 엔지니어링의 해입니다.
모델을 바꾸지 않고, 모델을 감싸는 시스템을 개선해서 성능을 올리는 방법론.

Synaptic은 이 철학을 개발자의 "조직 기억" 문제에 적용한 첫 번째 도구입니다.

GitHub: https://github.com/hyunseung1119/synaptic

#DeveloperTools #ClaudeCode #HarnessEngineering #AI #OpenSource #개발자도구 #의사결정

---

## English Version

Git blame tells you WHO and WHEN.
But what about WHY?

AI coding tools made code generation 2-3x faster,
yet nobody records WHY the code is written this way.

Less than 20% of teams write ADRs.
When a developer leaves, their decision context vanishes.
Context switching costs $50K+ per developer per year.

I built Synaptic to solve this.

Synaptic is a CLI tool that automatically extracts decisions from Claude Code sessions
and builds a queryable knowledge graph.

How it works:

1. Develop with Claude Code as usual
   "Compare Redis vs Memcached" → "Let's go with Redis"

2. Run /synaptic-extract
   → DEC-001: "Selected Redis as cache layer" auto-extracted

3. Three months later, a new developer asks:
   /synaptic-why src/cache/redis-client.ts
   → "Read 10K/sec required, Memcached rejected due to lack of clustering"

Key points:
- No Claude API token needed (Claude Code IS the LLM)
- No external DB (local markdown + JSON)
- $0 additional cost
- 42 tests passing, 84% core coverage

What makes it different from existing tools?

ADR = manual, nobody writes them
Git Blame = WHO + WHEN, no WHY
Synaptic = automatic WHY extraction + relationship graph + onboarding paths

2026 is the year of Harness Engineering.
Synaptic applies this philosophy to the "organizational memory" problem.

GitHub: https://github.com/hyunseung1119/synaptic

#DeveloperTools #ClaudeCode #HarnessEngineering #AI #OpenSource
