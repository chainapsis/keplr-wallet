import { Amplitude } from "@amplitude/react-native";
import { makeObservable, observable } from "mobx";
import { EventProperties, UserProperties } from "@keplr-wallet/analytics";
import { sha256 } from "sha.js";

export class KeplrAnalyticsRn<
  EP extends EventProperties,
  UP extends UserProperties
> {
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

  logScreenView(screenName: string, eventProperties?: EP): void {
    this.logEvent(`${screenName} viewed`, eventProperties);
  }
}
