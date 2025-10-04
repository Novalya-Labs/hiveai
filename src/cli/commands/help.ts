export function helpCommand() {
  console.log(`
    HiveAI CLI — commands

    Usage:
      hiveai run <team>         Run all agents in a team
      hiveai teams add <name>   Create a new team directory with default structure
      hiveai agent add <name>   Create a new agent YAML in the current team
      hiveai help               Display this help
`);
}
