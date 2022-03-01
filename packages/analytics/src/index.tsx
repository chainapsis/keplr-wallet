// import { sha256 } from "sha.js";

export interface AnalyticsClient {
  setUserId(userId: string | null): void;
  logEvent(
    eventName: string,
    eventProperties?: Record<
      string,
      Readonly<string | number | boolean | undefined | null>
    >
  ): void;
  setUserProperties(
    properties: Record<
      string,
      Readonly<string | number | boolean | undefined | null>
    >
  ): void;
}

export class NoopAnalyticsClient implements AnalyticsClient {
  logEvent(): void {
    // noop
  }

  setUserId(): void {
    // noop
  }

  setUserProperties(): void {
    // noop
  }
}

export class AnalyticsStore<
  E extends Record<
    string,
    Readonly<string | number | boolean | undefined | null>
  >,
  U extends Record<
    string,
    Readonly<string | number | boolean | undefined | null>
  >
> {
  constructor(
    protected readonly analyticsClient: AnalyticsClient,
    protected readonly middleware: {
      logEvent?: (
        eventName: string,
        eventProperties?: E
      ) => {
        eventName: string;
        eventProperties?: E;
      };
    } = {}
  ) {}

  // Set the user id with the hashed address.
  // Use this address with common address that can be dealt with the user without considering the selected chain.
  // For example, the address will be different according to the chains (cosmoshub, secret, kava...),
  // but we want to classify the user without considering the chains.
  // So, I recommend to use only the address of the main chain (probably cosmoshub).
  // setUserId(bech32Address: string): void {
  //   const hashedAddress = new sha256().update(bech32Address).digest("hex");
  //   this.analyticsClient.setUserId(hashedAddress);
  // }

  setUserProperties(userProperties: U): void {
    this.analyticsClient.setUserProperties(userProperties);
  }

  logEvent(eventName: string, eventProperties?: E): void {
    if (this.middleware.logEvent) {
      const res = this.middleware.logEvent(eventName, eventProperties);
      eventName = res.eventName;
      eventProperties = res.eventProperties;
    }

    this.analyticsClient.logEvent(eventName, eventProperties);
  }

  logPageView(pageName: string, eventProperties?: E): void {
    this.logEvent(`${pageName} viewed`, eventProperties);
  }
}
