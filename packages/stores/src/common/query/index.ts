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

/**
 * Base of the observable query classes.
 * This recommends to use the Axios to query the response.
 */
export abstract class ObservableQueryBase<T = unknown, E = unknown> {
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
    if (this.isStarted) {
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
      const staledResponse = yield* toGenerator(this.loadStaledResponse());
      if (staledResponse) {
        if (staledResponse.timestamp > Date.now() - this.options.cacheMaxAge) {
          this.setResponse(staledResponse);
        }
      }
    } else {
      // Make the existing response as staled.
      this.setResponse({
        ...this._response,
        staled: true,
      });
    }

    this.cancelToken = Axios.CancelToken.source();

    try {
      const response = yield* toGenerator(
        this.fetchResponse(this.cancelToken.token)
      );
      this.setResponse(response);
      // Clear the error if fetching succeeds.
      this.setError(undefined);
      yield this.saveResponse(response);
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
          this.fetch();
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
  ): Promise<QueryResponse<T>>;

  protected abstract saveResponse(
    response: Readonly<QueryResponse<T>>
  ): Promise<void>;

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
  ): Promise<QueryResponse<T>> {
    const result = await this.instance.get<T>(this.url, {
      cancelToken,
    });
    return {
      data: result.data,
      status: result.status,
      staled: false,
      timestamp: Date.now(),
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
