# Baby Logger Google Apps Script Backend

## Files

- `Code.gs`: request handler, validation, sheet setup, and timer state management

## Deployment Steps

1. Create a new Google Sheet for Baby Logger.
2. Open `Extensions -> Apps Script`.
3. Replace the default script with [Code.gs](Code.gs).
4. Set the Apps Script project property `BABY_LOGGER_SHARED_SECRET` if you want request protection.
5. Deploy as a web app with access limited as tightly as your workflow allows.
6. Copy the deployed web app `/exec` URL into the Alexa skill environment variable `BACKEND_URL` or the top-level `BACKEND_URL` constant.
7. If you set the shared secret in Apps Script, copy the same value into `BACKEND_SHARED_SECRET` in the Alexa-hosted Node environment.

## Alexa Adapter Requirements

- Use `application/x-www-form-urlencoded`, not custom JSON headers.
- Send the shared secret in the `token` form field.
- Follow Apps Script redirects before parsing the response body as JSON.
- After `301`, `302`, or `303`, follow with `GET` so a successful sheet write is not repeated.
- Preserve the original `POST` body only for `307` and `308`.

## Request Shape

- Method: `POST`
- Content type: `application/x-www-form-urlencoded`
- Fields:
  - `action`
  - `payload`
  - `token` when shared-secret protection is enabled

## Verification

1. Send a `logDiaper` request and confirm the `Diapers` tab is created and populated.
2. Send `startBreastFeedingTimer` and `stopBreastFeedingTimer` and confirm `SessionState` and `Feedings` update correctly.
3. Send `logBottleFeeding` with ounces and confirm `amountMl` is populated.
4. Send `stopTummyTimeTimer` without a start request and confirm the JSON error message is returned.
5. Test through Alexa after deployment; a direct PowerShell success only proves the sheet write path, not the final Alexa response parsing path.
