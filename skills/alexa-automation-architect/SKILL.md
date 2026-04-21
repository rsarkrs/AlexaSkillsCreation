---
name: alexa-automation-architect
description: Use when designing a new Alexa custom skill or extending an existing one. Translates a use case into invocation strategy, intents, slots, utterances, backend contract, deployment steps, and test plan before console or backend work starts.
metadata:
  short-description: Design Alexa automation specs
---

# Alexa Automation Architect

Use this skill first for new Alexa automation requests.

## Purpose

Translate a user request into a concrete implementation plan before any console or backend work starts.

## Responsibilities

- Decide whether the interaction should be one-shot or multi-turn
- Define invocation naming constraints
- Define intents, slots, utterances, and confirmation phrases
- Define the backend request and response contract
- Choose the backend integration pattern
- Produce a testing and rollout checklist

## Validation Block

If the user explicitly asks to use this skill, start the first substantive response with this exact structure:

```text
Skill Validation
- Skill: alexa-automation-architect
- Trigger: explicit | inferred
- References used: <list the specific files or say none>
- Workflow step: <current step>
```

Rules:

- Put this block before analysis, plans, or implementation details
- Keep it to these four lines
- If you use bundled references, name them explicitly
- If this skill delegates to another skill, keep this block and then name the handoff clearly

## Required Outputs

For each new automation, produce:

1. Use case summary
2. Spoken interaction design
3. Intent and slot design
4. Backend payload contract
5. Deployment plan
6. Test plan
7. Follow-up risks or open questions

## Workflow

1. Read `references/new-use-case-intake.md` and collect any missing details.
2. Produce a design spec using `references/alexa-design-spec.md`.
3. If backend work is needed, hand off to the backend operator skill.
4. If Alexa console work is needed, hand off to the console operator skill.
5. Capture the finished implementation with `references/runbook-template.md`.

## Design Rules

- Prefer distinctive invocation names
- Avoid free-form slot designs that conflict with Alexa built-in slot limitations
- Prefer multi-turn collection over fragile one-shot parsing when the utterance shape is complex
- Keep backend contracts explicit and versionable
- If a design choice introduces avoidable ambiguity, raise it before implementation
