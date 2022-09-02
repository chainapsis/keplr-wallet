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
  readonly cacheMaxAge: number;
  // millisec
  readonly fetchingInterval: number;
};

export const defaultOptions: QueryOptions = {
  cacheMaxAge: 0,
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

class ImmediateCancelerError extends Error {
  constructor(m?: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ImmediateCancelerError.prototype);
  }
}

class ImmediateCanceler {
  protected _isCanceled: boolean = false;
  protected _cancelMessage?: string;

  protected rejector: ((e: Error) => void) | undefined;

  get isCanceled(): boolean {
    return this._isCanceled;
  }

  cancel(message?: string) {
    if (this._isCanceled) {
      return;
    }

    this._isCanceled = true;
    this._cancelMessage = message;
    if (this.rejector) {
      this.rejector(new ImmediateCancelerError(message));
    }
  }

  callOrCanceled<R>(fn: PromiseLike<R>): Promise<R> {
    if (this.isCanceled) {
      throw new ImmediateCancelerError(this._cancelMessage);
    }

    return new Promise<R>((resolve, reject) => {
      this.rejector = reject;
      fn.then(resolve, reject);
    });
  }
}

class AxiosImmediateCanceler extends ImmediateCanceler {
  constructor(protected readonly cancelToken: CancelTokenSource) {
    super();
  }

  cancel(message?: string) {
    this.cancelToken.cancel(message);
    super.cancel(message);
  }
}

export class DeferInitialQueryController {
  @observable
  protected _isReady: boolean = false;

  constructor() {
    makeObservable(this);
  }

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

  protected readonly options: QueryOptions;

  // Just use the oberable ref because the response is immutable and not directly adjusted.
  @observable.ref
  private _response?: Readonly<QueryResponse<T>> = undefined;

  @observable
  protected _isFetching: boolean = false;

  @observable.ref
  private _error?: Readonly<QueryError<E>> = undefined;

  @observable
  private _isStarted: boolean = false;

  private _pendingOnStart: boolean = false;

  private canceler?: AxiosImmediateCanceler;
  private onStartCanceler?: ImmediateCanceler;
  private queryControllerCanceler?: ImmediateCanceler;

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
      ...defaultOptions,
      ...options,
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
      const promise = this.onStart();
      if (promise) {
        this.handleAsyncOnStart(promise);
      } else {
        if (this.onStartCanceler) {
          this.onStartCanceler.cancel();
        }
        this._pendingOnStart = false;
        this.postStart();
      }
    }
  }

  @flow
  private *handleAsyncOnStart(promise: PromiseLike<void>) {
    this._pendingOnStart = true;

    if (this.onStartCanceler) {
      this.onStartCanceler.cancel();
    }

    const canceler = new ImmediateCanceler();
    this.onStartCanceler = canceler;

    try {
      this._isFetching = true;

      yield canceler.callOrCanceled(promise);
      if (this._isStarted) {
        this._pendingOnStart = false;
        this.postStart();
      }
    } catch (e) {
      if (e instanceof ImmediateCancelerError) {
        if (e.message === "__stop__") {
          this._isFetching = false;
        }
        return;
      }
      throw e;
    }
    this.onStartCanceler = undefined;
  }

  @action
  private stop() {
    if (this._isStarted) {
      if (this.onStartCanceler) {
        this.onStartCanceler.cancel("__stop__");
      }

      if (this.isFetching && this.canceler) {
        this.cancel();
      }

      this._isFetching = false;

      if (this.intervalId != null) {
        clearInterval(this.intervalId as NodeJS.Timeout);
      }
      this.intervalId = undefined;

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

  private postStart() {
    this.fetch();

    if (this.options.fetchingInterval > 0) {
      this.intervalId = setInterval(
        this.intervalFetch,
        this.options.fetchingInterval
      );
    }
  }

  protected onStart(): void | Promise<void> {
    // noop yet.
    // Override this if you need something to do whenever starting.
  }

  protected onStop() {
    // noop yet.
    // Override this if you need something to do whenever starting.
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
    if (!this.isStarted || this._pendingOnStart) {
      return;
    }

    if (
      ObservableQueryBase.experimentalDeferInitialQueryController &&
      !ObservableQueryBase.experimentalDeferInitialQueryController.isReady
    ) {
      this._isFetching = true;

      if (this.queryControllerCanceler) {
        this.queryControllerCanceler.cancel();
      }

      const canceler = new ImmediateCanceler();
      this.queryControllerCanceler = canceler;
      try {
        yield canceler.callOrCanceled(
          ObservableQueryBase.experimentalDeferInitialQueryController.wait()
        );
      } catch (e) {
        if (e instanceof ImmediateCancelerError) {
          return;
        }
        throw e;
      }

      // Recheck
      if (!this.isStarted) {
        return;
      }
      this.queryControllerCanceler = undefined;
    }

    if (!this.canFetch()) {
      return;
    }

    // If response is fetching, cancel the previous query.
    if (this.isFetching && this.canceler) {
      this.cancel("__fetching__proceed__next__");
    }

    // If there is no existing response, try to load saved reponse.
    if (!this._response) {
      this._isFetching = true;

      const promise = this.loadStaledResponse();

      const handleStaledResponse = (
        staledResponse: QueryResponse<T> | undefined
      ) => {
        if (staledResponse && !this._response) {
          if (
            this.options.cacheMaxAge <= 0 ||
            staledResponse.timestamp > Date.now() - this.options.cacheMaxAge
          ) {
            this.setResponse(staledResponse);
            return true;
          }
        }
        return false;
      };

      // When first load, try to load the last response from disk.
      // Use the last saved response if the last saved response exists and the current response hasn't been set yet.
      if (this.options.cacheMaxAge <= 0) {
        // To improve performance, don't wait the loading to proceed if cache age not set.
        promise.then((staledResponse) => {
          handleStaledResponse(staledResponse);
        });
      } else {
        const staledResponse = yield* toGenerator(promise);
        if (handleStaledResponse(staledResponse)) {
          this._isFetching = false;
          this.canceler = undefined;
          return;
        }
      }
    } else {
      if (this.options.cacheMaxAge > 0) {
        if (this._response.timestamp > Date.now() - this.options.cacheMaxAge) {
          this._isFetching = false;
          this.canceler = undefined;
          return;
        }
      }

      this._isFetching = true;

      // Make the existing response as staled.
      this.setResponse({
        ...this._response,
        staled: true,
      });
    }

    const cancelToken = Axios.CancelToken.source();
    const canceler = new AxiosImmediateCanceler(cancelToken);
    this.canceler = canceler;

    let fetchingProceedNext = false;
    let skipAxiosCancelError = false;

    try {
      let { response, headers } = yield* toGenerator(
        canceler.callOrCanceled(this.fetchResponse(cancelToken.token))
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
        if (canceler.isCanceled) {
          // In this case, it is assumed that it is caused by cancel() and do nothing.
          return;
        }

        console.log(
          "There is an unknown problem to the response. Request one more time."
        );

        // Try to query again.
        const refetched = yield* toGenerator(
          canceler.callOrCanceled(this.fetchResponse(cancelToken.token))
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
      // If axios canceled, do nothing.
      if (Axios.isCancel(e)) {
        skipAxiosCancelError = true;
        return;
      }

      if (e instanceof ImmediateCancelerError) {
        // When cancel for the next fetching, it behaves differently from other explicit cancels because fetching continues.
        if (e.message === "__fetching__proceed__next__") {
          fetchingProceedNext = true;
        }
        return;
      }

      // If error is from Axios, and get response.
      if (e.response) {
        // Default is status text
        let message: string = e.response.statusText;
        const contentType: string =
          typeof e.response.headers?.["content-type"] === "string"
            ? e.response.headers["content-type"]
            : "";
        // Try to figure out the message from the response.
        // If the contentType in the header is specified, try to use the message from the response.
        if (
          contentType.startsWith("text/plain") &&
          typeof e.response.data === "string"
        ) {
          message = e.response.data;
        }
        // If the response is an object and "message" field exists, it is used as a message.
        if (
          contentType.startsWith("application/json") &&
          e.response.data?.message &&
          typeof e.response.data?.message === "string"
        ) {
          message = e.response.data.message;
        }

        const error: QueryError<E> = {
          status: e.response.status,
          statusText: e.response.statusText,
          message,
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
      if (!skipAxiosCancelError) {
        if (!fetchingProceedNext) {
          this._isFetching = false;
          this.canceler = undefined;
        }
      }
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

  private cancel(message?: string): void {
    if (this.canceler) {
      this.canceler.cancel(message);
    }
  }

  /**
   * Wait the response and return the response without considering it is staled or fresh.
   */
  waitResponse(): Promise<Readonly<QueryResponse<T>> | undefined> {
    if (this.response) {
      return Promise.resolve(this.response);
    }

    const disposers: (() => void)[] = [];
    let onceCoerce = false;
    // Make sure that the fetching is tracked to force to be fetched.
    disposers.push(
      reaction(
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
      )
    );

    return new Promise<Readonly<QueryResponse<T>> | undefined>((resolve) => {
      const disposer = autorun(() => {
        if (!this.isFetching) {
          resolve(this.response);
        }
      });
      disposers.push(disposer);
    }).finally(() => {
      for (const disposer of disposers) {
        disposer();
      }
    });
  }

  /**
   * Wait the response and return the response until it is fetched.
   */
  waitFreshResponse(): Promise<Readonly<QueryResponse<T>> | undefined> {
    const disposers: (() => void)[] = [];
    let onceCoerce = false;
    // Make sure that the fetching is tracked to force to be fetched.
    disposers.push(
      reaction(
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
      )
    );

    return new Promise<Readonly<QueryResponse<T>> | undefined>((resolve) => {
      const disposer = autorun(() => {
        if (!this.isFetching) {
          resolve(this.response);
        }
      });
      disposers.push(disposer);
    }).finally(() => {
      for (const disposer of disposers) {
        disposer();
      }
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
