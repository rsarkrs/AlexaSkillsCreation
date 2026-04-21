# Baby Logger Example

This example package shows how to create a `Baby Logger` Alexa custom skill using the installed Codex skills.

Assumption: run these prompts from the `AlexaSkillsCreation` repository root.

## Files

- `examples\baby-logger\baby-logger-intake.md`
- `examples\baby-logger\baby-logger-design-spec.md`
- `examples\baby-logger\baby-logger-backend-contract.md`
- `examples\baby-logger\baby-logger-runbook.md`
- `examples\baby-logger\baby-logger-codex-guide.md`

## Installed Codex Skills

- `alexa-automation-architect`
- `alexa-console-operator`
- `automation-backend-operator`

## New Chat Kickoff Prompt

Use this in a new Codex chat:

```text
Use the alexa-automation-architect skill only. You must begin with the required Skill Validation block exactly as defined in the skill. Then continue with the task.

Create an Alexa custom skill for Baby Logger using the example documents in:
examples\baby-logger

Start by reviewing:
- examples\baby-logger\baby-logger-intake.md
- examples\baby-logger\baby-logger-design-spec.md
- examples\baby-logger\baby-logger-backend-contract.md
- examples\baby-logger\baby-logger-runbook.md

Use the installed Codex skills as needed:
- alexa-automation-architect
- alexa-console-operator
- automation-backend-operator

Default to guided artifact generation and step-by-step execution unless MCP browser automation is enabled.

Your first task is:
1. Validate the Baby Logger design
2. Identify any risky assumptions
3. Produce the implementation plan
4. Then begin creating the Alexa skill and backend artifacts
```

## Direct Execution Prompt

Use this if you want Codex to execute more aggressively from the start:

```text
Use the alexa-automation-architect, alexa-console-operator, and automation-backend-operator skills.

Build the Baby Logger Alexa skill from the example package at:
examples\baby-logger

Follow the workflow guide here:
examples\baby-logger\baby-logger-codex-guide.md

Default mode:
- generate artifacts
- provide guided execution steps
- only use MCP browser automation if enabled

Proceed in this order:
1. validate the design
2. finalize the interaction model
3. define the backend implementation
4. create the Alexa-side artifacts
5. produce the exact next step for deployment and testing
```

## Recommended Prompt

Use the `New Chat Kickoff Prompt` first. It is the cleanest way to test whether the installed skills are discoverable and usable without prior chat context.