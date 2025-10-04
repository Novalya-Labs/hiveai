import path from 'node:path';
import { Orchestrator } from '@/core/orchestrator.js';

/**
 * Command: hiveai run <team-name>
 */
export async function runCommand(teamName: string): Promise<void> {
  if (!teamName) {
    console.error('Error: team name missing.\nUsage: hiveai run <team-name>');
    process.exit(1);
  }

  const teamDir = path.join(process.cwd(), 'teams', teamName);
  const orchestrator = new Orchestrator(teamDir);
  await orchestrator.runAll();
}
