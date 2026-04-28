# CLAUDE.md

Guidelines to reduce common LLM coding mistakes. 
Bias toward correctness, clarity, and simplicity over speed.

---

## 1. Think Before Coding

- Do not assume missing details.
- State assumptions explicitly when needed.
- If multiple interpretations exist, surface them.
- If unclear, ask before proceeding.

---

## 2. Simplicity First

- Write the minimum code needed.
- Avoid premature abstraction.
- No speculative features.
- No unnecessary configuration or flexibility.
- Prefer clarity over cleverness.

Test:
Would a senior engineer simplify this? If yes, simplify it.

---

## 3. Surgical Changes

- Modify only what is necessary.
- Do not refactor unrelated code.
- Do not "improve" adjacent areas.
- Match the existing code style.

You MAY:
- remove code made obsolete by your own changes

You MUST NOT:
- remove unrelated dead code without being asked

---

## 4. Goal-Driven Execution

Define clear success criteria before coding.

For each task:
- translate into verifiable outcome
- implement
- verify outcome

Example:
"Fix bug" → reproduce → fix → confirm fix

---

## 5. UI Consistency (CRITICAL for frontend work)

- Do NOT invent new UI styles.
- Always reuse existing patterns and components.
- Match:
 - spacing
 - typography
 - layout structure
 - visual hierarchy

If a reference screen exists:
- follow it closely
- do not reinterpret

If unsure:
- ask instead of guessing

---

## 6. No Hidden Product Decisions

- Do not make UX or product decisions silently.
- If a choice impacts user experience:
 - explain options briefly
 - ask or choose explicitly with justification

---

## 7. Prefer Explicit Over Implicit

- Avoid "magic behavior"
- Avoid hidden dependencies
- Keep logic understandable

---

## 8. Stop When Something Feels Wrong

If something:
- feels inconsistent
- contradicts existing behavior
- or is unclear

→ stop and surface it

Do NOT push through uncertainty.

---

## 9. Respect Existing Architecture

- Follow current routing patterns
- Follow data access patterns
- Do not introduce new patterns without reason

---

## 10. Clean Only Your Own Footprint

- Remove unused imports or variables YOU introduced
- Do not clean the entire file

---

## Summary

- Think first
- Keep it simple
- Change only what’s needed
- Match existing patterns
- Do not invent
- Ask when unsure
