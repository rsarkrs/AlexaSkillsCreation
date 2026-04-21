# Baby Logger Runbook

## Skill Identity

- Skill name: `Baby Logger`
- Recommended invocation name: `baby tracker`
- Previous invocation name tested: `baby logger`
- Locale: `en-US`
- Stage: development

## Invocation Notes

- `baby tracker` is the recommended invocation name because it worked more reliably on a physical device.
- `baby logger` can work in the Test console but fail or route poorly on a physical device.
- After changing the invocation name, rebuild the interaction model, deploy the skill, then disable and re-enable the dev skill in the Alexa app.
- Test launch first with `Alexa, open baby tracker`; only debug intents after the launch phrase works.

## Working Phrases

- `Alexa, open baby tracker`
- `Alexa, ask baby tracker to log a pee diaper`
- `Alexa, ask baby tracker to log a wet diaper`
- `Alexa, ask baby tracker to log wet diaper`
- `Alexa, ask baby tracker to log a poop diaper`
- `Alexa, ask baby tracker to log a mixed diaper`
- `Alexa, ask baby tracker to log a bottle feeding of 4 ounces`
- `Alexa, ask baby tracker to log a bottle feeding of 120 milliliters`
- `Alexa, ask baby tracker to log breastfeeding for 12 minutes`
- `Alexa, ask baby tracker to start breastfeeding`
- `Alexa, ask baby tracker to stop breastfeeding`
- `Alexa, ask baby tracker to log tummy time for 7 minutes`
- `Alexa, ask baby tracker to start tummy time`
- `Alexa, ask baby tracker to stop tummy time`

## Backend

- Primary backend pattern: Google Apps Script web app
- Alexa adapter: Alexa-hosted Node.js handler that posts form-encoded requests to Apps Script
- Request shape: form-encoded `action` and `payload`
- Optional protection: shared secret form field `token`
- Timer storage: `SessionState` tab or equivalent persistent store

## Generated Artifacts

- Validation: [baby-logger-validation.md](baby-logger-validation.md)
- Plan: [baby-logger-implementation-plan.md](baby-logger-implementation-plan.md)
- Interaction model: [interaction-model.json](alexa-skill/interaction-model.json)
- Alexa handler: [index.js](alexa-skill/lambda/index.js)
- Apps Script backend: [Code.gs](backend/google-apps-script/Code.gs)

## Test Results Checklist

- Interaction model builds successfully after setting invocation name to `baby tracker`
- Hosted `package.json` includes `ask-sdk-model`
- Hosted `index.js` contains JavaScript handler code, not package JSON
- Hosted `index.js` has a real Apps Script `/exec` URL and matching shared secret
- Simulator resolves each direct command correctly
- Simulator start and stop timer commands work in sequence
- Simulator can log a diaper and receives a valid JSON response
- Real device launches the dev skill correctly
- Real device captures `ounces` and `milliliters` correctly
- Real device does not confuse `tummy time` with unrelated utterances

## Known Error Fixes

### `Cannot find module 'ask-sdk-model'`

- Where it appears: CloudWatch logs for the Alexa-hosted Lambda.
- Cause: hosted `lambda/package.json` does not declare `ask-sdk-model`.
- Fix: add `"ask-sdk-model": "^1.0.0"` under `dependencies`, save, and deploy.

### `SyntaxError: Unexpected token ':'`

- Where it appears: CloudWatch logs during Lambda init.
- Cause: `index.js` was accidentally overwritten with JSON, usually `package.json` content.
- Fix: restore the JavaScript handler to `index.js`, save, and deploy.

### `The Baby Logger backend URL is not configured.`

- Where it appears: Alexa speech response after an intent reaches Lambda.
- Cause: `BACKEND_URL` is blank or still contains the placeholder value.
- Fix: set the Apps Script deployed `/exec` URL in `index.js` or hosted environment configuration, then deploy.

### `The backend returned an invalid response.`

- Where it appears: Alexa speech response after the sheet row is successfully written.
- Cause: Lambda posted to Apps Script but tried to parse a redirect or non-JSON intermediate response.
- Fix: use the redirect-aware `callBackend` implementation in [index.js](alexa-skill/lambda/index.js).

### Simulator Works But Physical Device Does Not Launch

- Cause: device-side dev skill cache, account/profile mismatch, locale mismatch, or weak invocation name.
- Fix: use `baby tracker`, confirm device language is `English (United States)`, disable and re-enable the dev skill from `Alexa app -> Skills & Games -> Your Skills -> Dev`, then wait 2-5 minutes.

## Common Updates

- add baby name support
- add notes or tags
- split breastfeeding into left and right side
- add wake, sleep, and medication logging

## Risky Changes

- changing invocation name after users learn it
- using an invocation name that works in simulator but is not distinctive enough on device
- mixing free-form text with too many other slots in one utterance
- adding timer state without a reliable persistent store
- changing the diaper normalization contract between `mixed` and `both`
