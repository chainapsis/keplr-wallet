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
    protected readonly legacyAnalyticsClient: AnalyticsClient,
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

  setUserId(id: string): void {
    this.legacyAnalyticsClient.setUserId(id);
    this.analyticsClient.setUserId(id);
  }

  setUserProperties(userProperties: U): void {
    this.legacyAnalyticsClient.setUserProperties(userProperties);
    this.analyticsClient.setUserProperties(userProperties);
  }

  logEvent(eventName: string, eventProperties?: E): void {
    if (this.middleware.logEvent) {
      const res = this.middleware.logEvent(eventName, eventProperties);
      eventName = res.eventName;
      eventProperties = res.eventProperties;
    }

    this.legacyAnalyticsClient.logEvent(eventName, eventProperties);
    this.analyticsClient.logEvent(eventName, eventProperties);
  }

  logPageView(pageName: string, eventProperties?: E): void {
    this.logEvent(`${pageName} viewed`, eventProperties);
  }
}
