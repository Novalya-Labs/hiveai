import path from 'node:path';
import { color } from '@/cli/utils/colors-utils.js';
import { ensureDir, safeWriteFile } from '@/cli/utils/fs-utils.js';

export function addTeamCommand(name?: string) {
  if (!name) {
    console.error('Error: missing team name.');
    return;
  }

  const teamDir = path.join(process.cwd(), 'teams', name);
  ensureDir(path.join(teamDir, 'output'));

  const exampleAgent = `name: example-agent
goals:
  - Example goal
tasks:
  - Example task
llm: mistral
tools:
  - web-scraper
`;

  const filePath = path.join(teamDir, 'example-agent.yml');
  const writtenPath = safeWriteFile(filePath, exampleAgent);
  console.log(`${color.success('✅')} Team '${name}' created at ${teamDir}`);
  console.log(`${color.info('→')} Example agent created: ${writtenPath}`);
}
