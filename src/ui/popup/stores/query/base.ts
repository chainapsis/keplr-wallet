import {
  action,
  computed,
  observable,
  onBecomeObserved,
  onBecomeUnobserved,
  runInAction
} from "mobx";
import Axios, { AxiosInstance, CancelToken, CancelTokenSource } from "axios";
import { actionAsync, task } from "mobx-utils";
import { KVStore } from "../../../../common/kvstore";
import { DeepReadonly } from "utility-types";
import { HasMapStore } from "../common/map";

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
  // Just use the oberable ref because the response is immutable and not directly adjusted.
  @observable.ref
  private _response?: Readonly<QueryResponse<T>>;

  @observable
  public isFetching!: boolean;

  @observable.ref
  private _error?: Readonly<QueryError<E>>;

  private _isStarted: boolean = false;

  private cancelToken?: CancelTokenSource;

  private observedCount: number = 0;

  @observable.ref
  protected _instance!: AxiosInstance;

  protected constructor(instance: AxiosInstance) {
    runInAction(() => {
      this.isFetching = false;
      this._instance = instance;
    });

    onBecomeObserved(this, "_response", this.becomeObserved);
    onBecomeObserved(this, "isFetching", this.becomeObserved);
    onBecomeObserved(this, "_error", this.becomeObserved);

    onBecomeUnobserved(this, "_response", this.becomeUnobserved);
    onBecomeUnobserved(this, "isFetching", this.becomeUnobserved);
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

  private start() {
    if (!this._isStarted) {
      this._isStarted = true;
      this.onStart();
    }
  }

  private stop() {
    if (this.isStarted) {
      this.onStop();
      this._isStarted = false;
    }
  }

  public get isStarted(): boolean {
    return this._isStarted;
  }

  protected onStart() {
    this.fetch();
  }

  protected onStop() {
    this.cancel();
  }

  protected canFetch(): boolean {
    return true;
  }

  // Return the instance.
  // You can memorize this by using @computed if you need to override this.
  // NOTE: If this getter returns the different instance with previous instance.
  // It will be used in the latter fetching.
  @computed
  protected get instance(): DeepReadonly<AxiosInstance> {
    return this._instance;
  }

  @actionAsync
  async fetch(): Promise<void> {
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

    this.isFetching = true;
    this.cancelToken = Axios.CancelToken.source();

    // If there is no existing response, try to load saved reponse.
    if (!this._response) {
      const staledResponse = await task(this.loadStaledResponse());
      if (staledResponse) {
        this.setResponse(staledResponse);
      }
    } else {
      // Make the existing response as staled.
      this.setResponse({
        ...this._response,
        staled: true
      });
    }

    try {
      const response = await task(this.fetchResponse(this.cancelToken.token));
      this.setResponse(response);
      // Clear the error if fetching succeeds.
      this.setError(undefined);
      await task(this.saveResponse(response));
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
          data: e.response.data
        };

        this.setError(error);
      } else if (e.request) {
        // if can't get the response.
        const error: QueryError<E> = {
          status: 0,
          statusText: "Failed to get response",
          message: "Failed to get response"
        };

        this.setError(error);
      } else {
        const error: QueryError<E> = {
          status: 0,
          statusText: e.message,
          message: e.message
        };

        this.setError(error);
      }
    } finally {
      this.isFetching = false;
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

  protected abstract fetchResponse(
    cancelToken: CancelToken
  ): Promise<QueryResponse<T>>;

  protected abstract async saveResponse(
    response: Readonly<QueryResponse<T>>
  ): Promise<void>;

  protected abstract async loadStaledResponse(): Promise<
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
  @observable
  protected _url!: string;

  constructor(
    protected readonly kvStore: KVStore,
    instance: AxiosInstance,
    url: string
  ) {
    super(instance);

    this.setUrl(url);
  }

  get url(): string {
    return this._url;
  }

  @action
  protected setUrl(url: string) {
    this._url = url;
    this.fetch();
  }

  protected async fetchResponse(
    cancelToken: CancelToken
  ): Promise<QueryResponse<T>> {
    const result = await this.instance.get<T>(this.url, {
      cancelToken
    });
    return {
      data: result.data,
      status: result.status,
      staled: false,
      timestamp: Date.now()
    };
  }

  protected getCacheKey(): string {
    return `${this.instance.name}-${
      this.instance.defaults.baseURL
    }${this.instance.getUri({
      url: this.url
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
        staled: true
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
