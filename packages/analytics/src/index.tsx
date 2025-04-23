export type Properties = Record<
  string,
  string | number | boolean | Array<string | number> | undefined | null
>;

export interface AnalyticsClient {
  setUserId(userId: string | null): void;
  logEvent(eventName: string, eventProperties?: Properties): void;
  setUserProperties(properties: Properties): void;
}

export interface AnalyticsClientV2 {
  logEvent(eventName: string, eventProperties?: Properties): void;
  setUserProperties(properties: Properties): void;
  incrementUserProperty(key: string, value: number): void;
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

export class NoopAnalyticsClientV2 implements AnalyticsClientV2 {
  logEvent(): void {
    // noop
  }

  setUserProperties(): void {
    // noop
  }

  incrementUserProperty(): void {
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

export class AnalyticsAmplitudeStore<
  E extends Properties = Properties,
  U extends Properties = Properties
> {
  constructor(
    protected readonly analyticsClient: AnalyticsClientV2,
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

  setUserProperties(userProperties: U): void {
    this.analyticsClient.setUserProperties(userProperties);
  }

  incrementUserProperty(key: string, value: number): void {
    this.analyticsClient.incrementUserProperty(key, value);
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
