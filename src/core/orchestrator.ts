import fs from 'node:fs';
import path from 'node:path';
import { Memory } from '@/core/memory.js';
import { YamlLoader } from '@/parsers/yaml-loader.js';
import type { AgentConfig } from '@/types/agent.js';
import { AgentRunner } from './agent-runner.js';

/**
 * Orchestrator
 */
export class Orchestrator {
  private readonly agents: AgentConfig[];
  private readonly memory: Memory;
  private readonly outputDir: string;

  constructor(teamDir: string) {
    this.agents = YamlLoader.loadAllFromDir(teamDir);
    this.memory = new Memory();
    this.outputDir = path.join(teamDir, 'output');
    fs.mkdirSync(this.outputDir, { recursive: true });
  }

  /**
   * Sort agents based on their dependencies
   */
  private resolveExecutionOrder(): AgentConfig[] {
    const sorted: AgentConfig[] = [];
    const visited = new Set<string>();

    const visit = (agent: AgentConfig) => {
      if (visited.has(agent.name)) return;
      if (agent.depends_on) {
        const dep = this.agents.find((a) => a.name === agent.depends_on);
        if (!dep) throw new Error(`Dependency not found: ${agent.depends_on}`);
        visit(dep);
      }
      visited.add(agent.name);
      sorted.push(agent);
    };

    for (const a of this.agents) visit(a);
    return sorted;
  }

  /**
   * Run all agents
   */
  async runAll(): Promise<void> {
    const ordered = this.resolveExecutionOrder();

    for (const agent of ordered) {
      const runner = new AgentRunner(agent, this.memory, this.outputDir);
      console.log(`→ Running agent: ${agent.name}`);
      const result = await runner.run();
      this.memory.set(agent.name, result);
    }

    console.log('✅ All agents completed successfully.');
  }
}
