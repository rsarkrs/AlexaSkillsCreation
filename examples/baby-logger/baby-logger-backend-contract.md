# Baby Logger Backend Contract

This is the backend contract the Alexa skill should assume.

## HTTP Shape

- Method: `POST`
- Content type: `application/x-www-form-urlencoded`
- Form fields:
  - `action`
  - `payload`
  - `token` when shared-secret protection is enabled
- Apps Script response behavior:
  - the web app may redirect before the final JSON response is available
  - the Alexa-hosted adapter must follow redirects
  - use `GET` after `301`, `302`, or `303` redirects so a successful write is not repeated
  - preserve the original `POST` body only for `307` and `308`

## Actions

### `logDiaper`

Payload:

```json
{
  "loggedAt": "ISO-8601 timestamp",
  "diaperType": "pee | poop | both"
}
```

Response:

```json
{
  "ok": true,
  "diaperType": "pee"
}
```

### `logBottleFeeding`

Payload:

```json
{
  "loggedAt": "ISO-8601 timestamp",
  "amount": 4,
  "unit": "oz",
  "amountMl": 118.29
}
```

Response:

```json
{
  "ok": true,
  "amount": 4,
  "unit": "ounces"
}
```

### `logBreastFeeding`

Payload:

```json
{
  "loggedAt": "ISO-8601 timestamp",
  "durationMinutes": 12
}
```

Response:

```json
{
  "ok": true,
  "durationMinutes": 12
}
```

### `startBreastFeedingTimer`

Payload:

```json
{
  "startedAt": "ISO-8601 timestamp"
}
```

Response:

```json
{
  "ok": true,
  "startedAt": "ISO-8601 timestamp"
}
```

### `stopBreastFeedingTimer`

Payload:

```json
{
  "stoppedAt": "ISO-8601 timestamp"
}
```

Response:

```json
{
  "ok": true,
  "durationMinutes": 18,
  "startedAt": "ISO-8601 timestamp",
  "stoppedAt": "ISO-8601 timestamp"
}
```

### `logTummyTime`

Payload:

```json
{
  "loggedAt": "ISO-8601 timestamp",
  "durationMinutes": 7
}
```

Response:

```json
{
  "ok": true,
  "durationMinutes": 7
}
```

### `startTummyTimeTimer`

Payload:

```json
{
  "startedAt": "ISO-8601 timestamp"
}
```

Response:

```json
{
  "ok": true,
  "startedAt": "ISO-8601 timestamp"
}
```

### `stopTummyTimeTimer`

Payload:

```json
{
  "stoppedAt": "ISO-8601 timestamp"
}
```

Response:

```json
{
  "ok": true,
  "durationMinutes": 11,
  "startedAt": "ISO-8601 timestamp",
  "stoppedAt": "ISO-8601 timestamp"
}
```

## State Requirements

The backend needs temporary state storage for active timers.

Minimum state model:

- `timerType`
- `startedAt`
- `status`

Examples:

- `breastfeeding`, `2026-04-16T15:45:00-07:00`, `active`
- `tummyTime`, `2026-04-16T16:20:00-07:00`, `active`

## Validation Rules

- reject invalid diaper types
- normalize spoken `wet` to canonical value `pee`
- normalize spoken `mixed` to canonical value `both`
- reject bottle feeds without amount or unit
- normalize `ounce`, `ounces`, `oz` to `oz`
- normalize `milliliter`, `milliliters`, `ml` to `ml`
- convert ounces to milliliters when possible
- reject negative or zero durations
- reject timer stop requests when no matching active timer exists

## Implementation Notes

- The Alexa skill should call this contract through an Alexa-hosted Node.js adapter, not directly from the interaction model.
- Apps Script authentication should prefer a shared secret form field over custom request headers.
- Request timestamps may be supplied by Alexa, but the backend should tolerate missing or invalid timestamps and canonicalize to server time.
- A successful sheet write is not enough for Alexa success. The adapter must receive parseable JSON with `ok: true`, otherwise Alexa should report the backend response as invalid.
- If CloudWatch shows `Cannot find module 'ask-sdk-model'`, add `ask-sdk-model` as a direct dependency in hosted `lambda/package.json` and deploy again.
