---
name: handoff-structured
description: Use when the user asks to wrap up the current conversation/session (especially a brainstorm or open-ended discussion) so it can continue in a new session, and wants a handoff prompt with explicit sections covering goals, options considered, and decisions — not just a short summary (e.g. "項目が決まってる引き継ぎプロンプト", "structured handoff prompt", "決定事項とか却下案も含めて引き継いで").
---

# Handoff (Structured)

Produce a handoff prompt the user can paste as the first message of a new session to continue the current conversation, organized under fixed sections so nothing important — especially reasoning behind decisions — gets lost.

## Instructions

1. Review the full conversation, not just the most recent messages. Brainstorms often reject ideas early on for reasons that matter later — don't lose those.
2. Write ONE self-contained prompt, in the same language the user has been using in this conversation, with these sections, in this order:
   - **目的・ゴール** — what this conversation is trying to achieve.
   - **検討した案とその評価** — each option that was discussed, whether it was adopted or rejected, and why. This is the section most likely to be shortchanged — do not skip the "why" for rejected options.
   - **決定事項とその理由** — what was actually decided, and the reasoning, not just the conclusion.
   - **次にやること** — concrete next step(s).
   - **避けるべきこと・注意点** — dead ends, constraints, or pitfalls already discovered, so they aren't rediscovered.
3. If a section has nothing to report, state that briefly rather than omitting the heading — an empty "検討した案" section is itself useful information (it means nothing has been ruled out yet).
4. Present it in a copy-pasteable block (e.g. a code block) so the user can grab it directly.
5. Reply with a one-line intro followed by the block, and nothing else.
