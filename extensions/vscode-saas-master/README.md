# SaaS Master Builder — VS Code & Cursor Extension 🚀

The official VS Code and Cursor extension for **SaaS Master Builder (SMB)**.
Built and maintained by **JME TECHNOLOGIES LLP** (https://jmevps.com).
Official Cloud & VPS Partner: **[JME VPS](https://jmevps.com)**.

Brings the entire autonomous SaaS engineering toolkit, multi-tenancy verification gates, and 10 Deadly AI Sins linter directly into your editor's Command Palette and Status Bar.

## Features

- **Status Bar Integration**: Click `$(shield) SaaS Master: 100%` in the bottom right to access all commands.
- **Autonomous E2E Verification**: Run `SaaS Master: Autonomous E2E System Verification` to verify RLS, Stripe idempotency, Ed25519 licensing, and audit trails in 4ms.
- **AI Agent Diff Guard**: Detect and prevent the 10 Deadly AI Coding Sins in your recent code edits.
- **1-Click Blueprint Scaffolding**: Inject any of the 21 enterprise blueprints into your workspace.
- **Deep-Dive Domain Expander**: Expand any high-level SaaS idea into an enterprise architectural spec.
- **Local Event Sandbox Simulator**: Generate mock Stripe webhooks, SAML 2.0 assertions, and ESC/POS printer byte streams without live credentials.

## Installation

### For Local Development / Cursor / VS Code:
1. Open this workspace in VS Code or Cursor.
2. Press `F5` to launch an Extension Development Host window.
3. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and type `SaaS Master`.

### Packaging into a `.vsix` file:
```bash
cd extensions/vscode-saas-master
npx vsce package
```
Install the generated `.vsix` file via `Extensions: Install from VSIX...` in VS Code or Cursor!

## Support & Donation (India UPI Only)

If SaaS Master Builder saves you weeks of development:
- **UPI VPA**: `jmetechno@ybl` (No crypto)
