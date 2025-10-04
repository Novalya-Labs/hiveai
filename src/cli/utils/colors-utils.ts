const codes = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

export const color = {
  success: (text: string) => `${codes.green}${text}${codes.reset}`,
  error: (text: string) => `${codes.red}${text}${codes.reset}`,
  info: (text: string) => `${codes.cyan}${text}${codes.reset}`,
  warn: (text: string) => `${codes.yellow}${text}${codes.reset}`,
  title: (text: string) => `${codes.bold}${codes.magenta}${text}${codes.reset}`,
  dim: (text: string) => `${codes.dim}${text}${codes.reset}`,
};
