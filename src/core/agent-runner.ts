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

  async run(): Promise<unknown> {
    const { name, llm, tools, goals, tasks, output_result, prompts, depends_on, description } = this.agent;

    if (description) {
      console.log(`   📝 ${description}`);
    }

    const llmProvider = typeof llm === 'string' ? llm : llm.provider;
    const llmConfig = typeof llm === 'string' ? llm : llm;

    console.log(`   🧠 LLM: ${llmProvider}${typeof llm !== 'string' && llm.model ? ` (${llm.model})` : ''}`);
    if (typeof llm !== 'string') {
      if (llm.temperature !== undefined) console.log(`      Temperature: ${llm.temperature}`);
      if (llm.max_tokens !== undefined) console.log(`      Max tokens: ${llm.max_tokens}`);
    }

    const llmClient = getLLM(llmProvider);
    const activeTools = tools.map(getTool).filter((tool): tool is NonNullable<typeof tool> => tool !== null);

    if (activeTools.length > 0) {
      console.log(`   🔧 Tools: ${activeTools.map((t) => t.name).join(', ')}`);
    }

    const context = {
      memory: this.memory,
      tools: activeTools,
    };

    const dependencyResults = this.getDependencyResults(depends_on);
    if (Object.keys(dependencyResults).length > 0) {
      console.log(`   📦 Loaded results from: ${Object.keys(dependencyResults).join(', ')}`);
    }

    const prompt = this.buildPrompt(goals, tasks, activeTools, prompts, dependencyResults);

    console.log(`   📨 Sending prompt (${prompt.length} chars)...`);

    const response = await llmClient.generate(prompt, context);

    const resultPath = output_result
      ? path.join(this.outputDir, output_result)
      : path.join(this.outputDir, `${name}.json`);

    fs.writeFileSync(resultPath, JSON.stringify(response, null, 2));
    console.log(`   💾 Output saved → ${path.basename(resultPath)}`);

    return response;
  }

  private getDependencyResults(depends_on?: string | string[]): Record<string, unknown> {
    if (!depends_on) return {};

    const dependencies = Array.isArray(depends_on) ? depends_on : [depends_on];
    const results: Record<string, unknown> = {};

    for (const depName of dependencies) {
      const result = this.memory.get(depName);
      if (result !== null) {
        results[depName] = result;
      }
    }

    return results;
  }

  private buildPrompt(
    goals: string[],
    tasks: string[],
    tools: Array<{ name: string; description: string }>,
    customPrompts?: { system?: string; user?: string },
    dependencyResults?: Record<string, unknown>,
  ): string {
    if (customPrompts?.system || customPrompts?.user) {
      const parts = [];
      if (customPrompts.system) {
        parts.push(customPrompts.system);
      }

      if (dependencyResults && Object.keys(dependencyResults).length > 0) {
        parts.push('\nResults from previous agents:');
        for (const [agentName, result] of Object.entries(dependencyResults)) {
          parts.push(`\n### ${agentName}:`);
          parts.push(JSON.stringify(result, null, 2));
        }
        parts.push('');
      }

      if (tools.length > 0) {
        parts.push('\nYou have access to these tools:');
        for (const tool of tools) {
          parts.push(`- ${tool.name}: ${tool.description}`);
        }
      }
      if (customPrompts.user) {
        parts.push('\n' + customPrompts.user);
      }
      return parts.join('\n');
    }

    const parts = ['You are an autonomous agent executing a defined mission.'];

    if (dependencyResults && Object.keys(dependencyResults).length > 0) {
      parts.push('\nResults from previous agents:');
      for (const [agentName, result] of Object.entries(dependencyResults)) {
        parts.push(`\n### ${agentName}:`);
        parts.push(JSON.stringify(result, null, 2));
      }
      parts.push('');
    }

    if (tools.length > 0) {
      parts.push('\nYou have access to these tools:');
      for (const tool of tools) {
        parts.push(`- ${tool.name}: ${tool.description}`);
      }
      parts.push('');
    }

    parts.push(`Goals: ${goals.join('; ')}`);
    parts.push(`Tasks: ${tasks.join('; ')}`);
    parts.push('Return structured JSON output.');

    return parts.join('\n');
  }
}
