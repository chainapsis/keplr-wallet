import { AnalyticsClient, Properties } from "@keplr-wallet/analytics";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import {
  action,
  autorun,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";
import { KVStore } from "@keplr-wallet/common";
import { Buffer } from "buffer/";

// https://developer.chrome.com/docs/extensions/mv3/tut_analytics/
export class ExtensionAnalyticsClient implements AnalyticsClient {
  @observable
  protected isInitialized: boolean = false;

  @observable
  protected _userId: string = "";
  @observable.ref
  protected _userProperties: Properties = {};
  @observable
  protected _sessionId: string = "";
  @observable
  protected _sessionIdTimestamp: number = 0;

  protected isFirefox: boolean = false;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly apiKey: string,
    protected readonly measurementId: string
  ) {
    makeObservable(this);

    this.init();
  }

  protected async init() {
    // Disable on firefox
    if (typeof browser.runtime.getBrowserInfo === "function") {
      const browserInfo = await browser.runtime.getBrowserInfo();
      if (browserInfo.name === "Firefox") {
        this.isFirefox = true;
        runInAction(() => {
          this.isInitialized = true;
        });
        return;
      }
    }

    const userId = await this.kvStore.get<string>("user_id");
    if (userId) {
      runInAction(() => {
        this._userId = userId;
      });
    }
    const userProperties = await this.kvStore.get<Properties>(
      "user_properties"
    );
    if (userProperties) {
      runInAction(() => {
        this._userProperties = userProperties;
      });
    }
    const sessionId = await this.kvStore.get<string>("session_id");
    if (sessionId) {
      runInAction(() => {
        this._sessionId = sessionId;
      });
    }
    const sessionIdTimestamp = await this.kvStore.get<number>(
      "session_id_timestamp"
    );
    if (sessionIdTimestamp) {
      runInAction(() => {
        this._sessionIdTimestamp = sessionIdTimestamp;
      });
    }

    autorun(() => {
      this.kvStore.set("user_id", this._userId);
    });

    autorun(() => {
      this.kvStore.set("user_properties", toJS(this._userProperties));
    });

    autorun(() => {
      this.kvStore.set("session_id", this._sessionId);
    });

    autorun(() => {
      this.kvStore.set("session_id_timestamp", this._sessionIdTimestamp);
    });

    runInAction(() => {
      this.isInitialized = true;
    });
  }

  protected async ensureInit(): Promise<void> {
    // Disable on firefox
    if (this.isFirefox) {
      return;
    }

    if (this.isInitialized && this._userId) {
      return;
    }

    if (!this.isInitialized) {
      let disposal: (() => void) | undefined;
      await new Promise<void>((resolve) => {
        disposal = autorun(() => {
          if (this.isInitialized) {
            resolve();
          }
        });
      });
      if (disposal) {
        disposal();
      }
    }

    if (!this._userId) {
      let disposal: (() => void) | undefined;
      await new Promise<void>((resolve) => {
        disposal = autorun(() => {
          if (this._userId) {
            resolve();
          }
        });
      });
      if (disposal) {
        disposal();
      }
    }
  }

  getAndUpdateSessionId(): string {
    const now = Date.now();
    // session duration is 15 minutes.
    if (
      this._sessionId &&
      this._sessionIdTimestamp &&
      now - this._sessionIdTimestamp < 15 * 60 * 1000
    ) {
      runInAction(() => {
        this._sessionIdTimestamp = now;
      });
      return this._sessionId;
    } else {
      const bz = new Uint8Array(12);
      crypto.getRandomValues(bz);
      const sessionId = Buffer.from(bz).toString("hex");
      runInAction(() => {
        this._sessionId = sessionId;
        this._sessionIdTimestamp = now;
      });
      return sessionId;
    }
  }

  @action
  public setUserId(userId: string): void {
    // Disable on firefox
    if (this.isFirefox) {
      return;
    }

    this._userId = userId;
  }

  public logEvent(eventName: string, eventProperties?: Properties): void {
    // Disable on firefox
    if (this.isFirefox) {
      return;
    }

    this.ensureInit().then(() => {
      // Disable on firefox
      if (this.isFirefox) {
        return;
      }

      simpleFetch(
        `https://www.google-analytics.com`,
        `/mp/collect?measurement_id=${this.measurementId}&api_secret=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: this._userId,
            user_id: this._userId,
            events: [
              {
                name: eventName,
                params: {
                  ...eventProperties,
                  session_id: this.getAndUpdateSessionId(),
                  engagement_time_msec: 100,
                },
              },
            ],
            user_properties: (() => {
              const res: Record<
                string,
                {
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string | number>
                    | undefined
                    | null;
                }
              > = {};
              for (const key in this._userProperties) {
                res[key] = {
                  value: this._userProperties[key],
                };
              }
              return res;
            })(),
          }),
        }
      ).catch((e) => {
        console.log(e);
      });
    });
  }

  @action
  public setUserProperties(properties: Properties): void {
    // Disable on firefox
    if (this.isFirefox) {
      return;
    }

    this._userProperties = {
      ...this._userProperties,
      ...properties,
    };
  }
}
