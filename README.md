# Alexa Skills Creation

This folder contains a minimal, scalable workflow for creating Alexa custom skills for home automation and logging.
Please note this is intended for personal custom skills and experimentation, not production deployment. 
In the current state, fully deploying these examples may expose endpoints or secrets if not configured carefully. 
This is not an issue if you intend to use the custom skills only on your personal account.

## Recommended Operating Model

Start with 3 Codex skills:

1. `alexa-automation-architect`
   - Entry point for new use cases.
   - Converts a request into an interaction model, backend contract, deployment plan, and test plan.
2. `alexa-console-operator`
   - Handles Alexa Developer Console work.
   - Creates and updates invocation names, intents, slots, utterances, builds, and test flows.
3. `automation-backend-operator`
   - Handles the backend side.
   - Supports Google Apps Script first, but is written to support generic REST APIs, Home Assistant, and local services.

This split keeps design separate from console clicking and backend deployment. That is the main scalability point.

## Default Execution Mode

The default mode is artifact generation plus guided execution steps.

Browser automation through MCP is optional and controlled by [`config/workflow-config.json`](config/workflow-config.json).

## Folder Layout

- [`skills`](skills): Codex skills for the workflow
- [`templates`](templates): reusable specs and intake forms
- [`references`](references): domain guidance and decision checklists
- [`config`](config): workflow defaults

## Suggested Workflow

1. Start with [`new-use-case-intake.md`](templates/new-use-case-intake.md).
2. Run the architect skill to produce an Alexa design spec.
3. Run the backend operator to define or deploy the endpoint.
4. Run the console operator to implement the Alexa skill.
5. Record the finished implementation in a runbook for that automation.
