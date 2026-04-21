# Alexa Console Debugging Checklist

## Routing and Invocation

- Alexa says it cannot help: likely invocation or routing failure
- Alexa opens the skill but loops on a prompt: likely interaction model mismatch
- Simulator works but device fails: check account, locale, development enablement, and propagation delay

## Build and Model

- Confirm the interaction model build succeeded
- Confirm the tested utterance matches a sample utterance shape
- Confirm slot types align with the utterance structure

## Device Constraints

- Device locale must match the skill locale
- Dev skill must be enabled on the same Amazon account used by the device
- Real-device tests should use supported invocation phrasing
