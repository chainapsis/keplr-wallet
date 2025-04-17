export type AnalyticsTarget = "ga" | "amplitude" | "all";

export type Properties = Record<
  string,
  string | number | boolean | Array<string | number> | undefined | null
>;

export interface AnalyticsClient {
  setUserId(userId: string | null): void;
  logEvent(
    eventName: string,
    eventProperties?: Properties,
    target?: AnalyticsTarget
  ): void;
  setUserProperties(properties: Properties): void;
  incrementUserProperty(propertyName: string, incrementValue: number): void;
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
        eventProperties?: E,
        target?: AnalyticsTarget
      ) => {
        eventName: string;
        eventProperties?: E;
        target?: AnalyticsTarget;
      };
    } = {}
  ) {}

  setUserId(id: string): void {
    this.analyticsClient.setUserId(id);
  }

  setUserProperties(userProperties: U): void {
    this.analyticsClient.setUserProperties(userProperties);
  }

  incrementUserProperty(propertyName: string, incrementValue: number): void {
    this.analyticsClient.incrementUserProperty(propertyName, incrementValue);
  }

  logEvent(
    eventName: string,
    eventProperties?: E,
    target: AnalyticsTarget = "ga"
  ): void {
    if (this.middleware.logEvent) {
      const res = this.middleware.logEvent(eventName, eventProperties, target);
      eventName = res.eventName;
      eventProperties = res.eventProperties;
      target = res.target || target;
    }

    this.analyticsClient.logEvent(eventName, eventProperties, target);
  }
}
