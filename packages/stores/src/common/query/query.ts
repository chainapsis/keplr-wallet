import {
  action,
  autorun,
  flow,
  makeObservable,
  observable,
  onBecomeObserved,
  onBecomeUnobserved,
  reaction,
} from "mobx";
import { toGenerator } from "@keplr-wallet/common";
import { HasMapStore } from "../map";
import { makeURL, simpleFetch } from "@keplr-wallet/simple-fetch";
import { QuerySharedContext } from "./context";
import { Buffer } from "buffer/";

export type QueryOptions = {
  // millisec
  readonly cacheMaxAge: number;
  // millisec
  readonly fetchingInterval: number;
  readonly disableCache: boolean;
};

export const defaultOptions: QueryOptions = {
  cacheMaxAge: 0,
  fetchingInterval: 0,
  disableCache: false,
};

export type QueryError<E> = {
  status: number;
  statusText: string;
  message: string;
  data?: E;
};

export type QueryResponse<T> = {
  data: T;
  staled: boolean;
  local: boolean;
  timestamp: number;
};

class FlowCancelerError extends Error {
  constructor(m?: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, FlowCancelerError.prototype);
  }
}

class FlowCanceler {
  protected rejectors: {
    reject: (e: Error) => void;
    onCancel?: () => void;
  }[] = [];

  get hasCancelable(): boolean {
    return this.rejectors.length > 0;
  }

  cancel(message?: string) {
    while (this.rejectors.length > 0) {
      const rejector = this.rejectors.shift();
      if (rejector) {
        rejector.reject(new FlowCancelerError(message));
        if (rejector.onCancel) {
          rejector.onCancel();
        }
      }
    }
  }

  callOrCanceledWithPromise<R>(
    promise: PromiseLike<R>,
    onCancel?: () => void
  ): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      this.rejectors.push({
        reject,
        onCancel,
      });

      promise.then(
        (r) => {
          const i = this.rejectors.findIndex((r) => r.reject === reject);
          if (i >= 0) {
            this.rejectors.splice(i, 1);
          }

          resolve(r);
        },
        (e) => {
          const i = this.rejectors.findIndex((r) => r.reject === reject);
          if (i >= 0) {
            this.rejectors.splice(i, 1);
          }

          reject(e);
        }
      );
    });
  }

  callOrCanceled<R>(
    fn: () => PromiseLike<R>,
    onCancel?: () => void
  ): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      this.rejectors.push({
        reject,
        onCancel,
      });

      Promise.resolve().then(() => {
        if (!this.rejectors.find((r) => r.reject === reject)) {
          return;
        }

        fn().then(
          (r) => {
            const i = this.rejectors.findIndex((r) => r.reject === reject);
            if (i >= 0) {
              this.rejectors.splice(i, 1);
            }

            resolve(r);
          },
          (e) => {
            const i = this.rejectors.findIndex((r) => r.reject === reject);
            if (i >= 0) {
              this.rejectors.splice(i, 1);
            }

            reject(e);
          }
        );
      });
    });
  }
}

class FunctionQueue {
  protected queue: (() => void | Promise<void>)[] = [];
  protected isPendingPromise = false;

  enqueue(fn: () => void | Promise<void>) {
    this.queue.push(fn);

    this.handleQueue();
  }

  protected handleQueue() {
    if (!this.isPendingPromise && this.queue.length > 0) {
      const fn = this.queue.shift();
      if (fn) {
        const r = fn();
        if (typeof r === "object" && "then" in r) {
          this.isPendingPromise = true;
          r.then(() => {
            this.isPendingPromise = false;
            this.handleQueue();
          });
        } else {
          this.handleQueue();
        }
      }
    }
  }
}

export interface IObservableQuery<T = unknown, E = unknown> {
  isObserved: boolean;
  isStarted: boolean;

  response?: Readonly<QueryResponse<T>>;
  error?: Readonly<QueryError<E>>;
  isFetching: boolean;

  fetch(): Generator<unknown, any, any> | Promise<void>;
  waitResponse(): Promise<Readonly<QueryResponse<T>> | undefined>;
  waitFreshResponse(): Promise<Readonly<QueryResponse<T>> | undefined>;
}

/**
 * Base of the observable query classes.
 * This recommends to use the fetch to query the response.
 */
export abstract class ObservableQuery<T = unknown, E = unknown>
  implements IObservableQuery<T, E>
{
  protected static suspectedResponseDatasWithInvalidValue: string[] = [
    "The network connection was lost.",
    "The request timed out.",
  ];

  protected static guessResponseTruncated(headers: any, data: string): boolean {
    return (
      headers &&
      "get" in headers &&
      typeof headers.get === "function" &&
      (headers.get("content-type") || "").startsWith("application/json") &&
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

  private stateQueue = new FunctionQueue();
  private pendingOnStart = false;
  private readonly queryCanceler: FlowCanceler;

  private observedCount: number = 0;

  // intervalId can be number or NodeJS's Timout object according to the environment.
  // If environment is browser, intervalId should be number.
  // If environment is NodeJS, intervalId should be NodeJS.Timeout.
  private intervalId: number | NodeJS.Timeout | undefined = undefined;

  @observable
  protected baseURL: string;

  @observable
  protected _url: string = "";

  protected constructor(
    protected readonly sharedContext: QuerySharedContext,
    baseURL: string,
    url: string,
    options: Partial<QueryOptions> = {}
  ) {
    this.options = {
      ...defaultOptions,
      ...options,
    };

    this.baseURL = baseURL;

    this.queryCanceler = new FlowCanceler();

    makeObservable(this);

    this.setUrl(url);

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
      // For async onStart() method, set isFetching as true in advance.
      this._isFetching = true;
      this.pendingOnStart = true;
      this.stateQueue.enqueue(() => {
        return this.onStart();
      });
      this.stateQueue.enqueue(() => {
        this.pendingOnStart = false;
      });
      this.stateQueue.enqueue(() => {
        return this.postStart();
      });
    }
  }

  @action
  private stop() {
    if (this._isStarted) {
      if (this.isFetching && this.queryCanceler.hasCancelable) {
        this.cancel();
      }

      this._isFetching = false;

      if (this.intervalId != null) {
        clearInterval(this.intervalId as NodeJS.Timeout);
      }
      this.intervalId = undefined;

      this.stateQueue.enqueue(() => {
        return this.onStop();
      });
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

  protected onStop(): void {
    // noop yet.
    // Override this if you need something to do whenever starting.
  }

  protected canFetch(): boolean {
    return true;
  }

  get isFetching(): boolean {
    return this._isFetching;
  }

  @flow
  *fetch(): Generator<unknown, any, any> {
    // If not started, do nothing.
    if (!this.isStarted || this.pendingOnStart) {
      return;
    }

    if (!this.canFetch()) {
      if (this._isFetching) {
        this._isFetching = false;
      }
      return;
    }

    // If response is fetching, cancel the previous query.
    if (this.isFetching && this.queryCanceler.hasCancelable) {
      // When cancel for the next fetching, it behaves differently from other explicit cancels because fetching continues. Use an error message to identify this.
      this.cancel("__fetching__proceed__next__");
    }

    // If there is no existing response, try to load saved reponse.
    if (!this._response) {
      this._isFetching = true;

      let satisfyCache = false;

      // When first load, try to load the last response from disk.
      // Use the last saved response if the last saved response exists and the current response hasn't been set yet.
      const promise = this.loadStabledResponse().then((value) => {
        satisfyCache = value;
      });
      if (this.options.cacheMaxAge <= 0) {
        // To improve performance, don't wait the loading to proceed if cache age not set.
      } else {
        yield promise;
        if (satisfyCache) {
          this._isFetching = false;
          return;
        }
      }
    } else {
      if (this.options.disableCache) {
        // Skip cache check when cache is disabled
      } else if (this.options.cacheMaxAge > 0) {
        if (this._response.timestamp > Date.now() - this.options.cacheMaxAge) {
          this._isFetching = false;
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

    const abortController = new AbortController();

    try {
      let hasStarted = false;
      let { data, headers } = yield* toGenerator(
        this.queryCanceler.callOrCanceled(
          () => {
            hasStarted = true;
            return this.fetchResponse(abortController);
          },
          () => {
            if (hasStarted) {
              abortController.abort();
            }
          }
        )
      );
      if (
        data &&
        typeof data === "string" &&
        (data.startsWith("stream was reset:") ||
          ObservableQuery.suspectedResponseDatasWithInvalidValue.includes(
            data
          ) ||
          ObservableQuery.guessResponseTruncated(headers, data))
      ) {
        // In some devices, it is a http ok code, but a strange response is sometimes returned.
        // It's not that they can't query at all, it seems that they get weird response from time to time.
        // These causes are not clear.
        // To solve this problem, if this problem occurs, try the query again, and if that fails, an error is raised.
        // https://github.com/chainapsis/keplr-wallet/issues/275
        // https://github.com/chainapsis/keplr-wallet/issues/278
        // https://github.com/chainapsis/keplr-wallet/issues/318
        if (abortController.signal.aborted) {
          // In this case, it is assumed that it is caused by cancel() and do nothing.
          return;
        }

        console.log(
          "There is an unknown problem to the response. Request one more time."
        );

        // Try to query again.
        let hasStarted = false;
        const refetched = yield* toGenerator(
          this.queryCanceler.callOrCanceled(
            () => {
              hasStarted = true;
              return this.fetchResponse(abortController);
            },
            () => {
              if (hasStarted) {
                abortController.abort();
              }
            }
          )
        );
        data = refetched.data;
        headers = refetched.headers;

        if (data && typeof data === "string") {
          if (
            data.startsWith("stream was reset:") ||
            ObservableQuery.suspectedResponseDatasWithInvalidValue.includes(
              data
            )
          ) {
            throw new Error(data);
          }

          if (ObservableQuery.guessResponseTruncated(headers, data)) {
            throw new Error("The response data seems to be truncated");
          }
        }
      }

      const response: QueryResponse<T> = {
        data,
        staled: false,
        local: false,
        timestamp: Date.now(),
      };
      // Skip saving response if disableCache is true.
      if (!this.options.disableCache) {
        // Should not wait.
        this.saveResponse(response);
      }

      this.onReceiveResponse(response);
      yield this.sharedContext.handleResponse(() => {
        this.setResponse(response);
        // Clear the error if fetching succeeds.
        this.setError(undefined);

        // Do not use finally block.
        // Because finally block is called after the next yield and it makes re-render.
        this._isFetching = false;
      });
    } catch (e) {
      let fetchingProceedNext = false;
      if (e instanceof FlowCancelerError) {
        // When cancel for the next fetching, it behaves differently from other explicit cancels because fetching continues.
        if (e.message === "__fetching__proceed__next__") {
          fetchingProceedNext = true;
        }
        return;
      }

      // If error is from simple fetch, and get response.
      if (e.response) {
        // Default is status text
        let message: string = e.response.statusText;
        const contentType: string = e.response.headers
          ? e.response.headers.get("content-type") || ""
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

        yield this.sharedContext.handleResponse(() => {
          this.setError(error);

          // Do not use finally block.
          // Because finally block is called after the next yield and it makes re-render.
          if (!fetchingProceedNext) {
            this._isFetching = false;
          }
        });
      } else if (e.request) {
        // if can't get the response.
        const error: QueryError<E> = {
          status: 0,
          statusText: "Failed to get response",
          message: "Failed to get response",
        };

        yield this.sharedContext.handleResponse(() => {
          this.setError(error);

          // Do not use finally block.
          // Because finally block is called after the next yield and it makes re-render.
          if (!fetchingProceedNext) {
            this._isFetching = false;
          }
        });
      } else {
        const error: QueryError<E> = {
          status: 0,
          statusText: e.message,
          message: e.message,
          data: e,
        };

        yield this.sharedContext.handleResponse(() => {
          this.setError(error);

          // Do not use finally block.
          // Because finally block is called after the next yield and it makes re-render.
          if (!fetchingProceedNext) {
            this._isFetching = false;
          }
        });
      }
    }
  }

  public get response() {
    return this._response;
  }

  public get error() {
    return this._error;
  }

  protected loadStabledResponse(): Promise<boolean> {
    // When first load, try to load the last response from disk.
    // Use the last saved response if the last saved response exists and the current response hasn't been set yet.
    return new Promise<boolean>((resolve) => {
      this.sharedContext.loadStore<QueryResponse<T>>(
        this.getCacheKey(),
        (res) => {
          if (res.status === "rejected") {
            console.warn("Failed to get the last response from disk.");
            resolve(false);
          } else {
            const staledResponse = res.value;
            if (staledResponse && !this._response) {
              if (
                this.options.cacheMaxAge <= 0 ||
                staledResponse.timestamp > Date.now() - this.options.cacheMaxAge
              ) {
                const response = {
                  ...staledResponse,
                  staled: true,
                  local: true,
                };
                this.onReceiveResponse(response);
                this.setResponse(response);
                resolve(true);
                return;
              }
            }
            resolve(false);
          }
        }
      );
    });
  }

  @action
  protected setResponse(response: Readonly<QueryResponse<T>>) {
    this._response = response;
  }

  @action
  protected setError(error: QueryError<E> | undefined) {
    this._error = error;
  }

  // Invoked when response received from local or query without considering debouncing.
  // If debouncing is enabled, the response is set after debouncing is finished.
  // Thus, it have a little delay.
  // If you want to use the response without debouncing delay, override onReceivedResponse() instead.
  protected onReceiveResponse(_: Readonly<QueryResponse<T>>): void {
    // noop.
    // Override this if needed.
  }

  private cancel(message?: string): void {
    this.queryCanceler.cancel(message);
  }

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

  protected getCacheKey(): string {
    try {
      return makeURL(this.baseURL, this.url);
    } catch (e) {
      console.log("Failed to make URL", this.baseURL, this.url, e);
      // just return random.
      const random = new Uint8Array(32);
      crypto.getRandomValues(random);
      return Buffer.from(random).toString("hex");
    }
  }

  protected async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: T }> {
    const result = await simpleFetch<T>(this.baseURL, this.url, {
      signal: abortController.signal,
    });
    return {
      headers: result.headers,
      data: result.data,
    };
  }

  /**
   * Used for saving the last response to disk.
   * This should not make observable state changes.
   * @param response
   * @protected
   */
  protected async saveResponse(
    response: Readonly<QueryResponse<T>>
  ): Promise<void> {
    const key = this.getCacheKey();
    await this.sharedContext.saveResponse(key, response);
  }
}

export class ObservableQueryMap<T = unknown, E = unknown> extends HasMapStore<
  ObservableQuery<T, E>
> {
  constructor(creater: (key: string) => ObservableQuery<T, E>) {
    super(creater);
  }
}
