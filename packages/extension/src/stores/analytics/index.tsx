import Amplitude from "amplitude-js";
import { makeObservable, observable } from "mobx";

import { sha256 } from "sha.js";

export type AmplitudeConfig = Amplitude.Config;
export interface AnalyticsConfigs {
  amplitudeConfig: AmplitudeConfig;
}
export interface EventProperties {
  chainId?: string;
  chainName?: string;
  validatorName?: string;
  proposalId?: string;
  proposalTitle?: string;
  linkTitle?: string;
  linkUrl?: string;
}

export class AnalyticsStore {
  @observable
  protected _isInitialized: boolean = false;
  protected appName: string = "Unknown";
  protected amplitudeAnalytics?: Amplitude.AmplitudeClient;

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  constructor(appName: string, configs: AnalyticsConfigs) {
    makeObservable(this);

    this.appName = appName;

    this.initializeAnalytics(configs);
  }

  initializeAnalytics(configs: AnalyticsConfigs): void {
    if (configs.amplitudeConfig) {
      this.amplitudeAnalytics = Amplitude.getInstance();
      this.amplitudeAnalytics.init(
        "03e0234602d4044c9123bdad308fa1bc",
        undefined,
        configs.amplitudeConfig
      );
    }

    this._isInitialized = true;
  }

  // Set the user id with the hashed address.
  // Use this address with common address that can be dealt with the user without considering the selected chain.
  // For example, the address will be different according to the chains (cosmoshub, secret, kava...),
  // but we want to classify the user without considering the chains.
  // So, I recommend to use only the address of the main chain (probably cosmoshub).
  setAddressAsId(address: string): void {
    if (!this.amplitudeAnalytics) {
      return;
    }

    const hashed = new sha256().update(address).digest("hex");

    this.amplitudeAnalytics.setUserId(hashed);
  }

  logEvent(
    eventName: string,
    eventProperties?: EventProperties | undefined
  ): void {
    if (!eventName || !this.amplitudeAnalytics) {
      return;
    }

    this.amplitudeAnalytics.logEvent(eventName, eventProperties);
  }

  logScreenView(
    screenName: string,
    eventProperties?: EventProperties | undefined
  ): void {
    this.logEvent(`${screenName} viewed`, eventProperties);
  }
}
