---
name: automation-backend-operator
description: Use when implementing or updating the backend called by an Alexa custom skill. Supports Google Apps Script, Google Sheets/Docs/Drive integrations, generic REST APIs, Home Assistant, and local webhook services.
metadata:
  short-description: Build Alexa automation backends
---

# Automation Backend Operator

Use this skill for the backend that an Alexa custom skill calls.

## Purpose

Implement or update the service behind the Alexa skill, with Google Apps Script as the first-class path and generic automation backends also supported.

## Supported Backend Patterns

- Google Apps Script web apps
- Google Sheets / Docs / Drive integrations through Apps Script
- Generic REST APIs
- Home Assistant services
- Local webhooks and lightweight LAN services

## Responsibilities

- Define request and response contracts
- Create or update backend code and deployment steps
- Validate payload shape
- Document auth, headers, versioning, and error behavior
- Produce backend-specific verification steps

## Validation Block

If the user explicitly asks to use this skill, start the first substantive response with this exact structure:

```text
Skill Validation
- Skill: automation-backend-operator
- Trigger: explicit | inferred
- References used: <list the specific files or say none>
- Workflow step: <current step>
```

Rules:

- Put this block before analysis, plans, or implementation details
- Keep it to these four lines
- If you use bundled references, name them explicitly
- If you are following a backend contract document, name it in `References used`

## Required Outputs

1. Endpoint description
2. Request schema
3. Response schema
4. Deployment or update procedure
5. Verification procedure
6. Failure-mode notes

## Workflow

1. Confirm the target backend pattern with `references/backend-patterns.md`.
2. Define a simple, explicit request contract.
3. Keep the response contract small and Alexa-friendly.
4. Document deployment and verification separately from runtime behavior.

## Notes

- Prefer explicit action names and JSON payloads
- For Google Apps Script, document both the script logic and the deployed web app behavior
- If the backend is fragile or externally hosted, define fallback and logging behavior early
