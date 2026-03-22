# 세션에서 의사결정 추출

현재 대화를 분석하여 코드베이스 의사결정을 추출하고 `.synaptic/decisions/`에 저장합니다.

## 추출 대상

다음 패턴을 찾으세요:
- **기술 선택**: "A 대신 B를 선택", 라이브러리/프레임워크/패턴 선택
- **설계 결정**: 아키텍처, 데이터 모델, API 설계
- **트레이드오프**: 성능 vs 가독성, 단순함 vs 확장성
- **제약 기반 선택**: "~때문에 ~를 사용", "~한 제약으로 ~를 선택"

**제외**: 변수명, 포맷팅, import 순서 등 사소한 선택

## 프로세스

### 1단계: 추출
이 세션의 대화를 분석하여 의사결정 후보를 추출하세요.

### 2단계: 사용자에게 보여주기
각 후보를 다음 형식으로 보여주세요:

```
[1] JWT over Session for Authentication
    맥락: 마이크로서비스 간 인증이 필요, 세션 서버 의존성 제거 목표
    결정: Stateless JWT 사용
    대안: Session Cookie (서버 의존성), OAuth2 only (과도한 복잡도)
    태그: #auth #architecture
    관련 파일: src/auth/jwt.ts, src/middleware/auth.ts
```

"저장하시겠습니까? (수정할 항목 번호 또는 'y')"라고 물으세요.

### 3단계: 저장
승인 시 다음을 수행하세요:

1. `.synaptic/` 디렉토리 존재 확인 (없으면 `synaptic init` 안내)
2. `.synaptic/index.json`을 읽어 다음 ID 번호 확인
3. 각 의사결정을 마크다운 파일로 저장:

```yaml
---
id: DEC-{NNN}
title: "{title}"
date: "{오늘 날짜 YYYY-MM-DD}"
status: accepted
tags: [{tags}]
files: [{files}]
related: [{related decision IDs}]
---

## Context

{왜 이 결정이 필요했는가}

## Decision

{무엇을 선택했는가}

## Consequences

{장점과 단점}

## Alternatives

### {Alternative Name}
- Rejected because: {이유}
```

4. `.synaptic/index.json` 업데이트

## 중요

- **파일 생성 전 반드시 사용자 확인을 받으세요**
- 한 세션에서 의사결정이 없으면: "이 세션에서 추출할 의사결정이 없습니다"
- 이미 기록된 결정과 중복되면 스킵
- 관련 파일 경로는 프로젝트 루트 기준 상대 경로
