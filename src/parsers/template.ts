export function replaceEnvVars(text: string): string {
  return text.replace(/\{\{([A-Z_][A-Z0-9_]*)\}\}/g, (match, varName) => {
    const value = process.env[varName];
    if (value === undefined) {
      console.warn(`Warning: Environment variable ${varName} is not defined`);
      return match;
    }
    return value;
  });
}

export function processTemplateInObject(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return replaceEnvVars(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(processTemplateInObject);
  }

  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = processTemplateInObject(value);
    }
    return result;
  }

  return obj;
}
