import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { TopUpRequestBody, TopUpResponseBody } from "./types";
import { generateTraceId, getTopUpEndpoint } from "./utils";

export class TopUpClient {
  constructor(private readonly timeout: number = 60000) {}

  async postTopUp(payload: TopUpRequestBody): Promise<string> {
    const endpoint = getTopUpEndpoint();
    const traceId = generateTraceId();

    try {
      const response = await Promise.race([
        simpleFetch<TopUpResponseBody>(endpoint, "/top-up", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Trace-Id": traceId,
          },
          body: JSON.stringify(payload),
        }),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("TopUp request timeout")),
            this.timeout
          )
        ),
      ]);

      if ("error" in response.data) {
        throw new Error(`TopUp failed: ${response.data.error}`);
      }

      return response.data.txHash;
    } catch (error) {
      console.error("[TopUpClient] Request failed:", error);
      throw error;
    }
  }
}
