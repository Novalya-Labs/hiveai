import path from 'node:path';
import { color } from '@/cli/utils/colors-utils.js';
import { ensureDir, getCurrentTeamName, safeWriteFile } from '@/cli/utils/fs-utils.js';

export function addAgentCommand(name?: string) {
  if (!name) {
    console.error('Error: missing agent name.');
    return;
  }

  const cwd = process.cwd();
  const teamName = getCurrentTeamName(cwd);

  if (!teamName) {
    console.error('Run this command from inside a team directory (teams/<team>/)');
    return;
  }

  ensureDir(cwd);
  const filePath = path.join(cwd, `${name}.yml`);

  const template = `name: ${name}
goals:
  - Describe what this agent must achieve
tasks:
  - Step 1
  - Step 2
llm: mistral
tools:
  - web-scraper
`;

  const writtenPath = safeWriteFile(filePath, template);
  console.log(`${color.success('✅')} Agent '${name}' created in team '${teamName}'`);
  console.log(`${color.info('→')} File: ${writtenPath}`);
}
