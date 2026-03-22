# 코드 의사결정 추적

"이 코드가 왜 이렇게 되어 있는지" 의사결정 기록에서 찾아 설명합니다.

## 사용법

```
/synaptic-why src/auth/jwt.ts
/synaptic-why "왜 Redis를 사용하나?"
/synaptic-why auth
```

## 프로세스

### 1단계: 질문 파싱
사용자 입력에서 검색 대상을 식별하세요:
- 파일 경로 → 해당 파일이 `files`에 포함된 Decision 검색
- 키워드 → `title`, `tags`, 본문에서 검색
- Decision ID → 해당 Decision 직접 로드

### 2단계: 인덱스 검색
`.synaptic/index.json`을 읽고 관련 Decision을 찾으세요.

### 3단계: 상세 로드
매칭된 Decision의 `.md` 파일을 읽어 전체 내용을 확인하세요.

### 4단계: 관계 추적
`related` 필드와 `edges`를 따라가며 연결된 Decision도 확인하세요.

### 5단계: 답변 구성

```
## {질문}에 대한 답변

### 직접 관련 결정
📌 DEC-003: Redis를 캐시 레이어로 선택 (2026-03-22)
   > 읽기 10K/sec 처리 필요, PostgreSQL으로는 latency 초과
   > Memcached 대안 검토했으나 클러스터링 부족으로 기각

### 연결된 결정
   DEC-003 ──related-to──> DEC-007 (세션 스토리지 구조)
   DEC-003 ──depends-on──> DEC-001 (마이크로서비스 아키텍처)

### 요약
{왜 현재 코드가 이 형태인지 1-2문장 요약}
```

## 중요

- `.synaptic/` 없으면: "synaptic init을 먼저 실행하세요"
- 관련 Decision 없으면: "기록된 의사결정이 없습니다. /synaptic-extract로 추출하세요"
- 추측하지 마세요 — 기록된 Decision 기반으로만 답변
- Decision에 없는 내용은 "기록되지 않음"으로 명시
