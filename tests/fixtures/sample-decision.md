---
id: DEC-001
title: "Redis를 캐시 레이어로 선택"
date: "2026-03-22"
status: accepted
tags:
  - cache
  - infrastructure
  - performance
files:
  - src/cache/redis-client.ts
  - src/config/redis.ts
related:
  - DEC-002
---

## Context

읽기 요청이 초당 10,000건 이상 발생하며, 기존 PostgreSQL 쿼리로는 p99 latency가 200ms를 초과했다. 캐시 레이어를 도입하여 읽기 성능을 개선해야 했다.

## Decision

Redis를 메인 캐시 레이어로 사용한다.

## Consequences

### Positive
- Redis Benchmark 기준 100K+ ops/sec (단일 노드)
- Pub/Sub 지원으로 캐시 무효화가 용이
- 팀 내 Redis 운영 경험 보유

### Negative
- 추가 인프라 관리 필요
- 메모리 비용 증가

## Alternatives

### Memcached
- Rejected because: 클러스터링 지원이 부족하고 데이터 타입이 제한적

### PostgreSQL Materialized View
- Rejected because: 갱신 비용이 높고 latency 요구사항을 충족하지 못함
