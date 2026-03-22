#!/bin/bash
# synaptic-reminder.sh — 세션 종료 시 의사결정 추출 리마인더
# Claude Code Stop 훅으로 등록

SYNAPTIC_DIR=".synaptic"

# .synaptic 디렉토리가 있는 프로젝트에서만 동작
if [ ! -d "$SYNAPTIC_DIR" ]; then
  exit 0
fi

# 세션당 1회만 (lock)
LOCK_FILE="/tmp/synaptic-reminder-${CLAUDE_SESSION_ID:-$$}.lock"
if [ -f "$LOCK_FILE" ]; then
  exit 0
fi
touch "$LOCK_FILE"

# 코드 변경이 있었는지 확인
CHANGES=$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')
if [ "$CHANGES" -gt "0" ]; then
  cat <<EOF
{"decision":"block","reason":"[Synaptic] 이 세션에서 ${CHANGES}개 파일이 변경되었습니다. 의사결정을 기록하려면 /synaptic-extract를 실행하세요. 기록할 것이 없으면 '건너뛰기'라고 답하세요."}
EOF
else
  exit 0
fi
