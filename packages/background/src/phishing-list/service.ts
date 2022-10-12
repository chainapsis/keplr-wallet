import Axios from "axios";
import { parseDomainUntilSecondLevel } from "./utils";

export class PhishingListService {
  protected map: Map<string, boolean> = new Map();
  protected allowed: Map<string, number> = new Map();

  protected _hasInited: boolean = false;
  protected _hasStopped: boolean = false;
  protected timeoutId?: NodeJS.Timeout;

  constructor(
    public readonly opts: {
      readonly blockListUrl: string;
      readonly fetchingIntervalMs: number;
      readonly retryIntervalMs: number;
      readonly allowTimeoutMs: number;
    }
  ) {}

  get hasInited(): boolean {
    return this._hasInited;
  }

  init() {
    this.startFetchPhishingList();
  }

  stop() {
    if (this.timeoutId != null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
    this._hasStopped = true;
  }

  async startFetchPhishingList() {
    if (this.timeoutId != null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }

    if (this._hasStopped) {
      return;
    }

    let failed = false;
    try {
      const res = await Axios.get<string>(this.opts.blockListUrl);

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
          map.set(parseDomainUntilSecondLevel(domain), true);
        } catch (e) {
          console.log(e);
        }
      }

      this._hasInited = true;
      this.map = map;
    } catch (e) {
      failed = true;
      console.log(e);
    }

    if (!this._hasStopped) {
      this.timeoutId = setTimeout(
        () => {
          this.startFetchPhishingList();
        },
        failed ? this.opts.retryIntervalMs : this.opts.fetchingIntervalMs
      );
    }
  }

  checkURLIsPhishing(url: string): boolean {
    const parsed = parseDomainUntilSecondLevel(new URL(url).origin);
    if (this.map.get(parsed) === true) {
      const allowed = this.allowed.get(parsed);
      if (
        allowed &&
        allowed + this.opts.allowTimeoutMs >= new Date().getTime()
      ) {
        return false;
      }
      return true;
    } else {
      return false;
    }
  }

  allowUrlTemp(url: string): void {
    const parsed = new URL(url);
    this.allowed.set(
      parseDomainUntilSecondLevel(parsed.origin),
      new Date().getTime()
    );
  }
}
