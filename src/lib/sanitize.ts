/** Sanitize HTML to prevent XSS attacks */
export function sanitizeHtml(input: string): string {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

/** Sanitize user input for safe display */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/** Validate and sanitize common form inputs */
export function sanitizeFormData(data: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    sanitized[key] = value.trim().replace(/[<>]/g, "");
  }
  return sanitized;
}
