import { AnalyticsClient, Properties } from "@keplr-wallet/analytics";

import {
  init as amplitudeInit,
  Identify as AmplitudeIdentify,
  setUserId as amplitudeSetUserId,
  track as amplitudeTrack,
  identify as amplitudeIdentify,
} from "@amplitude/analytics-browser";

export class ExtensionAnalyticsClient implements AnalyticsClient {
  constructor(apiKey: string) {
    amplitudeInit(apiKey);
  }

  public setUserId(userId: string): void {
    amplitudeSetUserId(userId);
  }

  public logEvent(eventName: string, eventProperties?: Properties): void {
    amplitudeTrack(eventName, eventProperties);
  }

  public setUserProperties(properties: Properties): void {
    const identify = Object.entries(properties).reduce(
      (identify, [propertyKey, propertyValue]) => {
        if (propertyValue !== undefined && propertyValue !== null) {
          return identify.set(propertyKey, propertyValue);
        }

        return identify;
      },
      new AmplitudeIdentify()
    );

    amplitudeIdentify(identify);
  }
}
