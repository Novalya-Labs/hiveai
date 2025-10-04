import { z } from 'zod';

export const AgentSchema = z.object({
  name: z.string(),
  depends_on: z.string().optional(),
  goals: z.array(z.string()),
  tasks: z.array(z.string()),
  personality: z.string().optional(),
  llm: z.enum(['openai', 'mistral', 'claude']),
  tools: z.array(z.string()).default([]),
  output_result: z.string().optional(),
});

export type AgentConfig = z.infer<typeof AgentSchema>;
