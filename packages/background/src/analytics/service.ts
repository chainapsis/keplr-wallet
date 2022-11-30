import { KVStore } from "@keplr-wallet/common";
import { RNG } from "@keplr-wallet/crypto";
import { Env } from "@keplr-wallet/router";

export class AnalyticsService {
  protected analyticsId: string = "";

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly rng: RNG,
    protected readonly privilegedOrigins: string[]
  ) {}

  async init() {
    const saved = await this.kvStore.get<string>("analyticsId");
    if (saved) {
      this.analyticsId = saved;
      return;
    }
    const bytes = new Uint8Array(20);
    const rand: string = Array.from(await this.rng(bytes))
      .map((value) => {
        let v = value.toString(16);
        if (v.length === 1) {
          v = "0" + v;
        }
        return v;
      })
      .join("");
    this.analyticsId = rand;
    await this.kvStore.set<string>("analyticsId", rand);
  }

  async getAnalyticsIdOnlyIfPrivileged(
    env: Env,
    origin: string
  ): Promise<string> {
    if (!env.isInternalMsg && !this.privilegedOrigins.includes(origin)) {
      throw new Error("Rejected");
    }

    return this.analyticsId;
  }
}
