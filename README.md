# Synaptic

**코드베이스 의사결정 그래프** -- AI 코딩 세션에서 "왜"를 추출하고 쿼리합니다.

> Git blame은 WHO와 WHEN을 알려줍니다. Synaptic은 **WHY**를 알려줍니다.

## 문제

2026년, AI 코딩 도구가 코드를 2-3배 빠르게 생성하면서 새로운 문제가 생겼습니다:

- **"이 코드 왜 이렇게 되어 있지?"** -- 의사결정의 이유가 사라집니다
- **컨텍스트 스위칭 비용 $50K+/개발자/년** -- 결정의 맥락을 잃으면 생산성이 떨어집니다
- **온보딩 7일+** -- 새 개발자가 아키텍처 결정의 이유를 파악할 방법이 없습니다
- **ADR을 쓰는 팀은 20% 미만** -- 수동 문서화는 실패합니다

## 해결

Synaptic은 Claude Code 세션에서 의사결정을 **자동 추출**하여 쿼리 가능한 지식 그래프를 구축합니다.

```
개발자: Claude Code로 "Redis vs Memcached 비교" → "Redis로 가자" 대화

/synaptic-extract 실행
  → DEC-001: "Redis를 캐시 레이어로 선택" 자동 추출 + 저장

3개월 후, 새 개발자:
/synaptic-why src/cache/redis-client.ts
  → "2026-03-22에 Redis 선택. 이유: 읽기 10K/sec 요구, Memcached는 클러스터링 부족으로 기각"
```

## 설치

```bash
# npm 글로벌 설치
npm install -g synaptic-decisions

# 프로젝트 초기화
cd your-project
synaptic init

# Claude Code 스킬 설치
synaptic install --global
```

## 사용법

### CLI 명령어

```bash
# 의사결정 목록
synaptic list
synaptic list --tag auth
synaptic list --status accepted

# 검색
synaptic search "Redis"
synaptic search "인증" --tag security

# 그래프 시각화
synaptic graph
synaptic graph --focus DEC-001
synaptic graph --format timeline

# 통계
synaptic stats
```

### Claude Code 스킬

```
/synaptic-extract    세션에서 의사결정 추출
/synaptic-why        "이 코드 왜 이래?" 쿼리
/synaptic-onboard    신규 개발자 학습 경로 생성
/synaptic-status     결정 그래프 현황
```

## 실제 동작 화면

### `synaptic list` -- 의사결정 목록

```
  Decisions (3개)

  DEC-001  Redis를 캐시 레이어로 선택
  2026-03-22  accepted  #cache #infrastructure #performance
  src/cache/redis-client.ts, src/config/redis.ts

  DEC-002  JWT 기반 인증 채택
  2026-03-20  accepted  #auth #security #architecture
  src/auth/jwt.ts, src/middleware/auth.ts

  DEC-003  모노레포 구조 선택
  2026-03-15  accepted  #architecture #infrastructure
  package.json, turbo.json
```

### `synaptic graph` -- 의사결정 그래프

```
  Decision Graph

    DEC-001 Redis를 캐시 레이어로 선택  accepted
      └─ related-to → DEC-002 JWT 기반 인증 채택

    DEC-002 JWT 기반 인증 채택  accepted
      └─ depends-on → DEC-003 모노레포 구조 선택
      └─ ← related-to DEC-001 Redis를 캐시 레이어로 선택

    DEC-003 모노레포 구조 선택  accepted
      └─ ← depends-on DEC-002 JWT 기반 인증 채택
```

### `synaptic search "Redis"` -- 검색

```
  "Redis" 검색 결과

  1개 결과

  DEC-001  Redis를 캐시 레이어로 선택  (title)
  2026-03-22  accepted  #cache #infrastructure #performance
```

### `synaptic stats` -- 통계

```
  Synaptic Status

  Total decisions: 3
  accepted: 3

  Tags: #infrastructure(2)  #architecture(2)  #cache(1)  #performance(1)

  Graph edges: 2  |  Orphans: 0

  Latest: DEC-001 Redis를 캐시 레이어로 선택 (2026-03-22)
```

## 의사결정 파일 형식

```yaml
---
id: DEC-001
title: "Redis를 캐시 레이어로 선택"
date: "2026-03-22"
status: accepted
tags: [cache, infrastructure, performance]
files: [src/cache/redis-client.ts]
related: [DEC-002]
---

## Context
읽기 요청 10,000/sec, PostgreSQL p99 latency 200ms 초과

## Decision
Redis를 메인 캐시 레이어로 사용한다.

## Consequences
- Positive: 100K+ ops/sec, Pub/Sub 캐시 무효화
- Negative: 추가 인프라, 메모리 비용

## Alternatives
### Memcached
- Rejected because: 클러스터링 부족
```

## 아키텍처

```
┌─────────────────────────────────────────┐
│  Claude Code Session                     │
│                                          │
│  /synaptic-extract  → 의사결정 추출       │
│  /synaptic-why      → 결정 그래프 쿼리    │
│  /synaptic-onboard  → 학습 경로 생성      │
│                                          │
│  Stop Hook          → 추출 리마인더       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  .synaptic/                             │
│  ├── config.json       설정              │
│  ├── index.json        인덱스 + 그래프    │
│  └── decisions/                         │
│      ├── DEC-001-*.md  의사결정 파일      │
│      └── DEC-002-*.md                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  synaptic CLI                           │
│  list | search | graph | stats          │
└─────────────────────────────────────────┘
```

## 핵심 설계 원칙

- **Claude API 불필요**: Claude Code 자체가 LLM. 스킬이 세션 컨텍스트를 분석
- **로컬 파일 기반**: 외부 DB 없음. Git으로 버전 관리 가능
- **자동 추출**: 수동 ADR 대신 대화에서 자동 추출
- **쿼리 가능**: 파일 경로, 태그, 키워드로 "왜?" 검색

## 기존 도구와의 차이

| | ADR (수동) | Git Blame | Synaptic |
|---|---|---|---|
| WHO | - | O | O |
| WHEN | - | O | O |
| **WHY** | O (수동) | X | **O (자동)** |
| 쿼리 | X | 제한적 | **그래프 탐색** |
| 관계 추적 | X | X | **O** |
| 온보딩 | X | X | **학습 경로** |

## 기술 스택

- TypeScript + Node.js (ES Modules)
- Commander.js (CLI)
- gray-matter (YAML frontmatter 파싱)
- chalk (터미널 색상)
- Vitest (테스트, 42개 통과, core 84% 커버리지)

## 라이선스

MIT
