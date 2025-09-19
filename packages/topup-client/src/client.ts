import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { TopUpPayload, TopUpResult } from "./types";
import { generateTraceId, getTopUpEndpoint } from "./utils";

export class TopUpClient {
  constructor(
    private readonly timeout: number = 30000 // 30 seconds
  ) {}

  /**
   * Send a TopUp request to the server
   * @param payload - The TopUp payload containing transaction data
   * @returns Promise that resolves to transaction hash
   */
  async postTopUp(payload: TopUpPayload): Promise<Uint8Array> {
    const endpoint = getTopUpEndpoint();
    const traceId = generateTraceId();

    try {
      const response = await Promise.race([
        simpleFetch<TopUpResult>(endpoint, "/top-up", {
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

      if (!response.data.ok) {
        throw new Error(`TopUp failed: ${response.data.error}`);
      }

      const txHash = response.data.txHash;
      return new Uint8Array(Buffer.from(txHash, "hex"));
    } catch (error) {
      console.error("[TopUpClient] Request failed:", error);
      throw error;
    }
  }
}

// TODO: Remove
export class MockTopUpClient extends TopUpClient {
  constructor(
    private readonly delay: number = 2000, // 2 seconds delay
    private readonly shouldFail: boolean = false
  ) {
    super();
  }

  override async postTopUp(payload: TopUpPayload): Promise<Uint8Array> {
    console.log("[MockTopUpClient] Simulating TopUp request:", payload);

    await new Promise((resolve) => setTimeout(resolve, this.delay));

    if (this.shouldFail) {
      throw new Error("Mock TopUp failure for testing");
    }

    const mockTxHash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    console.log("[MockTopUpClient] Mock transaction hash:", mockTxHash);

    return new Uint8Array(Buffer.from(mockTxHash, "hex"));
  }
}
