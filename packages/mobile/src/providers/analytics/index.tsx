import { Amplitude } from "@amplitude/react-native";
import { makeObservable, observable } from "mobx";
import { EventProperties, UserProperties } from "@keplr-wallet/analytics";
import { sha256 } from "sha.js";
import React, {
  createContext,
  useState,
  useContext,
  FunctionComponent,
} from "react";

export class KeplrAnalyticsRn {
  @observable
  protected _isInitialized: boolean = false;

  protected amplitudeClient: Amplitude;

  constructor(protected readonly apiKey: string) {
    makeObservable(this);

    this.amplitudeClient = Amplitude.getInstance();
    this.amplitudeClient.init(apiKey);

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
      eventProperties.currentChainIdPrefix = eventProperties.currentChainId.split(
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

const AnalyticsContext = createContext<KeplrAnalyticsRn | null>(null);

export const AnalyticsProvider: FunctionComponent<{ apiKey: string }> = ({
  apiKey,
  children,
}) => {
  const [analytics] = useState(() => new KeplrAnalyticsRn(apiKey));

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
