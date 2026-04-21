# Baby Logger Implementation Plan

## Delivery Order

1. Finalize design decisions and normalize risky assumptions.
2. Create the Google Apps Script backend artifacts.
3. Create the Alexa interaction model artifact.
4. Create the Alexa-hosted Node handler that maps intents to backend actions.
5. Update the runbook with concrete deployment and verification steps.

## Alexa Skill Plan

- Skill type: custom skill with Alexa-hosted Node.js backend.
- Recommended invocation name: `baby tracker`.
- Do not default to `baby logger`; it can pass simulator tests while still routing poorly on a physical device.
- Locale: `en-US`.
- Intents:
  - `LogDiaperIntent`
  - `LogBottleFeedingIntent`
  - `LogBreastFeedingIntent`
  - `StartBreastFeedingTimerIntent`
  - `StopBreastFeedingTimerIntent`
  - `LogTummyTimeIntent`
  - `StartTummyTimeTimerIntent`
  - `StopTummyTimeTimerIntent`
  - `AMAZON.HelpIntent`
  - `AMAZON.CancelIntent`
  - `AMAZON.StopIntent`
- Slot strategy:
  - custom `DIAPER_TYPE` with `pee`, `poop`, `both` and spoken synonym `mixed`
  - built-in `AMAZON.NUMBER` for amount and duration
  - custom `VOLUME_UNIT` with normalized IDs `oz` and `ml`

## Backend Plan

- Target: Google Apps Script web app.
- HTTP shape: `POST` with form fields `action`, `payload`, and optional `token`.
- Adapter requirement: follow Apps Script redirects and only preserve the POST body for `307` and `308` redirects to avoid duplicate writes.
- Storage tabs:
  - `Diapers`
  - `Feedings`
  - `TummyTime`
  - `SessionState`
- Validation:
  - reject invalid diaper types
  - reject missing bottle amount or unit
  - reject non-positive durations
  - reject stop requests with no matching active timer
- Response shape: small Alexa-friendly JSON with `ok`, `message`, and normalized fields.

## Guided Execution Steps

1. Copy the interaction model JSON into the Alexa Developer Console.
2. Create an Alexa-hosted Node.js skill endpoint and paste the generated handler.
3. Confirm hosted `lambda/package.json` includes `ask-sdk-core` and `ask-sdk-model`.
4. Create a Google Sheet with the required tabs or let the Apps Script code create them.
5. Deploy the Apps Script as a web app.
6. Put the Apps Script `/exec` URL and shared secret into Alexa-hosted configuration or the top-level constants in `index.js`.
7. Confirm placeholder detection still checks placeholder strings, not the real URL or real secret.
8. Build the interaction model.
9. Deploy the Alexa-hosted code after both `index.js` and `package.json` are correct.
10. Run simulator tests for launch, one-shot logging, and timer flows.
11. Run real-device tests after confirming the dev skill is enabled on the same Amazon account.

## Preflight Checks

- Interaction model invocation name is `baby tracker`.
- `package.json` contains `"ask-sdk-model": "^1.0.0"`; otherwise CloudWatch reports `Cannot find module 'ask-sdk-model'`.
- `index.js` is JavaScript, not accidentally overwritten with package JSON; otherwise CloudWatch reports `SyntaxError: Unexpected token ':'`.
- Backend URL uses the deployed Apps Script `/exec` URL, not `/dev`.
- Shared secret matches the Apps Script project property `BABY_LOGGER_SHARED_SECRET`.
- `callBackend` follows Apps Script redirects; otherwise Sheets may log the row while Alexa says `The backend returned an invalid response.`
- Test console launch works before physical-device debugging.

## Artifacts

- Validation: [baby-logger-validation.md](baby-logger-validation.md)
- Alexa model: [interaction-model.json](alexa-skill/interaction-model.json)
- Alexa handler: [index.js](alexa-skill/lambda/index.js)
- Apps Script backend: [Code.gs](backend/google-apps-script/Code.gs)
