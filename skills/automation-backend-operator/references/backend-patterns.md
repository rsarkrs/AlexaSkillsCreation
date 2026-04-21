# Backend Patterns

## Google Apps Script

Use when the target system is Google Sheets, Docs, or Drive, or when a lightweight web app endpoint is sufficient.

Recommended shape:

- explicit `action`
- structured JSON `payload`
- clear deployment versioning

## Generic REST API

Use when the target system already exposes an HTTP endpoint.

Recommended shape:

- stable endpoint path
- explicit auth model
- strict request and response schema

## Home Assistant

Use when the automation controls entities, services, or state in Home Assistant.

Recommended shape:

- map utterances to service calls
- keep entity resolution deterministic
- document required credentials and network assumptions

## Local Webhook

Use when the automation calls a LAN service or personal server.

Recommended shape:

- explicit network reachability assumptions
- retry and timeout behavior
- logging plan for device-to-backend failures
