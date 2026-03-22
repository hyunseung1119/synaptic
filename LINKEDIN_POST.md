# LinkedIn 게시글

---

## 한국어 버전

새로 들어온 개발자가 물었습니다.
"이 캐시 왜 Redis 쓰나요? Memcached가 더 가벼운 거 아닌가요?"

아무도 대답 못 했습니다.
그 결정을 내린 사람은 6개월 전에 퇴사했고,
Slack은 90일 지나서 날아갔고,
ADR은 애초에 안 썼습니다.

결국 새 개발자는 2주 동안 코드를 뒤지면서 혼자 맥락을 파악했습니다.

이 상황이 반복되는 게 싫어서 직접 도구를 만들었습니다.

이름은 Synaptic.

Claude Code로 개발하면서 나누는 대화 —
"A 대신 B를 선택한 이유", "이 트레이드오프를 감수한 배경" 같은 것들을
자동으로 뽑아서 파일로 저장합니다.

나중에 누군가 "이거 왜 이래?" 하면
관련 결정을 바로 찾아줍니다. 결정 간의 관계도 추적되고요.

실제로 돌려보면 이런 느낌입니다:

synaptic search "Redis"
→ DEC-001: Redis를 캐시 레이어로 선택 (2026-03-22)

synaptic graph
→ DEC-001 ──related-to──→ DEC-003 (모노레포 구조)
→ DEC-002 ──depends-on──→ DEC-003

만들면서 중요하게 생각한 점:

별도 API 키가 필요 없습니다.
Claude Code 자체가 LLM이라서 스킬만 설치하면 됩니다.
저장은 로컬 마크다운 + JSON이고, git으로 같이 관리할 수 있습니다.

올해 들어서 Harness Engineering, Context Engineering 같은 키워드가
계속 나오고 있는데, 공통점은 하나입니다.
"모델을 바꾸지 말고, 모델이 일하는 환경을 바꿔라."

Synaptic은 그 환경 중에서도 가장 빠지기 쉬운 것 —
"왜 이런 결정을 내렸는지"를 채우는 도구입니다.

GitHub 공개해뒀습니다. 피드백 환영합니다.
https://github.com/hyunseung1119/synaptic

#개발자도구 #ClaudeCode #ContextEngineering #HarnessEngineering #OpenSource

---

## English Version

A new developer asked:
"Why are we using Redis for caching? Isn't Memcached lighter?"

Nobody could answer.
The person who made that call left 6 months ago.
Slack history expired. No ADR was ever written.

So the new dev spent 2 weeks digging through code,
piecing together context that once lived in someone's head.

I got tired of watching this happen, so I built a tool.

It's called Synaptic.

When you develop with Claude Code, you naturally discuss tradeoffs —
"Let's go with A over B because of X."
Synaptic extracts those decisions automatically and saves them as files.

Later, when someone asks "why is this code like this?"
it finds the relevant decisions instantly.
It even tracks how decisions relate to each other.

What it looks like in practice:

synaptic search "Redis"
→ DEC-001: Selected Redis as cache layer (2026-03-22)

synaptic graph
→ DEC-001 ──related-to──→ DEC-003 (monorepo structure)
→ DEC-002 ──depends-on──→ DEC-003

A few things I cared about:

No separate API key needed.
Claude Code itself is the LLM — just install the skills.
Storage is local markdown + JSON, version-controlled with git.

This year, Harness Engineering and Context Engineering
keep coming up. The common thread:
"Don't change the model. Change the environment the model works in."

Synaptic fills the most commonly missing piece of that environment —
the record of WHY decisions were made.

Open sourced on GitHub. Feedback welcome.
https://github.com/hyunseung1119/synaptic

#DeveloperTools #ClaudeCode #ContextEngineering #HarnessEngineering #OpenSource
