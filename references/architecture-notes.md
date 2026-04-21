# Architecture Notes

## Minimal Scalable Pattern

Use this path by default:

`Alexa voice request -> custom skill -> hosted Lambda or equivalent backend adapter -> target automation service`

For Google-backed logging:

`Alexa -> custom skill -> Alexa-hosted Node.js backend -> Google Apps Script web app -> Sheets/Docs/Drive`

## Why 3 Skills

- The architect skill owns design decisions
- The console operator owns Alexa implementation details
- The backend operator owns service contracts and deployment

If these are merged too early, the workflow becomes harder to reuse and harder to debug.

## When to Add More Skills

Add a separate specialist skill only when one domain has enough unique rules to justify it, such as:

- Home Assistant entity/service automation
- Local-network service discovery
- A specific cloud provider deployment flow
