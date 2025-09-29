import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { TopUpRequestBody, TopUpResponseBody } from "./types";
import { generateTraceId, getTopUpEndpoint } from "./utils";

export class TopUpClient {
  constructor(private readonly timeout: number = 60000) {}

  async postTopUp(payload: TopUpRequestBody): Promise<Uint8Array> {
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

      const txHashHex = response.data.txHash;
      return hexToBytes(txHashHex);
    } catch (error) {
      console.error("[TopUpClient] Request failed:", error);
      throw error;
    }
  }
}

function hexToBytes(hex: string): Uint8Array {
  const normalized = hex.length % 2 === 0 ? hex : "0" + hex;
  const length = normalized.length / 2;
  const out = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    const byte = normalized.substr(i * 2, 2);
    out[i] = parseInt(byte, 16);
  }
  return out;
}
