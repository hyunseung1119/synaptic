# 코드베이스 온보딩 학습 경로 생성

의사결정 그래프를 기반으로 코드베이스 이해를 위한 최적 학습 경로를 생성합니다.

## 사용법

```
/synaptic-onboard
/synaptic-onboard auth        # 특정 도메인만
/synaptic-onboard --quick     # 핵심 5개만
```

## 프로세스

### 1단계: 인덱스 로드
`.synaptic/index.json`을 읽어 전체 Decision과 그래프 엣지를 파악하세요.

### 2단계: 위상 정렬
`depends-on` 관계를 기반으로 학습 순서를 결정하세요:
- 의존성이 없는 Decision = 기초 결정 (먼저 학습)
- depends-on 체인을 따라 점진적으로 심화

### 3단계: 도메인 필터링 (인자가 있을 때)
태그를 기반으로 특정 도메인의 Decision만 필터링하세요.

### 4단계: 학습 경로 출력

```markdown
# 코드베이스 온보딩 가이드
> {projectName} | {총 Decision 수}개 의사결정 기록

## 1단계: 기초 (Foundation)
이 결정들이 모든 것의 기반입니다.

### DEC-001: 모노레포 구조 선택
- 📁 읽을 파일: package.json, turbo.json
- 💡 핵심: 왜 모노레포를 선택했는가
- ⏱ 예상: 10분

### DEC-002: TypeScript strict mode
- 📁 읽을 파일: tsconfig.json
- 💡 핵심: 왜 strict인가
- ⏱ 예상: 5분

## 2단계: 아키텍처 (Architecture)
기초 위에 세워진 구조적 결정입니다.

### DEC-005: REST over GraphQL
- 📁 읽을 파일: src/api/routes/
- 💡 핵심: API 스타일 선택 근거
- 🔗 선행: DEC-001에 의존
- ⏱ 예상: 15분

## 3단계: 도메인 (Domain)
각 기능 영역의 핵심 결정입니다.
...

---
총 예상 시간: ~2시간
핵심 파일 목록: [파일 경로 리스트]
```

## 중요

- Decision이 3개 미만이면: "아직 의사결정이 부족합니다. /synaptic-extract로 더 기록하세요"
- 각 Decision에 반드시 "읽을 파일" 포함 (코드와 연결)
- 순환 의존성 발견 시 경고 표시
- 예상 시간은 Decision당 5-15분으로 추정
