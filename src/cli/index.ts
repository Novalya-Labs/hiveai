#!/usr/bin/env node
import { addAgentCommand } from '@/cli/commands/agent-add.js';
import { helpCommand } from '@/cli/commands/help.js';
import { runCommand } from '@/cli/commands/run.js';
import { addTeamCommand } from '@/cli/commands/team-add.js';

async function main() {
  const [, , cmd, subcmd, ...args] = process.argv;

  if (!cmd) {
    helpCommand();
    process.exit(0);
  }

  if (cmd === 'run') return runCommand(subcmd);

  if (cmd === 'help') return helpCommand();

  if (cmd === 'agent' && subcmd === 'add') return addAgentCommand(args[0]);

  if (cmd === 'team' && subcmd === 'add') return addTeamCommand(args[0]);

  console.error(`Unknown command: ${cmd}`);
  helpCommand();
}

main();
