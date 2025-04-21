export type Properties = Record<
  string,
  string | number | boolean | Array<string | number> | undefined | null
>;

export interface AnalyticsClient {
  setUserId(userId: string | null): void;
  logEvent(eventName: string, eventProperties?: Properties): void;
  setUserProperties(properties: Properties): void;
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
  E extends Properties = Properties,
  U extends Properties = Properties
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

  setUserId(id: string): void {
    this.analyticsClient.setUserId(id);
  }

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
}
