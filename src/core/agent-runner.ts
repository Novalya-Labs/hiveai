import fs from 'node:fs';
import path from 'node:path';
import type { Memory } from '@/core/memory.js';
import { getLLM } from '@/llms/index.js';
import { getTool } from '@/tools/index.js';
import type { AgentConfig } from '@/types/agent.js';

/**
 * Agent runner
 */
export class AgentRunner {
  private readonly agent: AgentConfig;
  private readonly memory: Memory;
  private readonly outputDir: string;

  constructor(agent: AgentConfig, memory: Memory, outputDir: string) {
    this.agent = agent;
    this.memory = memory;
    this.outputDir = outputDir;
  }

  /**
   * Run the agent
   */
  async run(): Promise<unknown> {
    const { name, llm, tools, goals, tasks, output_result } = this.agent;

    const llmClient = getLLM(llm);
    const activeTools = tools.map(getTool).filter(Boolean);

    const context = {
      memory: this.memory,
      tools: activeTools,
    };

    const prompt = this.buildPrompt(goals, tasks);
    const response = await llmClient.generate(prompt, context);

    const resultPath = output_result
      ? path.join(this.outputDir, output_result)
      : path.join(this.outputDir, `${name}.json`);

    fs.writeFileSync(resultPath, JSON.stringify(response, null, 2));
    console.log(`✔ ${name} output → ${path.basename(resultPath)}`);

    return response;
  }

  private buildPrompt(goals: string[], tasks: string[]): string {
    return [
      'You are an autonomous agent executing a defined mission.',
      `Goals: ${goals.join('; ')}`,
      `Tasks: ${tasks.join('; ')}`,
      'Return structured JSON output.',
    ].join('\n');
  }
}
