import { KVStore } from "@keplr-wallet/common";
import { RNG } from "@keplr-wallet/crypto";
import { Env } from "@keplr-wallet/router";
import { EthSignType } from "@keplr-wallet/types";
import Axios from "axios";
import { SignMode } from "../keyring";
import {
  KEPLR_EXT_ANALYTICS_API_URL,
  KEPLR_EXT_ANALYTICS_API_AUTH_TOKEN,
} from "./constants";

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

  async logTransaction(loggingInfo: {
    chainId: string;
    signMode?: SignMode | EthSignType;
  }): Promise<void> {
    const loggerInstance = Axios.create({
      baseURL: KEPLR_EXT_ANALYTICS_API_URL,
    });
    const loggingMsg = Buffer.from(JSON.stringify(loggingInfo)).toString(
      "base64"
    );
    loggerInstance.get(`/log?msg=${loggingMsg}`, {
      headers: {
        Authorization: KEPLR_EXT_ANALYTICS_API_AUTH_TOKEN,
      },
    });
  }
}
