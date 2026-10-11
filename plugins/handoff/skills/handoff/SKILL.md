---
name: handoff
description: Use when the user asks to wrap up the current conversation/session so it can continue in a new session — a short, ready-to-paste handoff prompt, or one with explicit sections covering goals, options considered, and decisions (e.g. "別セッションでやるから引き継ぎプロンプト出して", "まとめて次のセッションに渡せるようにして", "項目が決まってる引き継ぎプロンプト", "決定事項とか却下案も含めて引き継いで", "write a handoff prompt for a new session", "structured handoff prompt").
---

# Handoff

Produce a single handoff prompt the user can paste as the first message of a new session to continue the current conversation.

## Choose the form

There are two forms: **short** and **structured**. Pick one before writing.

1. If the user asked for a form, use it.
   - Short: wording like "短く", "サクッと", "一言で", "凝ったのじゃなくていい", "nothing fancy".
   - Structured: wording like "項目ごと", "項目が決まってる", "却下案も", "決定事項も", "理由も含めて", "structured".
2. Otherwise, decide from the conversation itself.
   - Structured if the conversation compared options, or decided or rejected something — the reasoning behind those choices is what a short summary loses.
   - Short otherwise.

## Short form

1. Review the conversation so far and identify what actually matters for continuing the work: the goal, where things currently stand, and what should happen next.
2. Write ONE self-contained prompt, in the same language the user has been using in this conversation, that:
   - States the goal/topic in one or two sentences.
   - Summarizes the current state and key context needed to continue.
   - States what the next step should be.
3. Keep it compact. Do not impose section headers or a fixed template; write it as natural prose or a short list, whatever reads most naturally for this particular conversation.

## Structured form

1. Review the full conversation, not just the most recent messages. Brainstorms often reject ideas early on for reasons that matter later — don't lose those.
2. Write ONE self-contained prompt, in the same language the user has been using in this conversation, with these sections, in this order:
   - **目的・ゴール** — what this conversation is trying to achieve.
   - **検討した案とその評価** — each option that was discussed, whether it was adopted or rejected, and why. This is the section most likely to be shortchanged — do not skip the "why" for rejected options.
   - **決定事項とその理由** — what was actually decided, and the reasoning, not just the conclusion.
   - **次にやること** — concrete next step(s).
   - **避けるべきこと・注意点** — dead ends, constraints, or pitfalls already discovered, so they aren't rediscovered.
3. If a section has nothing to report, state that briefly rather than omitting the heading — an empty "検討した案" section is itself useful information (it means nothing has been ruled out yet).

## Reply

Present the prompt in a copy-pasteable block (e.g. a code block) so the user can grab it directly. Reply with a one-line intro followed by the block, and nothing else.
