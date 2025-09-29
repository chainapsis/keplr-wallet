/**
 * Generate a unique trace ID for request tracking
 * @returns A unique trace ID string
 */
export function generateTraceId(): string {
  return `topup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get the TopUp service endpoint URL based on environment
 * @returns The endpoint URL for the TopUp service
 */
export function getTopUpEndpoint(): string {
  return "http://localhost:5200";

  // return "https://topup-api.keplr.app";
}
