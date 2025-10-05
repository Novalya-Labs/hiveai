import { z } from 'zod';

const LLMConfigSchema = z.union([
  z.enum(['openai', 'mistral', 'claude']),
  z.object({
    provider: z.enum(['openai', 'mistral', 'claude']),
    model: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    max_tokens: z.number().positive().optional(),
    top_p: z.number().min(0).max(1).optional(),
  }),
]);

const PromptsSchema = z
  .object({
    system: z.string().optional(),
    user: z.string().optional(),
  })
  .optional();

export const AgentSchema = z.object({
  name: z.string().min(1, 'Agent name is required'),
  description: z.string().optional(),
  depends_on: z.union([z.string(), z.array(z.string())]).optional(),
  goals: z.array(z.string()).min(1, 'At least one goal is required'),
  tasks: z.array(z.string()).min(1, 'At least one task is required'),
  personality: z.string().optional(),
  llm: LLMConfigSchema,
  prompts: PromptsSchema,
  tools: z.array(z.string()).default([]),
  output_result: z.string().optional(),
  on_error: z.enum(['stop', 'continue']).default('stop').optional(),
});

export type LLMConfig = z.infer<typeof LLMConfigSchema>;
export type AgentConfig = z.infer<typeof AgentSchema>;
