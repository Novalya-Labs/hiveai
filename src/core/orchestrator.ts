import fs from 'node:fs';
import path from 'node:path';
import { Memory } from '@/core/memory.js';
import { YamlLoader } from '@/parsers/yaml-loader.js';
import type { AgentConfig } from '@/types/agent.js';
import { AgentRunner } from './agent-runner.js';

interface PipelineMetrics {
  totalAgents: number;
  successfulAgents: number;
  failedAgents: number;
  startTime: number;
  endTime?: number;
  agentMetrics: Array<{
    name: string;
    status: 'success' | 'failed' | 'skipped';
    duration: number;
    error?: string;
  }>;
}

export class Orchestrator {
  private readonly agents: AgentConfig[];
  private readonly memory: Memory;
  private readonly outputDir: string;
  private readonly metrics: PipelineMetrics;

  constructor(teamDir: string) {
    this.agents = YamlLoader.loadAllFromDir(teamDir);
    this.memory = new Memory(teamDir);
    this.outputDir = path.join(teamDir, 'output');
    fs.mkdirSync(this.outputDir, { recursive: true });

    this.metrics = {
      totalAgents: this.agents.length,
      successfulAgents: 0,
      failedAgents: 0,
      startTime: Date.now(),
      agentMetrics: [],
    };
  }

  private getDependencies(agent: AgentConfig): string[] {
    if (!agent.depends_on) return [];
    return Array.isArray(agent.depends_on) ? agent.depends_on : [agent.depends_on];
  }

  private resolveExecutionOrder(): AgentConfig[] {
    const sorted: AgentConfig[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (agent: AgentConfig) => {
      if (visited.has(agent.name)) return;

      if (visiting.has(agent.name)) {
        throw new Error(`Circular dependency detected involving agent: ${agent.name}`);
      }

      visiting.add(agent.name);

      const dependencies = this.getDependencies(agent);
      for (const depName of dependencies) {
        const dep = this.agents.find((a) => a.name === depName);
        if (!dep) {
          throw new Error(`Dependency "${depName}" not found for agent "${agent.name}"`);
        }
        visit(dep);
      }

      visiting.delete(agent.name);
      visited.add(agent.name);
      sorted.push(agent);
    };

    for (const agent of this.agents) {
      visit(agent);
    }

    return sorted;
  }

  async runAll(): Promise<PipelineMetrics> {
    console.log(`\n🚀 Starting pipeline with ${this.agents.length} agent(s)...\n`);

    const ordered = this.resolveExecutionOrder();
    let shouldContinue = true;

    for (let i = 0; i < ordered.length; i++) {
      const agent = ordered[i];
      const agentStartTime = Date.now();

      if (!shouldContinue && agent.on_error !== 'continue') {
        console.log(`⏭️  Skipping agent: ${agent.name} (previous failure)`);
        this.metrics.agentMetrics.push({
          name: agent.name,
          status: 'skipped',
          duration: 0,
        });
        continue;
      }

      try {
        console.log(`\n[${i + 1}/${ordered.length}] 🤖 Running agent: ${agent.name}`);

        const dependencies = this.getDependencies(agent);
        if (dependencies.length > 0) {
          console.log(`   Dependencies: ${dependencies.join(', ')}`);
        }

        const runner = new AgentRunner(agent, this.memory, this.outputDir);
        const result = await runner.run();
        this.memory.set(agent.name, result);

        const duration = Date.now() - agentStartTime;
        console.log(`   ✅ Completed in ${(duration / 1000).toFixed(2)}s`);

        this.metrics.successfulAgents++;
        this.metrics.agentMetrics.push({
          name: agent.name,
          status: 'success',
          duration,
        });
      } catch (error) {
        const duration = Date.now() - agentStartTime;
        const errorMessage = error instanceof Error ? error.message : String(error);

        console.error(`   ❌ Failed: ${errorMessage}`);

        this.metrics.failedAgents++;
        this.metrics.agentMetrics.push({
          name: agent.name,
          status: 'failed',
          duration,
          error: errorMessage,
        });

        if (agent.on_error !== 'continue') {
          shouldContinue = false;
          console.log(`\n⚠️  Pipeline stopped due to failure in "${agent.name}"`);
        } else {
          console.log('   ⚠️  Continuing despite failure (on_error: continue)');
        }
      }
    }

    this.metrics.endTime = Date.now();
    this.printSummary();

    return this.metrics;
  }

  private printSummary(): void {
    const totalDuration = (this.metrics.endTime! - this.metrics.startTime) / 1000;

    console.log('\n' + '='.repeat(60));
    console.log('📊 Pipeline Summary');
    console.log('='.repeat(60));
    console.log(`Total agents: ${this.metrics.totalAgents}`);
    console.log(`✅ Successful: ${this.metrics.successfulAgents}`);
    console.log(`❌ Failed: ${this.metrics.failedAgents}`);
    console.log(`⏭️  Skipped: ${this.metrics.agentMetrics.filter((m) => m.status === 'skipped').length}`);
    console.log(`⏱️  Total duration: ${totalDuration.toFixed(2)}s`);

    console.log('\nAgent Details:');
    for (const metric of this.metrics.agentMetrics) {
      const statusIcon = metric.status === 'success' ? '✅' : metric.status === 'failed' ? '❌' : '⏭️';
      const duration = (metric.duration / 1000).toFixed(2);
      console.log(`  ${statusIcon} ${metric.name} (${duration}s)${metric.error ? ` - ${metric.error}` : ''}`);
    }

    console.log('='.repeat(60) + '\n');
  }
}
