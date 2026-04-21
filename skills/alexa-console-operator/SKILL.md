---
name: alexa-console-operator
description: Use when work must be performed in the Amazon Alexa Developer Console. Covers skill creation, invocation names, intents, slots, utterances, build/test flows, device-routing issues, and optional MCP-driven browser operation.
metadata:
  short-description: Operate Alexa Developer Console
---

# Alexa Console Operator

Use this skill when work must be done in the Alexa Developer Console.

## Purpose

Implement and debug the Alexa-specific side of a custom skill.

## Responsibilities

- Create or update the skill in Amazon Developer Console
- Configure invocation names, intents, slots, and sample utterances
- Build interaction models
- Run simulator tests
- Verify development-stage settings
- Debug routing, invocation, locale, and account issues

## Validation Block

If the user explicitly asks to use this skill, start the first substantive response with this exact structure:

```text
Skill Validation
- Skill: alexa-console-operator
- Trigger: explicit | inferred
- References used: <list the specific files or say none>
- Workflow step: <current step>
```

Rules:

- Put this block before analysis, plans, or implementation details
- Keep it to these four lines
- If you use bundled references, name them explicitly
- If MCP browser automation is being used, state that in `Workflow step`

## Execution Mode

- Default to guided execution steps and artifact generation
- Use browser MCP automation only when explicitly requested or when local workflow settings allow it

## Required Checks

- Invocation name is distinctive and valid
- Locale matches the intended device locale
- Interaction model builds successfully
- Test stage is enabled for development
- Real-device phrasing uses Alexa-supported invocation patterns

## Workflow

1. Verify the current console page before making changes.
2. Apply the interaction model from the architect skill.
3. Build and confirm success.
4. Run simulator checks.
5. If real-device testing fails, use `references/debugging-checklist.md`.

## Notes

- Prefer `ask` or `open` phrasing when testing custom skills
- If simulator passes and device fails, suspect account, locale, dev-skill enablement, or stale model propagation
