# MCP Mode Guidance

## Default Mode

- Generate artifacts
- Provide exact execution steps
- Ask the user to handle authentication if required

## MCP Automation Mode

Enable this only when:

- The environment has working browser MCP access
- The authenticated session is already open or can be safely completed by the user
- The action benefits materially from direct console operation

## Required MCP Tools

For Alexa Developer Console and AWS CloudWatch work, MCP automation requires a browser-control MCP server equivalent to Chrome DevTools MCP.

Minimum required browser tools:

- `list_pages`: confirm which console tabs are open and select the right target.
- `select_page`: switch between Alexa Developer Console and AWS CloudWatch tabs.
- `navigate_page`: open or reload Alexa Console, AWS Console, CloudWatch log groups, and specific log streams.
- `take_snapshot`: inspect page state, available buttons, current skill, selected tab, timestamps, and visible error messages.
- `click`: operate Console navigation, file tree items, Save, Deploy, Test, and CloudWatch log-stream links.
- `fill`: enter simulator utterances or simple form values.
- `press_key`: submit simulator utterances, search boxes, or focused inputs.
- `wait_for`: wait for deploy status, simulator responses, CloudWatch errors, or page transitions.
- `evaluate_script`: inspect and update complex browser editor state when the page uses custom controls such as the Alexa-hosted Ace editor.

Useful optional browser tools:

- `new_page`: open AWS or Alexa Console locations without disrupting the current tab.
- `close_page`: close stale console tabs after the workflow is complete.
- `take_screenshot`: capture visual state when the accessibility snapshot is insufficient.

Shell access is useful but not a replacement for browser MCP in this workflow. Use shell commands for local artifact validation, such as `node --check`, JSON parsing, and repository searches. Shell access cannot inspect or change authenticated Alexa Developer Console or AWS CloudWatch state unless separate CLI credentials and commands are intentionally configured.

GitHub MCP tools are not required for local Alexa Console execution. Use them only when the task explicitly involves repository issues, pull requests, or remote GitHub file operations.

## Console Operations That Need Browser MCP

- Verify the active Alexa skill, skill ID, stage, locale, invocation name, and test setting.
- Inspect and update hosted `lambda/index.js` and `lambda/package.json`.
- Confirm the hosted editor is showing the intended file before saving or deploying.
- Click `Save` and `Deploy`, then verify `Last Deployed` changed.
- Run Alexa Test Console utterances such as `open baby tracker` and `ask baby tracker to log wet diaper`.
- Open CloudWatch Logs from the hosted skill or AWS Console.
- Read latest Lambda log streams for errors such as `Runtime.ImportModuleError`, `SyntaxError`, and `SKILL_ENDPOINT_ERROR`.

## Safe Use Rules

- Verify the current page before clicking
- Prefer reversible changes first
- Capture the current configuration before editing production settings
- Record what was changed in the runbook
- Before deploying hosted code, verify the active editor content belongs to the intended file.
- For Ace or Monaco-style editors, prefer reading the editor value through `evaluate_script` before overwriting content.
- Do not assume the selected file tree item matches the active editor tab; verify by inspecting the editor content.