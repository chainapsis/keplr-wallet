import Amplitude from "amplitude-js";
import { makeObservable, observable } from "mobx";
import { sha256 } from "sha.js";

export interface EventProperties extends Record<string, unknown> {
  chainId?: string;
  chainName?: string;
  chainIdPrefix?: string;
  toChainId?: string;
  toChainName?: string;
  toChainIdPrefix?: string;
}

export interface UserProperties extends Record<string, unknown> {
  registerType?: string;
  accountType?: string;
  currency?: string;
  language?: string;
}

type AmplitudeConfig = Amplitude.Config;
type AnalyticsConfigs = {
  amplitudeConfig: AmplitudeConfig;
};

export class KeplrAnalytics<
  EP extends EventProperties,
  UP extends UserProperties
> {
  @observable
  protected _isInitialized: boolean = false;

  protected amplitudeClient: Amplitude.AmplitudeClient;

  constructor(
    protected readonly apiKey: string,
    protected readonly platformName: string,
    protected readonly configs?: AnalyticsConfigs
  ) {
    makeObservable(this);

    this.amplitudeClient = Amplitude.getInstance();
    this.amplitudeClient.init(apiKey, undefined, {
      includeUtm: true,
      includeReferrer: true,
      includeFbclid: true,
      includeGclid: true,
      saveEvents: true,
      saveParamsReferrerOncePerSession: false,
      ...configs?.amplitudeConfig,
      platform: platformName,
    });

    this._isInitialized = true;
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  // Set the user id with the hashed address.
  // Use this address with common address that can be dealt with the user without considering the selected chain.
  // For example, the address will be different according to the chains (cosmoshub, secret, kava...),
  // but we want to classify the user without considering the chains.
  // So, I recommend to use only the address of the main chain (probably cosmoshub).
  setUserId(bech32Address: string): void {
    const hashedAddress = new sha256().update(bech32Address).digest("hex");
    this.amplitudeClient.setUserId(hashedAddress);
  }

  setUserProperties(userProperties: UP): void {
    this.amplitudeClient.setUserProperties(userProperties);
  }

  logEvent(eventName: string, eventProperties?: EP): void {
    if (eventProperties && eventProperties.chainId) {
      eventProperties.chainIdPrefix = eventProperties.chainId.split("-")[0];
    }
    if (eventProperties && eventProperties.toChainId) {
      eventProperties.toChainIdPrefix = eventProperties.toChainId.split("-")[0];
    }

    this.amplitudeClient.logEvent(eventName, eventProperties);
  }

  logPageView(pageName: string, eventProperties?: EP): void {
    this.logEvent(`${pageName} viewed`, eventProperties);
  }
}
