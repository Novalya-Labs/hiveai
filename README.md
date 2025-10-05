<div align="center">
  <img src="docs/assets/hiveai.png" alt="HiveAI Logo" width="120" height="120"/>
  
  # HiveAI
  
  **Build AI Agent Pipelines That Actually Work**
  
  *TypeScript framework for orchestrating autonomous multi-agent workflows*
  
  [![npm version](https://img.shields.io/npm/v/hiveai.svg)](https://www.npmjs.com/package/hiveai)
  [![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
  [![GitHub stars](https://img.shields.io/github/stars/Novalya-Labs/hiveai?style=social)](https://github.com/Novalya-Labs/hiveai)
  
  [**Documentation**](https://docs.hiveai.dev) · [**Examples**](#-real-world-examples) · [**Contributing**](#-contributing)
  
</div>

---

## 🎯 Why HiveAI?

Building multi-agent systems is **hard**. Managing dependencies, sharing data between agents, handling different LLM providers, and debugging interactions quickly becomes a nightmare.

**HiveAI** solves this by providing:

```yaml
# Define agents in simple YAML
name: research-agent
llm:
  provider: mistral
  temperature: 0.7
depends_on: data-collector  # Automatic orchestration
tools:
  - firecrawl
  - file-reader
goals:
  - Extract insights from data
```

→ HiveAI handles **everything else**: execution order, data sharing, tool calling, error handling, and retries.

## ✨ Features

<table>
<tr>
<td width="33%" valign="top">

### 🧠 Multi-LLM Support
Work with **OpenAI**, **Anthropic (Claude)**, and **Mistral AI** in a single pipeline.

```yaml
llm:
  provider: openai
  model: gpt-4o-mini
  temperature: 0.7
```

</td>
<td width="33%" valign="top">

### 🔗 Smart Orchestration
Automatic dependency resolution and sequential execution.

```yaml
depends_on:
  - agent-1
  - agent-2
# Waits for both
```

</td>
<td width="33%" valign="top">

### 💾 Shared Memory
Agents automatically access previous results.

```
Agent 1 → Agent 2
          ↓
     Results injected
     in Agent 2 prompt
```

</td>
</tr>
<tr>
<td width="33%" valign="top">

### 🔧 Built-in Tools
File reader, web scraper (Firecrawl), CSV serializer, and more.

```yaml
tools:
  - firecrawl
  - file-reader
```

</td>
<td width="33%" valign="top">

### ⚡ Zero Heavy Deps
Native `fetch`-based LLM clients. Custom YAML parser. Minimal footprint.

</td>
<td width="33%" valign="top">

### 🎨 Great DX
YAML config, detailed logs, clear error messages, environment variables support.

</td>
</tr>
</table>

## 🚀 Quick Start

### 1. Install

```bash
npm install hiveai
# or
pnpm add hiveai
```

### 2. Set up API keys

Create a `.env` file:

```bash
MISTRAL_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

### 3. Create your first agent

```bash
mkdir -p teams/my-team
cat > teams/my-team/agent.yml << EOF
name: analyst
llm: mistral
goals:
  - Analyze market trends
tasks:
  - Research and extract insights
EOF
```

### 4. Run it!

```bash
npx hiveai run my-team
```

Output:
```
🚀 Starting pipeline with 1 agent(s)...

[1/1] 🤖 Running agent: analyst
   🧠 LLM: mistral
   ✅ Completed in 12.4s

📊 Pipeline Summary
✅ Successful: 1
⏱️  Total duration: 12.4s
```

**That's it!** Your agent just ran. 🎉

## 📖 Documentation

**👉 [Read the full documentation](https://docs.hiveai.dev)**

- [Getting Started](https://docs.hiveai.dev/get-started/overview)
- [Core Concepts](https://docs.hiveai.dev/core-concepts/agents)
- [Configuration Guide](https://docs.hiveai.dev/guides/agent-configuration)
- [LLM Providers](https://docs.hiveai.dev/llms/openai)
- [Built-in Tools](https://docs.hiveai.dev/tools/built-in-tools)
- [API Reference](https://docs.hiveai.dev/api-reference/cli)

## 💡 Real-World Examples

### Research Pipeline (3 agents)

```yaml
# Agent 1: Researcher
name: researcher
llm: mistral
goals: [Research AI trends]

# Agent 2: Analyzer (depends on researcher)
name: analyzer
depends_on: researcher
llm: openai
goals: [Extract insights]

# Agent 3: Reporter (depends on both)
name: reporter
depends_on: [researcher, analyzer]
llm: claude
goals: [Create final report]
```

Run it:
```bash
npx hiveai run research-pipeline
```

Result: **3 agents collaborate automatically** to research, analyze, and report in 92 seconds. [See full example →](https://docs.hiveai.dev/examples/research-pipeline)

### More Examples

- **[Data Processing Pipeline](https://docs.hiveai.dev/examples/data-processing)** - Extract, transform, validate, export
- **[Web Scraping Workflow](https://docs.hiveai.dev/examples/web-scraping)** - Scrape → Process → Store
- **[Content Generation](https://docs.hiveai.dev/examples/content-generation)** - Research → Write → Review

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         Orchestrator                │
│  • Load agents from YAML            │
│  • Resolve dependencies             │
│  • Execute in order                 │
└─────────────────────────────────────┘
              │
      ┌───────┼───────┐
      ▼       ▼       ▼
  ┌───────┐ ┌───────┐ ┌───────┐
  │Agent 1│→│Agent 2│→│Agent 3│
  │OpenAI │ │Mistral│ │Claude │
  └───────┘ └───────┘ └───────┘
      │       │       │
      └───────┼───────┘
              ▼
      ┌──────────────┐
      │Shared Memory │
      └──────────────┘
```

**Key Components:**
- **Orchestrator**: Manages execution order and dependencies
- **Agent Runner**: Executes individual agents with their LLM
- **Memory**: Shared cache for results (JSON + in-memory)
- **LLM Clients**: Native implementations for OpenAI, Claude, Mistral
- **Tools**: Extensible system (file-reader, firecrawl, etc.)

## 🤝 Contributing

We love contributions! HiveAI is **open source** and built by the community.

### Ways to Contribute

- 🐛 **Report bugs** - [Open an issue](https://github.com/Novalya-Labs/hiveai/issues)
- 💡 **Suggest features** - [Start a discussion](https://github.com/Novalya-Labs/hiveai/discussions)
- 📝 **Improve docs** - PRs welcome!
- 🔧 **Add tools** - Create new tools for the ecosystem
- ⭐ **Star the repo** - Help us grow!

### Development Setup

```bash
# Clone the repo
git clone https://github.com/Novalya-Labs/hiveai.git
cd hiveai

# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Format & lint
pnpm format
pnpm lint
```

### Adding a New Tool

```typescript
// src/tools/my-tool.ts
export class MyTool implements Tool {
  name = 'my-tool';
  description = 'What your tool does';
  
  async execute(input: unknown): Promise<unknown> {
    // Your tool logic
  }
}
```

Register it in `src/tools/index.ts` and you're done!

## 🌟 Built With

- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Zod](https://github.com/colinhacks/zod)** - Schema validation  
- **[dotenv](https://github.com/motdotla/dotenv)** - Environment variables
- **Native fetch** - No heavy HTTP clients
- **Custom YAML parser** - Zero dependencies for YAML

## 📊 Roadmap

- [x] Multi-LLM support (OpenAI, Claude, Mistral)
- [x] Function calling / tool use
- [x] Dependency resolution
- [x] Shared memory between agents
- [x] Custom prompts & templating
- [x] Error handling & retries
- [ ] Parallel agent execution
- [ ] Streaming responses
- [ ] Vector memory (RAG)
- [ ] Web UI for pipeline management
- [ ] More LLM providers (Gemini, etc.)
- [ ] Agent marketplace

## 💬 Community

- **[GitHub Discussions](https://github.com/Novalya-Labs/hiveai/discussions)** - Ask questions, share ideas
- **[Twitter/X](https://x.com/ogogus21)** - Follow for updates
- **[GitHub Issues](https://github.com/Novalya-Labs/hiveai/issues)** - Report bugs

## 📄 License

HiveAI is [ISC licensed](LICENSE).

## 🙏 Acknowledgments

Built with ❤️ by [Novalya Labs](https://novalya.dev)

Special thanks to all our [contributors](https://github.com/Novalya-Labs/hiveai/graphs/contributors)!

---

<div align="center">
  
  **[Documentation](https://docs.hiveai.dev)** · **[Examples](https://docs.hiveai.dev/examples)** · **[Contributing](#-contributing)**
  
  Made with ❤️ for the AI agent community
  
  ⭐ **Star us on GitHub** — it helps!
  
</div>