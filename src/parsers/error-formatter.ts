import type { ZodError } from 'zod';

export function formatZodError(error: ZodError): string {
  const errors = error.issues.map((err) => {
    const path = err.path.join('.');
    const message = err.message;

    if (path) {
      return `  • ${path}: ${message}`;
    }
    return `  • ${message}`;
  });

  return [
    'Agent configuration validation failed:',
    ...errors,
    '\nPlease check your YAML file and fix the errors above.',
  ].join('\n');
}
