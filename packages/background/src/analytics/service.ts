import { KVStore } from "@keplr-wallet/common";
import { Env } from "@keplr-wallet/router";
import {
  KEPLR_EXT_ANALYTICS_API_URL,
  KEPLR_EXT_ANALYTICS_API_AUTH_TOKEN,
} from "./constants";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { action, autorun, makeObservable, observable, runInAction } from "mobx";

export class AnalyticsService {
  protected analyticsId: string = "";

  @observable
  protected disabled: boolean = false;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly privilegedOrigins: string[],
    protected readonly analyticsOptions: {
      platform: string;
      mobileOS: string;
    }
  ) {
    makeObservable(this);
  }

  async init() {
    const analyticsDisabled = await this.kvStore.get<boolean>(
      "analyticsDisabled"
    );

    runInAction(() => {
      if (analyticsDisabled) {
        this.disabled = true;
      } else {
        this.disabled = false;
      }
    });

    autorun(() => {
      this.kvStore.set<boolean>("analyticsDisabled", this.disabled);
    });

    const saved = await this.kvStore.get<string>("analyticsId");
    if (saved) {
      this.analyticsId = saved;
      return;
    }
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const rand: string = Array.from(bytes)
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

  getAnalyticsIdOnlyIfPrivileged(env: Env, origin: string): string {
    if (!env.isInternalMsg && !this.privilegedOrigins.includes(origin)) {
      throw new Error("Rejected");
    }

    return this.analyticsId;
  }

  async logEvent(
    event: string,
    params: Record<
      string,
      number | string | boolean | number[] | string[] | undefined
    >
  ): Promise<void> {
    if (!KEPLR_EXT_ANALYTICS_API_URL || !KEPLR_EXT_ANALYTICS_API_AUTH_TOKEN) {
      return;
    }

    // Disable on firefox
    if (typeof browser.runtime.getBrowserInfo === "function") {
      const browserInfo = await browser.runtime.getBrowserInfo();
      if (browserInfo.name === "Firefox") {
        return;
      }
    }

    if (this.disabled) {
      return;
    }

    const loggingMsg = Buffer.from(
      JSON.stringify({
        ...params,
        event,
        analyticsId: this.analyticsId,
        v2: true,
        platform: this.analyticsOptions.platform,
        mobileOS: this.analyticsOptions.mobileOS,
        webdriver: (() => {
          if (typeof navigator === "undefined") {
            return false;
          }
          // 타이핑은 boolean인데 실제로는 nullable해서 무조건 boolean으로 반환하게 하기 위해서 이렇게 한거임.
          return !!navigator.webdriver;
        })(),
      })
    ).toString("base64");
    await simpleFetch(
      KEPLR_EXT_ANALYTICS_API_URL,
      `/log?msg=${encodeURIComponent(loggingMsg)}`,
      {
        headers: {
          Authorization: KEPLR_EXT_ANALYTICS_API_AUTH_TOKEN,
        },
      }
    );
  }

  logEventIgnoreError(
    event: string,
    params: Record<
      string,
      number | string | boolean | number[] | string[] | undefined
    >
  ): void {
    this.logEvent(event, params).catch((e) => console.log(e));
  }

  @action
  public setDisabled(disabled: boolean) {
    this.disabled = disabled;
    return this.disabled;
  }
}
