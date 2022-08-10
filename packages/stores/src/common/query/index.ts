import {
  action,
  autorun,
  computed,
  flow,
  makeObservable,
  observable,
  onBecomeObserved,
  onBecomeUnobserved,
  reaction,
} from "mobx";
import Axios, { AxiosInstance, CancelToken, CancelTokenSource } from "axios";
import { KVStore, toGenerator } from "@keplr-wallet/common";
import { DeepReadonly } from "utility-types";
import { HasMapStore } from "../map";
import EventEmitter from "eventemitter3";

export type QueryOptions = {
  // millisec
  cacheMaxAge: number;
  // millisec
  fetchingInterval: number;
};

export const defaultOptions: QueryOptions = {
  cacheMaxAge: Number.MAX_VALUE,
  fetchingInterval: 0,
};

export type QueryError<E> = {
  status: number;
  statusText: string;
  message: string;
  data?: E;
};

export type QueryResponse<T> = {
  status: number;
  data: T;
  staled: boolean;
  timestamp: number;
};

export class DeferInitialQueryController {
  @observable
  protected _isReady: boolean = false;

  @action
  ready() {
    this._isReady = true;
  }

  wait(): Promise<void> {
    if (this.isReady) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const disposer = autorun(() => {
        if (this.isReady) {
          resolve();
          if (disposer) {
            disposer();
          }
        }
      });
    });
  }

  get isReady(): boolean {
    return this._isReady;
  }
}

/**
 * Base of the observable query classes.
 * This recommends to use the Axios to query the response.
 */
export abstract class ObservableQueryBase<T = unknown, E = unknown> {
  /**
   * Allows to decide when to start the first query.
   *
   * This is a temporarily added feature to implement custom rpc/lcd feature in keplr extension or mobile.
   * Because custom rpc/lcd are handled in the background process and the front-end cannot synchronously get those values,
   * Rather than not showing the UI to the user during the delay, the UI is shown and the start of the query is delayed immediately after getting those values.
   *
   * XXX: Having a global field for this feature doesn't seem desirable in the long run.
   *      Unless it's a keplr extension or mobile, you don't need to care about this field.
   *      This field will soon be removed and can be replaced by other implementation.
   *
   */
  public static experimentalDeferInitialQueryController:
    | DeferInitialQueryController
    | undefined = undefined;

  protected static suspectedResponseDatasWithInvalidValue: string[] = [
    "The network connection was lost.",
    "The request timed out.",
  ];

  protected static guessResponseTruncated(headers: any, data: string): boolean {
    return (
      headers &&
      typeof headers["content-type"] === "string" &&
      headers["content-type"].startsWith("application/json") &&
      data.startsWith("{")
    );
  }

  protected options: QueryOptions;

  // Just use the oberable ref because the response is immutable and not directly adjusted.
  @observable.ref
  private _response?: Readonly<QueryResponse<T>> = undefined;

  @observable
  protected _isFetching: boolean = false;

  @observable.ref
  private _error?: Readonly<QueryError<E>> = undefined;

  @observable
  private _isStarted: boolean = false;

  private cancelToken?: CancelTokenSource;

  private observedCount: number = 0;

  // intervalId can be number or NodeJS's Timout object according to the environment.
  // If environment is browser, intervalId should be number.
  // If environment is NodeJS, intervalId should be NodeJS.Timeout.
  private intervalId: number | NodeJS.Timeout | undefined = undefined;

  @observable.ref
  protected _instance: AxiosInstance;

  protected constructor(
    instance: AxiosInstance,
    options: Partial<QueryOptions>
  ) {
    this.options = {
      ...options,
      ...defaultOptions,
    };

    this._instance = instance;

    makeObservable(this);

    onBecomeObserved(this, "_response", this.becomeObserved);
    onBecomeObserved(this, "_isFetching", this.becomeObserved);
    onBecomeObserved(this, "_error", this.becomeObserved);

    onBecomeUnobserved(this, "_response", this.becomeUnobserved);
    onBecomeUnobserved(this, "_isFetching", this.becomeUnobserved);
    onBecomeUnobserved(this, "_error", this.becomeUnobserved);
  }

  private becomeObserved = (): void => {
    if (this.observedCount === 0) {
      this.start();
    }
    this.observedCount++;
  };

  private becomeUnobserved = (): void => {
    this.observedCount--;
    if (this.observedCount === 0) {
      this.stop();
    }
  };

  public get isObserved(): boolean {
    return this.observedCount > 0;
  }

  @action
  private start() {
    if (!this._isStarted) {
      this._isStarted = true;
      this.onStart();
    }
  }

  @action
  private stop() {
    if (this._isStarted) {
      this.onStop();
      this._isStarted = false;
    }
  }

  public get isStarted(): boolean {
    return this._isStarted;
  }

  private readonly intervalFetch = () => {
    if (!this.isFetching) {
      this.fetch();
    }
  };

  protected onStart() {
    this.fetch();

    if (this.options.fetchingInterval > 0) {
      this.intervalId = setInterval(
        this.intervalFetch,
        this.options.fetchingInterval
      );
    }
  }

  protected onStop() {
    this.cancel();

    if (this.intervalId != null) {
      clearInterval(this.intervalId as NodeJS.Timeout);
    }
  }

  protected canFetch(): boolean {
    return true;
  }

  get isFetching(): boolean {
    return this._isFetching;
  }

  // Return the instance.
  // You can memorize this by using @computed if you need to override this.
  // NOTE: If this getter returns the different instance with previous instance.
  // It will be used in the latter fetching.
  @computed
  protected get instance(): DeepReadonly<AxiosInstance> {
    return this._instance;
  }

  @flow
  *fetch(): Generator<unknown, any, any> {
    // If not started, do nothing.
    if (!this.isStarted) {
      return;
    }

    if (
      ObservableQueryBase.experimentalDeferInitialQueryController &&
      !ObservableQueryBase.experimentalDeferInitialQueryController.isReady
    ) {
      this._isFetching = true;
      yield ObservableQueryBase.experimentalDeferInitialQueryController.wait();
    }

    if (!this.canFetch()) {
      return;
    }

    // If response is fetching, cancel the previous query.
    if (this.isFetching) {
      this.cancel();
    }

    this._isFetching = true;

    // If there is no existing response, try to load saved reponse.
    if (!this._response) {
      // When first load, try to load the last response from disk.
      // To improve performance, don't wait the loading to proceed.
      // Use the last saved response if the last saved response exists and the current response hasn't been set yet.
      this.loadStaledResponse().then((staledResponse) => {
        if (staledResponse && !this._response) {
          if (
            staledResponse.timestamp >
            Date.now() - this.options.cacheMaxAge
          ) {
            this.setResponse(staledResponse);
          }
        }
      });
    } else {
      // Make the existing response as staled.
      this.setResponse({
        ...this._response,
        staled: true,
      });
    }

    this.cancelToken = Axios.CancelToken.source();

    try {
      let { response, headers } = yield* toGenerator(
        this.fetchResponse(this.cancelToken.token)
      );
      if (
        response.data &&
        typeof response.data === "string" &&
        (response.data.startsWith("stream was reset:") ||
          ObservableQuery.suspectedResponseDatasWithInvalidValue.includes(
            response.data
          ) ||
          ObservableQuery.guessResponseTruncated(headers, response.data))
      ) {
        // In some devices, it is a http ok code, but a strange response is sometimes returned.
        // It's not that they can't query at all, it seems that they get weird response from time to time.
        // These causes are not clear.
        // To solve this problem, if this problem occurs, try the query again, and if that fails, an error is raised.
        // https://github.com/chainapsis/keplr-wallet/issues/275
        // https://github.com/chainapsis/keplr-wallet/issues/278
        // https://github.com/chainapsis/keplr-wallet/issues/318
        if (this.cancelToken && this.cancelToken.token.reason) {
          // In this case, it is assumed that it is caused by cancel() and do nothing.
          return;
        }

        console.log(
          "There is an unknown problem to the response. Request one more time."
        );

        // Try to query again.
        const refetched = yield* toGenerator(
          this.fetchResponse(this.cancelToken.token)
        );
        response = refetched.response;
        headers = refetched.headers;

        if (response.data && typeof response.data === "string") {
          if (
            response.data.startsWith("stream was reset:") ||
            ObservableQuery.suspectedResponseDatasWithInvalidValue.includes(
              response.data
            )
          ) {
            throw new Error(response.data);
          }

          if (ObservableQuery.guessResponseTruncated(headers, response.data)) {
            throw new Error("The response data seems to be truncated");
          }
        }
      }
      this.setResponse(response);
      // Clear the error if fetching succeeds.
      this.setError(undefined);

      // Should not wait.
      this.saveResponse(response);
    } catch (e) {
      // If canceld, do nothing.
      if (Axios.isCancel(e)) {
        return;
      }

      // If error is from Axios, and get response.
      if (e.response) {
        const error: QueryError<E> = {
          status: e.response.status,
          statusText: e.response.statusText,
          message: e.response.statusText,
          data: e.response.data,
        };

        this.setError(error);
      } else if (e.request) {
        // if can't get the response.
        const error: QueryError<E> = {
          status: 0,
          statusText: "Failed to get response",
          message: "Failed to get response",
        };

        this.setError(error);
      } else {
        const error: QueryError<E> = {
          status: 0,
          statusText: e.message,
          message: e.message,
          data: e,
        };

        this.setError(error);
      }
    } finally {
      this._isFetching = false;
      this.cancelToken = undefined;
    }
  }

  public get response() {
    return this._response;
  }

  public get error() {
    return this._error;
  }

  @action
  protected setResponse(response: Readonly<QueryResponse<T>>) {
    this._response = response;
  }

  @action
  protected setError(error: QueryError<E> | undefined) {
    this._error = error;
  }

  public cancel(): void {
    if (this.cancelToken) {
      this.cancelToken.cancel();
    }
  }

  /**
   * Wait the response and return the response without considering it is staled or fresh.
   */
  waitResponse(): Promise<Readonly<QueryResponse<T>> | undefined> {
    if (!this.isFetching) {
      return Promise.resolve(this.response);
    }

    return new Promise((resolve) => {
      const disposer = autorun(() => {
        if (!this.isFetching) {
          resolve(this.response);
          if (disposer) {
            disposer();
          }
        }
      });
    });
  }

  /**
   * Wait the response and return the response until it is fetched.
   */
  waitFreshResponse(): Promise<Readonly<QueryResponse<T>> | undefined> {
    let onceCoerce = false;
    // Make sure that the fetching is tracked to force to be fetched.
    const reactionDisposer = reaction(
      () => this.isFetching,
      () => {
        if (!onceCoerce) {
          if (!this.isFetching) {
            this.fetch();
          }
          onceCoerce = true;
        }
      },
      {
        fireImmediately: true,
      }
    );

    return new Promise((resolve) => {
      const disposer = autorun(() => {
        if (!this.isFetching) {
          resolve(this.response);
          if (reactionDisposer) {
            reactionDisposer();
          }
          if (disposer) {
            disposer();
          }
        }
      });
    });
  }

  protected abstract fetchResponse(
    cancelToken: CancelToken
  ): Promise<{ response: QueryResponse<T>; headers: any }>;

  /**
   * Used for saving the last response to disk.
   * This should not make observable state changes.
   * @param response
   * @protected
   */
  protected abstract saveResponse(
    response: Readonly<QueryResponse<T>>
  ): Promise<void>;

  /**
   * Used for loading the last response from disk.
   * @protected
   */
  protected abstract loadStaledResponse(): Promise<
    QueryResponse<T> | undefined
  >;
}

/**
 * ObservableQuery defines the event class to query the result from endpoint.
 * This supports the stale state if previous query exists.
 */
export class ObservableQuery<
  T = unknown,
  E = unknown
> extends ObservableQueryBase<T, E> {
  protected static eventListener: EventEmitter = new EventEmitter();

  public static refreshAllObserved() {
    ObservableQuery.eventListener.emit("refresh");
  }

  public static refreshAllObservedIfError() {
    ObservableQuery.eventListener.emit("refresh", {
      ifError: true,
    });
  }

  @observable
  protected _url: string = "";

  constructor(
    protected readonly kvStore: KVStore,
    instance: AxiosInstance,
    url: string,
    options: Partial<QueryOptions> = {}
  ) {
    super(instance, options);
    makeObservable(this);

    this.setUrl(url);
  }

  protected onStart() {
    super.onStart();

    ObservableQuery.eventListener.addListener("refresh", this.refreshHandler);
  }

  protected onStop() {
    super.onStop();

    ObservableQuery.eventListener.addListener("refresh", this.refreshHandler);
  }

  protected readonly refreshHandler = (data: any) => {
    const ifError = data?.ifError;
    if (ifError) {
      if (this.error) {
        this.fetch();
      }
    } else {
      this.fetch();
    }
  };

  get url(): string {
    return this._url;
  }

  @action
  protected setUrl(url: string) {
    if (this._url !== url) {
      this._url = url;
      this.fetch();
    }
  }

  protected async fetchResponse(
    cancelToken: CancelToken
  ): Promise<{ response: QueryResponse<T>; headers: any }> {
    const result = await this.instance.get<T>(this.url, {
      cancelToken,
    });
    return {
      headers: result.headers,
      response: {
        data: result.data,
        status: result.status,
        staled: false,
        timestamp: Date.now(),
      },
    };
  }

  protected getCacheKey(): string {
    return `${this.instance.name}-${
      this.instance.defaults.baseURL
    }${this.instance.getUri({
      url: this.url,
    })}`;
  }

  protected async saveResponse(
    response: Readonly<QueryResponse<T>>
  ): Promise<void> {
    const key = this.getCacheKey();
    await this.kvStore.set(key, response);
  }

  protected async loadStaledResponse(): Promise<QueryResponse<T> | undefined> {
    const key = this.getCacheKey();
    const response = await this.kvStore.get<QueryResponse<T>>(key);
    if (response) {
      return {
        ...response,
        staled: true,
      };
    }
    return undefined;
  }
}

export class ObservableQueryMap<T = unknown, E = unknown> extends HasMapStore<
  ObservableQuery<T, E>
> {
  constructor(creater: (key: string) => ObservableQuery<T, E>) {
    super(creater);
  }
}

export * from "./json-rpc";
