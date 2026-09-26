/**
 * SaaS Master Builder - VS Code Extension
 * Exposes the full SaaS Master engineering toolkit directly into VS Code & Cursor command palettes and status bar.
 */

const vscode = require('vscode');

function activate(context) {
  console.log('SaaS Master Builder extension is now active.');

  // Create Status Bar Item
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.text = '$(shield) SaaS Master: 100%';
  statusBar.tooltip = 'Click to open SaaS Master Engineering Hub';
  statusBar.command = 'saasMaster.menu';
  statusBar.show();
  context.subscriptions.push(statusBar);

  // Helper to run CLI commands in terminal
  const runCliInTerminal = (commandName, title) => {
    let terminal = vscode.window.terminals.find(t => t.name === 'SaaS Master OS');
    if (!terminal) {
      terminal = vscode.window.createTerminal('SaaS Master OS');
    }
    terminal.show();
    terminal.sendText(`npx saas-master ${commandName}`);
  };

  // Register Quick Pick Menu
  context.subscriptions.push(
    vscode.commands.registerCommand('saasMaster.menu', async () => {
      const choices = [
        { label: '🩺 Run Doctor Diagnostics', description: 'npx saas-master doctor', cmd: 'doctor' },
        { label: '🛡️ Autonomous E2E Verification', description: 'npx saas-master verify (4ms)', cmd: 'verify' },
        { label: '🔍 AI Agent Diff Guard', description: 'npx saas-master guard (10 Sins)', cmd: 'guard' },
        { label: '📊 Global SaaS Benchmark Audit', description: 'npx saas-master benchmark (100/100)', cmd: 'benchmark' },
        { label: '🧪 Local Sandbox Simulator', description: 'npx saas-master simulate all', cmd: 'simulate all' },
        { label: '🌟 60-Second Demo Tour', description: 'npx saas-master demo', cmd: 'demo' },
        { label: '📦 Scaffold Blueprints', description: 'npx saas-master scaffold', cmd: 'scaffold' },
        { label: '🏢 Deep-Dive Domain Spec', description: 'npx saas-master deep-dive', cmd: 'deep-dive' },
        { label: '☕ Support via UPI (India)', description: 'UPI: jmetechno@ybl', cmd: 'donate' }
      ];

      const selected = await vscode.window.showQuickPick(choices, {
        placeHolder: 'Select a SaaS Master Command to Execute'
      });

      if (selected) {
        if (selected.cmd === 'donate') {
          vscode.commands.executeCommand('saasMaster.donate');
        } else if (selected.cmd === 'scaffold') {
          vscode.commands.executeCommand('saasMaster.scaffold');
        } else if (selected.cmd === 'deep-dive') {
          vscode.commands.executeCommand('saasMaster.deepDive');
        } else {
          runCliInTerminal(selected.cmd, selected.label);
        }
      }
    })
  );

  // Register Individual Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('saasMaster.doctor', () => {
      runCliInTerminal('doctor', 'Doctor Diagnostics');
    }),
    vscode.commands.registerCommand('saasMaster.verify', () => {
      runCliInTerminal('verify', 'E2E Verification');
    }),
    vscode.commands.registerCommand('saasMaster.guard', () => {
      runCliInTerminal('guard', 'AI Diff Guard');
    }),
    vscode.commands.registerCommand('saasMaster.benchmark', () => {
      runCliInTerminal('benchmark', 'Benchmark Audit');
    }),
    vscode.commands.registerCommand('saasMaster.simulate', () => {
      runCliInTerminal('simulate all', 'Local Sandbox Simulator');
    }),
    vscode.commands.registerCommand('saasMaster.demo', () => {
      runCliInTerminal('demo', '60-Second Demo Tour');
    }),
    vscode.commands.registerCommand('saasMaster.scaffold', async () => {
      const blueprints = [
        'all', 'rls', 'stripe', 'rate-limit', 'licensing', 'audit',
        'ai-gateway', 'updater', 'invoice-print', 'enterprise-sso',
        'webhooks', 'storage', 'feature-flags', 'notifications',
        'async-export', 'observability', 'search', 'scheduler',
        'api-keys', 'design-system', 'gdpr-offboarding', 'app-shell'
      ];
      const choice = await vscode.window.showQuickPick(blueprints, {
        placeHolder: 'Choose a production blueprint to scaffold'
      });
      if (choice) {
        runCliInTerminal(`scaffold ${choice}`, `Scaffold ${choice}`);
      }
    }),
    vscode.commands.registerCommand('saasMaster.deepDive', async () => {
      const idea = await vscode.window.showInputBox({
        prompt: 'Enter your SaaS idea or industry vertical',
        placeHolder: 'e.g. dental clinic EHR, fleet management, legal firm billing'
      });
      if (idea) {
        runCliInTerminal(`deep-dive "${idea}"`, 'Deep-Dive Expander');
      }
    }),
    vscode.commands.registerCommand('saasMaster.prompt', async () => {
      const task = await vscode.window.showInputBox({
        prompt: 'Enter the task to compile into a God-Tier AI prompt',
        placeHolder: 'e.g. build appointment booking with double-booking lock and Stripe payment'
      });
      if (task) {
        runCliInTerminal(`prompt "${task}"`, 'AI Prompt Compiler');
      }
    }),
    vscode.commands.registerCommand('saasMaster.donate', () => {
      vscode.window.showInformationMessage(
        '☕ Support SaaS Master Builder: Direct UPI VPA: jmetechno@ybl (India / UPI only, No Crypto). Thank you for powering open-source innovation!'
      );
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
