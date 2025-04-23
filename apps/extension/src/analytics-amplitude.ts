import {
  AnalyticsAmplitudeStore,
  AnalyticsClientV2,
  KeyringPropertiesMap,
  Properties,
} from "@keplr-wallet/analytics";
import { action, autorun, makeObservable, observable, runInAction } from "mobx";

import { Buffer } from "buffer/";
import { KeyRingStore } from "@keplr-wallet/stores-core";
import * as amplitude from "@amplitude/analytics-browser";
import { CoinPretty } from "@keplr-wallet/unit";
import { NOBLE_CHAIN_ID } from "./config.ui";
import {
  IAccountStore,
  IChainStore,
  IQueriesStore,
  NobleQueries,
} from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { Hash } from "@keplr-wallet/crypto";

// https://developer.chrome.com/docs/extensions/mv3/tut_analytics/
export class AmplitudeAnalyticsClient implements AnalyticsClientV2 {
  @observable
  protected isInitialized: boolean = false;

  @observable.ref
  protected _userPropertiesMap: KeyringPropertiesMap = {};
  @observable
  protected _sessionId: string = "";
  @observable
  protected _sessionIdTimestamp: number = 0;

  protected isFirefox: boolean = false;
  protected readonly cosmosHubChainId: string = "cosmoshub-4";

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly keyringStore: KeyRingStore,
    protected readonly accountStore: IAccountStore,
    protected readonly chainStore: IChainStore,
    protected readonly apiKey: string
  ) {
    makeObservable(this);

    if (this.apiKey) {
      amplitude.init(this.apiKey, undefined, {
        defaultTracking: false,
      });

      autorun(() => {
        if (!this.keyringStore.selectedKeyInfo?.id) {
          return;
        }

        if (this.accountStore && this.chainStore) {
          const cosmosAccount = this.accountStore.getAccount(
            this.cosmosHubChainId
          );
          if (cosmosAccount.bech32Address) {
            const hashedAddress = Buffer.from(
              Hash.hash256(
                new TextEncoder().encode(cosmosAccount.bech32Address)
              )
            ).toString("hex");
            amplitude.setUserId(hashedAddress);
            return;
          }
        }

        amplitude.setUserId(this.keyringStore.selectedKeyInfo.id);
        return;
      });
    }

    this.init();
  }

  protected async init() {
    // Disable on firefox
    if (typeof browser.runtime.getBrowserInfo === "function") {
      const browserInfo = await browser.runtime.getBrowserInfo();
      if (browserInfo.name === "Firefox") {
        this.isFirefox = true;
        runInAction(() => {
          this.isInitialized = true;
        });
        return;
      }
    }

    const sessionId = await this.kvStore.get<string>("session_id");
    if (sessionId) {
      runInAction(() => {
        this._sessionId = sessionId;
      });
    }
    const sessionIdTimestamp = await this.kvStore.get<number>(
      "session_id_timestamp"
    );
    if (sessionIdTimestamp) {
      runInAction(() => {
        this._sessionIdTimestamp = sessionIdTimestamp;
      });
    }

    autorun(() => {
      this.kvStore.set("session_id", this._sessionId);
    });

    autorun(() => {
      this.kvStore.set("session_id_timestamp", this._sessionIdTimestamp);
    });

    runInAction(() => {
      this.isInitialized = true;
    });
  }

  protected async ensureInit(): Promise<void> {
    // Disable on firefox
    if (this.isFirefox) {
      return;
    }

    if (this.isInitialized) {
      return;
    }

    if (!this.isInitialized) {
      let disposal: (() => void) | undefined;
      await new Promise<void>((resolve) => {
        disposal = autorun(() => {
          if (this.isInitialized) {
            resolve();
          }
        });
      });
      if (disposal) {
        disposal();
      }
    }
  }

  getAndUpdateSessionId(): string {
    const now = Date.now();
    // session duration is 15 minutes.
    if (
      this._sessionId &&
      this._sessionIdTimestamp &&
      now - this._sessionIdTimestamp < 15 * 60 * 1000
    ) {
      runInAction(() => {
        this._sessionIdTimestamp = now;
      });
      return this._sessionId;
    } else {
      const bz = new Uint8Array(12);
      crypto.getRandomValues(bz);
      const sessionId = Buffer.from(bz).toString("hex");
      runInAction(() => {
        this._sessionId = sessionId;
        this._sessionIdTimestamp = now;
      });
      return sessionId;
    }
  }

  public logEvent(eventName: string, eventProperties?: Properties): void {
    if (!this.apiKey) return;

    // Disable on firefox
    if (this.isFirefox) {
      return;
    }

    this.ensureInit().then(() => {
      // Disable on firefox
      if (this.isFirefox) {
        return;
      }

      const userId = amplitude.getUserId();

      if (!userId) {
        return;
      }

      amplitude.track(eventName, {
        ...eventProperties,
        session_id: this.getAndUpdateSessionId(),
      });
    });
  }

  @action
  public setUserProperties(properties: Properties): void {
    // Disable on firefox
    if (this.isFirefox) {
      return;
    }

    if (!this.apiKey) {
      return;
    }

    const userId = amplitude.getUserId();

    if (!userId) {
      return;
    }

    const identify = new amplitude.Identify();
    Object.entries(properties).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        identify.set(key, value);
      }
    });
    amplitude.identify(identify);
  }

  @action
  public incrementUserProperty(
    propertyName: string,
    incrementValue: number
  ): void {
    // Disable on firefox
    if (this.isFirefox) {
      return;
    }

    if (!this.apiKey) {
      return;
    }

    const userId = amplitude.getUserId();

    if (!userId) {
      return;
    }

    const identify = new amplitude.Identify();
    identify.add(propertyName, incrementValue);
    amplitude.identify(identify);
  }
}

export const logNobleClaimAnalytics = async (
  chainStore: IChainStore,
  queriesStore: IQueriesStore<NobleQueries>,
  accountStore: IAccountStore,
  analyticsAmplitudeStore: AnalyticsAmplitudeStore,
  eventName: string
) => {
  const chainId = NOBLE_CHAIN_ID;
  const chainInfo = chainStore.getChain(chainId);
  const currency = await chainInfo.findCurrencyAsync("uusdn");
  const bech32Address = accountStore.getAccount(chainId).bech32Address;

  if (!bech32Address) return;

  if (!currency) {
    console.error(
      `Failed to find currency info for uusdn on ${chainInfo.chainName} chain`
    );

    return;
  }

  const claimableAmountMinimalStr = queriesStore
    .get(chainId)
    .noble.queryYield.getQueryBech32Address(bech32Address).claimableAmount;
  const claimableCoinPretty = new CoinPretty(
    currency,
    claimableAmountMinimalStr
  );
  const claimableAmountDec = claimableCoinPretty.toDec();

  analyticsAmplitudeStore.logEvent(eventName, {
    itemKind: "button",
    nobleEarnClaimAmount: Number(claimableAmountDec.toString()),
  });
  analyticsAmplitudeStore.incrementUserProperty(
    "noble_earn_claim_amount",
    Number(claimableAmountDec.toString())
  );
};
