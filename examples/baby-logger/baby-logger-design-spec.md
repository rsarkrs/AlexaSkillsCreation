# Baby Logger Design Spec

## Summary

- Use case: Voice logging for diaper changes, feeding events, and tummy time
- Skill name: `Baby Logger`
- Recommended invocation name: `baby tracker`
- Avoided invocation name: `baby logger`
- Locale: `en-US`
- Skill type: custom skill with Alexa-hosted Node.js adapter in front of the logging backend

## Invocation Strategy

- Use `baby tracker` as the default invocation name for this example.
- `baby logger` passed simulator-level checks but was less reliable on a physical Alexa device.
- The invocation name should be distinctive, easy to pronounce, and tested on the target device before spending time debugging backend code.
- Keep the public skill name `Baby Logger` if desired; the spoken invocation name does not need to match the display name.

## Interaction Model

- Launch behavior:
  - `Welcome to Baby Logger. You can log a diaper, feeding, or tummy time event.`
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
- Slots:
  - `diaperType`
    - custom slot `DIAPER_TYPE`
    - values: `pee`, `poop`, `both`
    - synonym: `wet` resolves to `pee`
    - synonym: `mixed` resolves to `both`
  - `amount`
    - built-in slot `AMAZON.NUMBER`
  - `volumeUnit`
    - custom slot `VOLUME_UNIT`
    - values: `ounces`, `ounce`, `oz`, `milliliters`, `milliliter`, `ml`
  - `durationMinutes`
    - built-in slot `AMAZON.NUMBER`
- Sample utterances:
  - `log a {diaperType} diaper`
  - `record a {diaperType} diaper`
  - `log wet diaper`
  - `log a bottle feeding of {amount} {volumeUnit}`
  - `record a bottle feeding of {amount} {volumeUnit}`
  - `log breastfeeding for {durationMinutes} minutes`
  - `record breastfeeding for {durationMinutes} minutes`
  - `start breastfeeding`
  - `stop breastfeeding`
  - `log tummy time for {durationMinutes} minutes`
  - `record tummy time for {durationMinutes} minutes`
  - `start tummy time`
  - `stop tummy time`
- Multi-turn flow:
  - direct logging is one-shot
  - breastfeeding timer is a start and stop pair
  - tummy time timer is a start and stop pair

## Response Design

- Successful diaper log:
  - `Logged a pee diaper.`
- Successful bottle feed log:
  - `Logged a bottle feeding of 4 ounces.`
- Successful direct breast feed log:
  - `Logged breastfeeding for 12 minutes.`
- Successful timer start:
  - `Started breastfeeding timer.`
  - `Started tummy time timer.`
- Successful timer stop:
  - `Logged breastfeeding for 18 minutes.`
  - `Logged tummy time for 9 minutes.`
- Missing data:
  - `I need the amount and unit for a bottle feeding.`
  - `I need the number of minutes to log that directly.`
- Timer not running:
  - `There is no active breastfeeding timer.`
  - `There is no active tummy time timer.`

## Backend Contract

- Endpoint: backend-specific
- Method: `POST`
- Headers:
  - `Content-Type: application/x-www-form-urlencoded` for Apps Script compatibility
  - avoid custom auth headers for Apps Script web apps
- Request body:
  - `action=<actionName>`
  - `payload=<json>`
  - `token=<sharedSecret>` when backend protection is enabled
- Response behavior:
  - JSON success flag and optional normalized values used in spoken confirmation

## Suggested Payloads

- `logDiaper`
```json
{
  "loggedAt": "2026-04-16T15:30:00-07:00",
  "diaperType": "pee"
}
```

- `logBottleFeeding`
```json
{
  "loggedAt": "2026-04-16T15:35:00-07:00",
  "amount": 4,
  "unit": "oz",
  "amountMl": 118.29
}
```

- `logBreastFeeding`
```json
{
  "loggedAt": "2026-04-16T15:40:00-07:00",
  "durationMinutes": 12
}
```

- `startBreastFeedingTimer`
```json
{
  "startedAt": "2026-04-16T15:45:00-07:00"
}
```

- `stopBreastFeedingTimer`
```json
{
  "stoppedAt": "2026-04-16T16:03:00-07:00"
}
```

- `logTummyTime`
```json
{
  "loggedAt": "2026-04-16T16:10:00-07:00",
  "durationMinutes": 7
}
```

- `startTummyTimeTimer`
```json
{
  "startedAt": "2026-04-16T16:20:00-07:00"
}
```

- `stopTummyTimeTimer`
```json
{
  "stoppedAt": "2026-04-16T16:31:00-07:00"
}
```

## Suggested Google Sheet Tabs

- `Diapers`
  - `loggedAt`, `diaperType`
- `Feedings`
  - `loggedAt`, `feedingType`, `amount`, `unit`, `amountMl`, `durationMinutes`
- `TummyTime`
  - `loggedAt`, `durationMinutes`
- `SessionState`
  - `timerType`, `startedAt`, `status`

## Testing

- Simulator tests:
  - each one-shot utterance resolves to the correct intent and slots
  - stop timer with active timer returns derived duration
  - stop timer with no active timer returns expected error message
- Real-device tests:
  - `Alexa, open baby tracker`
  - `Alexa, ask baby tracker to log a poop diaper`
  - `Alexa, ask baby tracker to log a wet diaper`
  - `Alexa, ask baby tracker to log wet diaper`
  - `Alexa, ask baby tracker to log a bottle feeding of 4 ounces`
  - `Alexa, ask baby tracker to start breastfeeding`
  - `Alexa, ask baby tracker to stop breastfeeding`
  - `Alexa, ask baby tracker to start tummy time`
  - `Alexa, ask baby tracker to stop tummy time`
- Negative tests:
  - bottle feeding without amount
  - direct breastfeeding without minutes
  - stop timer without active timer

## Deployment

- Console steps:
  - create the skill
  - set invocation name to `baby tracker`
  - add intents, slots, and utterances
  - build and test
- Alexa-hosted code steps:
  - verify `lambda/package.json` includes both `ask-sdk-core` and `ask-sdk-model`
  - verify `lambda/index.js` has real backend constants or environment variables
  - verify placeholder checks still compare against placeholder strings, not real secret values
  - deploy after every `index.js` or `package.json` change
- Backend deployment steps:
  - create or update Apps Script endpoint
  - deploy web app version
  - connect endpoint URL to Lambda
- Rollback plan:
  - restore prior interaction model and Lambda code
  - restore prior Apps Script deployment if contract changed

## Runbook Notes

- Known issues:
  - timer actions require reliable backend state storage
  - spoken unit normalization should be handled server-side
  - `mixed diaper` must normalize to backend value `both`
  - Apps Script web app responses can redirect before returning JSON; the Lambda adapter must follow redirects without double-posting
- Device/account constraints:
  - device and skill locale must both be `en-US`
  - dev skill must be enabled on the same Amazon account as the device
  - if the simulator works but the device cannot launch, disable and re-enable the dev skill from the Alexa app before changing code
- Future enhancements:
  - baby name support
  - note capture
  - feeding-side support for nursing

## Generated Artifacts

- Interaction model: [interaction-model.json](alexa-skill/interaction-model.json)
- Alexa handler: [index.js](alexa-skill/lambda/index.js)
- Apps Script backend: [Code.gs](backend/google-apps-script/Code.gs)
- Validation summary: [baby-logger-validation.md](baby-logger-validation.md)
