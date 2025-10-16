/**
 * Generate a unique trace ID for request tracking
 * @returns A unique trace ID string
 */
export function generateTraceId(): string {
  return `topup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
