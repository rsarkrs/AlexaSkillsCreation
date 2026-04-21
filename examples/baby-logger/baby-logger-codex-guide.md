# Baby Logger Codex Workflow Guide

This guide shows how to use your Codex skills to create the `Baby Logger` Alexa skill end to end.

Assumption: run these prompts from the `AlexaSkillsCreation` repository root.

## Files To Use

- Intake: `examples\baby-logger\baby-logger-intake.md`
- Design spec: `examples\baby-logger\baby-logger-design-spec.md`
- Backend contract: `examples\baby-logger\baby-logger-backend-contract.md`
- Runbook: `examples\baby-logger\baby-logger-runbook.md`

## Step 1: Start With The Architect Skill

Use the `alexa-automation-architect` skill first.

Prompt pattern:

```text
Use the alexa-automation-architect skill.
Create an Alexa design for Baby Logger using the intake file at
examples\baby-logger\baby-logger-intake.md
Write or update the design spec and identify any risky assumptions.
```

Expected result:

- finalized invocation strategy
- final list of intents and slots
- confirmation that timer flows should stay split into start and stop intents

## Step 2: Build The Backend Contract

Use the `automation-backend-operator` skill next.

Prompt pattern:

```text
Use the automation-backend-operator skill.
Implement the backend contract for Baby Logger based on
examples\baby-logger\baby-logger-backend-contract.md
Assume Google Apps Script as the first backend target and document the sheet tabs and deployment steps.
```

Expected result:

- Apps Script handler plan
- sheet tab schema
- deployment steps for the web app
- timer state strategy

## Step 3: Implement The Alexa Console Side

Use the `alexa-console-operator` skill after the contract is stable.

Prompt pattern:

```text
Use the alexa-console-operator skill.
Implement Baby Logger in the Alexa Developer Console using
examples\baby-logger\baby-logger-design-spec.md
Default to guided execution unless MCP browser automation is available and enabled.
```

Expected result:

- skill created or updated in the Alexa Developer Console
- interaction model configured
- model built successfully
- simulator test results captured

## Step 4: Connect Lambda To The Backend

Have Codex wire the Alexa handler to the backend contract.

Prompt pattern:

```text
Use the automation-backend-operator and alexa-console-operator skills.
Wire the Baby Logger Lambda handler to the backend actions defined in
examples\baby-logger\baby-logger-backend-contract.md
Return the exact test utterances to use in the simulator.
```

Expected result:

- handler routes each intent to the matching backend action
- timer start and stop intents are connected
- confirmation messages match backend responses

## Step 5: Run Simulator Tests

Test these first:

- `log a pee diaper`
- `log a bottle feeding of 4 ounces`
- `log breastfeeding for 12 minutes`
- `start breastfeeding`
- `stop breastfeeding`
- `log tummy time for 7 minutes`
- `start tummy time`
- `stop tummy time`

Also test failure cases:

- bottle feed without amount
- breastfeeding without minutes
- stop timer without a matching active timer

## Step 6: Run Real Device Tests

Use:

- `Alexa, open baby tracker`
- `Alexa, ask baby tracker to log a poop diaper`
- `Alexa, ask baby tracker to log a wet diaper`
- `Alexa, ask baby tracker to log wet diaper`
- `Alexa, ask baby tracker to log a bottle feeding of 120 milliliters`
- `Alexa, ask baby tracker to start breastfeeding`
- `Alexa, ask baby tracker to stop breastfeeding`
- `Alexa, ask baby tracker to start tummy time`
- `Alexa, ask baby tracker to stop tummy time`

If device tests fail while the simulator works, use the console operator skill and check:

- invocation name distinctiveness; prefer `baby tracker` over `baby logger`
- account alignment
- locale alignment
- dev-skill enablement
- model propagation delay
- whether the dev skill needs to be disabled and re-enabled in the Alexa app

## Step 7: Record The Working State

When the skill works, update the runbook.

Prompt pattern:

```text
Use the alexa-automation-architect skill.
Update the Baby Logger runbook at
examples\baby-logger\baby-logger-runbook.md
with the final invocation name, working utterances, backend endpoint, and known issues.
```

## Recommended First Implementation Boundary

Keep v1 limited to:

- diaper logging
- bottle feeding logging
- direct breastfeeding duration logging
- breastfeeding start and stop timer
- direct tummy time logging
- tummy time start and stop timer

Do not add these until v1 is stable:

- baby name slot
- nursing side tracking
- notes
- medication or sleep logging
