# HiveAI

A TypeScript framework for building autonomous AI agents that work together in teams.

## Features

- **Multi-LLM Support**: OpenAI, Anthropic (Claude), and Mistral AI
- **Function Calling**: Agents can use tools to accomplish tasks
- **Agent Orchestration**: Run multiple agents with dependency resolution
- **Shared Memory**: Agents can share data and results
- **Built-in Tools**:
  - `file-reader`: Read JSON, CSV, and text files
  - `firecrawl`: Web scraping with Firecrawl API
  - `web-scraper`: Basic web scraping
  - `serializer`: Data serialization

## Installation

```bash
pnpm install
```

## Configuration

Create a `.env` file at the root of your project with your API keys:

```env
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
MISTRAL_API_KEY=your_mistral_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
```

See [ENV.md](ENV.md) for detailed information about environment variables.

## Usage

### Define an Agent

Create a YAML file in your `teams/` directory:

```yaml
name: research-agent
description: "Research agent with advanced configuration"

llm:
  provider: openai
  model: gpt-4o-mini
  temperature: 0.7
  max_tokens: 2000

prompts:
  system: "You are a research assistant specialized in data extraction."
  user: "Research {{TOPIC}} and provide detailed insights."

tools:
  - firecrawl
  - file-reader

goals:
  - Research topic and extract key information
tasks:
  - Scrape relevant websites
  - Extract and summarize data
```

See [AGENT_CONFIG.md](AGENT_CONFIG.md) for complete configuration options.

### Run Your Team

```bash
pnpm build
hiveai run <team-name>
```

## CLI Commands

- `hiveai run <team>` - Run all agents in a team
- `hiveai agent add <name>` - Create a new agent
- `hiveai team add <name>` - Create a new team
- `hiveai help` - Show help

## Architecture

- **Orchestrator**: Manages agent execution order based on dependencies
- **Agent Runner**: Executes individual agents with their LLM and tools
- **Memory**: Shared state between agents
- **LLM Clients**: Native fetch-based implementations (no heavy SDKs)
- **Tools**: Extensible tool system

## Development

```bash
# Build the project
pnpm build

# Format code
pnpm format

# Lint code
pnpm lint
```

## License

ISC