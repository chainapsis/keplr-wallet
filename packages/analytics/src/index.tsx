import Amplitude from "amplitude-js";
import { makeObservable, observable } from "mobx";
import { FeeType } from "@keplr-wallet/hooks";
import { sha256 } from "sha.js";
import React, {
  createContext,
  useState,
  useContext,
  FunctionComponent,
} from "react";

export type EventProperties = {
  currentChainId?: string;
  currentChainIdPrefix?: string;
  currentChainName?: string;
  chainId?: string;
  chainIdPrefix?: string;
  chainName?: string;
  toChainId?: string;
  toChainIdPrefix?: string;
  toChainName?: string;
  validatorName?: string;
  proposalId?: string;
  proposalTitle?: string;
  linkTitle?: string;
  linkUrl?: string;
  registerType?: "seed" | "google" | "ledger" | "qr";
  accountType?: "mnemonic" | "privateKey" | "ledger";
  authType?: "biometrics" | "password";
  feeType?: FeeType | undefined;
  isSuccess?: boolean;
  isIbc?: boolean;
  fromScreen?: "Transaction" | "Setting";
  rpc?: string;
  rest?: string;
};

export type UserProperties = {
  registerType?: "seed" | "google" | "ledger" | "qr";
  accountType?: "mnemonic" | "privateKey" | "ledger";
  currency?: string;
  language?: string;
  hasExtensionAccount?: boolean;
};

type AmplitudeConfig = Amplitude.Config;
type AnalyticsConfigs = {
  amplitudeConfig: AmplitudeConfig;
};

export class KeplrAnalytics {
  @observable
  protected _isInitialized: boolean = false;

  protected amplitudeClient: Amplitude.AmplitudeClient;

  constructor(
    protected readonly platformName: string,
    protected readonly configs?: AnalyticsConfigs
  ) {
    makeObservable(this);

    this.amplitudeClient = Amplitude.getInstance();
    this.amplitudeClient.init("dbcaf47e30aae5b712bda7f892b2f0c4", undefined, {
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

  setUserProperties(userProperties: UserProperties): void {
    this.amplitudeClient.setUserProperties(userProperties);
  }

  logEvent(
    eventName: string,
    eventProperties?: EventProperties | undefined
  ): void {
    if (eventProperties && eventProperties.currentChainId) {
      eventProperties.chainIdPrefix = eventProperties.currentChainId.split(
        "-"
      )[0];
    }
    if (eventProperties && eventProperties.chainId) {
      eventProperties.chainIdPrefix = eventProperties.chainId.split("-")[0];
    }
    if (eventProperties && eventProperties.toChainId) {
      eventProperties.toChainIdPrefix = eventProperties.toChainId.split("-")[0];
    }

    this.amplitudeClient.logEvent(eventName, eventProperties);
  }

  logScreenView(
    screenName: string,
    eventProperties?: EventProperties | undefined
  ): void {
    this.logEvent(`${screenName} viewed`, eventProperties);
  }
}

const AnalyticsContext = createContext<KeplrAnalytics | null>(null);

export const AnalyticsProvider: FunctionComponent<{
  platformName: string;
  configs?: AnalyticsConfigs;
}> = ({ platformName, configs, children }) => {
  const [analytics] = useState(() => new KeplrAnalytics(platformName, configs));

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const analytics = useContext(AnalyticsContext);
  if (!analytics) {
    throw new Error("You have forgot to use AnalyticsProvider");
  }

  return analytics;
};
