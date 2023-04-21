import Axios, { AxiosResponse } from "axios";
import { parseDomain } from "./utils";

class IntervalFetcher<R> {
  protected _hasInited: boolean = false;
  protected _hasStopped: boolean = false;
  protected timeoutId?: NodeJS.Timeout;

  constructor(
    public readonly opts: {
      readonly url: string;
      readonly fetchingIntervalMs: number;
      readonly retryIntervalMs: number;
      readonly allowTimeoutMs: number;
    },
    protected readonly handler: (data: AxiosResponse<R>) => void
  ) {}

  get hasInited(): boolean {
    return this._hasInited;
  }

  start() {
    this.fetch();
  }

  stop() {
    if (this.timeoutId != null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
    this._hasStopped = true;
  }

  async fetch() {
    if (this.timeoutId != null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }

    if (this._hasStopped) {
      return;
    }

    let failed = false;
    try {
      const res = await Axios.get<R>(this.opts.url);

      this.handler(res);

      this._hasInited = true;
    } catch (e) {
      failed = true;
      console.log(e);
    }

    if (!this._hasStopped) {
      this.timeoutId = setTimeout(
        () => {
          this.fetch();
        },
        failed ? this.opts.retryIntervalMs : this.opts.fetchingIntervalMs
      );
    }
  }
}

export class PhishingListService {
  // If blocked urls is "scam1.com", "scam2.service.com",
  // "scam1.com" and "**.scam1.com" should be blocked.
  // and "scam2.service.com" and "**.scam2.service.com" should be blocked.
  // and "service.com" should be allowed.
  // urls which blocked.
  protected urlMap: Map<string, boolean> = new Map();
  protected readonly allowedUrlMap: Map<string, number> = new Map();

  protected twitterMap: Map<string, boolean> = new Map();

  public readonly urlFetcher: IntervalFetcher<string>;
  public readonly twitterFetcher?: IntervalFetcher<string>;

  constructor(
    public readonly opts: {
      readonly blockListUrl: string;
      readonly twitterListUrl?: string;
      readonly fetchingIntervalMs: number;
      readonly retryIntervalMs: number;
      readonly allowTimeoutMs: number;
    }
  ) {
    this.urlFetcher = new IntervalFetcher(
      {
        ...this.opts,
        url: this.opts.blockListUrl,
      },
      (res) => {
        const domains = res.data
          .split(/(\r?\n)|,|;|\s|\t/)
          .filter((str) => str != null)
          .map((str) => {
            return str.trim();
          })
          .filter((str) => str.length > 0);

        const map = new Map<string, boolean>();

        for (const domain of domains) {
          try {
            map.set(parseDomain(domain).join("."), true);
          } catch (e) {
            console.log(e);
          }
        }

        this.urlMap = map;
      }
    );
    if (this.opts.twitterListUrl) {
      this.twitterFetcher = new IntervalFetcher(
        {
          ...this.opts,
          url: this.opts.twitterListUrl,
        },
        (res) => {
          const ids = res.data
            .split(/(\r?\n)|,|;|\s|\t/)
            .filter((str) => str != null)
            .map((str) => {
              return str.trim();
            })
            .filter((str) => str.length > 0);

          const map = new Map<string, boolean>();

          for (const id of ids) {
            map.set(id.replace("@", "").toLowerCase(), true);
          }

          this.twitterMap = map;
        }
      );
    }
  }

  init() {
    this.urlFetcher.start();
    if (this.twitterFetcher) {
      this.twitterFetcher.start();
    }
  }

  get hasInited(): boolean {
    return (
      this.urlFetcher.hasInited &&
      (!this.twitterFetcher || this.twitterFetcher.hasInited)
    );
  }

  stop() {
    this.urlFetcher.stop();
    if (this.twitterFetcher) {
      this.twitterFetcher.stop();
    }
  }

  checkURLIsPhishing(url: string): boolean {
    const origin = new URL(url).origin;
    const parsed = parseDomain(origin);
    while (parsed.length >= 2) {
      const domain = parsed.join(".");
      if (this.urlMap.get(domain) === true) {
        // Allowing url should not be based on subdomain but only allow specific domain.
        const allowed = this.allowedUrlMap.get(parseDomain(origin).join("."));
        if (
          allowed &&
          allowed + this.opts.allowTimeoutMs >= new Date().getTime()
        ) {
          // noop: This url is allowed temporarily
        } else {
          return true;
        }
      }

      parsed.shift();
    }
    return false;
  }

  allowUrlTemp(url: string): void {
    const parsed = new URL(url);
    this.allowedUrlMap.set(
      parseDomain(parsed.origin).join("."),
      new Date().getTime()
    );
  }

  checkBadTwitterId(id: string): boolean {
    return this.twitterMap.get(id.replace("@", "").toLowerCase()) === true;
  }
}
