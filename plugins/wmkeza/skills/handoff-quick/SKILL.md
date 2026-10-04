---
name: handoff-quick
description: Use when the user asks to wrap up the current conversation/session so it can continue in a new session, and wants a short, ready-to-paste handoff prompt without a specific structure (e.g. "別セッションでやるから引き継ぎプロンプト出して", "write a handoff prompt for a new session", "まとめて次のセッションに渡せるようにして").
---

# Handoff (Quick)

Produce a single handoff prompt the user can paste as the first message of a new session to continue the current conversation.

## Instructions

1. Review the conversation so far and identify what actually matters for continuing the work: the goal, where things currently stand, and what should happen next.
2. Write ONE self-contained prompt, in the same language the user has been using in this conversation, that:
   - States the goal/topic in one or two sentences.
   - Summarizes the current state and key context needed to continue.
   - States what the next step should be.
3. Keep it compact — this is the lightweight option. Do not impose section headers or a fixed template; write it as natural prose or a short list, whatever reads most naturally for this particular conversation.
4. Present it in a copy-pasteable block (e.g. a code block) so the user can grab it directly.
5. Reply with a one-line intro followed by the block, and nothing else.
