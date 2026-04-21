# Baby Logger Intake

## Use Case

- Name: Baby Logger
- Goal: Log common baby care events by voice through Alexa
- Category:
  - Logging
  - Multi-step workflow

## User Interaction

- Desired invocation phrase: `Alexa, ask baby tracker ...`
- Invocation note: `baby logger` was less reliable on a physical device; use `baby tracker` for the example default.
- Desired spoken commands:
  - `log a pee diaper`
  - `log a poop diaper`
  - `log a mixed diaper`
  - `log a bottle feeding of 4 ounces`
  - `log a bottle feeding of 120 milliliters`
  - `log breastfeeding for 12 minutes`
  - `start breastfeeding`
  - `stop breastfeeding`
  - `log tummy time for 7 minutes`
  - `start tummy time`
  - `stop tummy time`
- One-shot or multi-turn preference: one-shot for direct logs, timer-based multi-step for breastfeeding and tummy time
- Confirmation response needed: yes
- Error response preference: ask a short corrective question when required data is missing

## Data Contract

- Target backend: Google Apps Script web app or other REST backend
- Action names:
  - `logDiaper`
  - `logBottleFeeding`
  - `logBreastFeeding`
  - `startBreastFeedingTimer`
  - `stopBreastFeedingTimer`
  - `logTummyTime`
  - `startTummyTimeTimer`
  - `stopTummyTimeTimer`
- Required fields:
  - diaper type for diaper logs
  - amount and unit for bottle feeds
  - duration minutes for direct breastfeeding and tummy time logs
- Optional fields:
  - note
  - baby name if needed later
- Authentication requirements: endpoint-specific secret or bearer token if exposed beyond a private environment

## Deployment Target

- Alexa locale: `en-US`
- Backend platform: Google Apps Script first
- Needs browser/MCP execution: optional

## Notes

- Constraints:
  - Keep first version simple and reliable
  - Avoid fragile free-form inputs
  - Prefer backend-generated timestamps
- Future extensions:
  - support baby name slot
  - support diaper notes
  - support nursing side tracking
  - support bottle content type
