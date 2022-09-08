import Axios from "axios";
import { parseDomainUntilSecondLevel } from "./utils";

export class PhishingListService {
  protected map: Map<string, boolean> = new Map();

  protected timeoutId?: NodeJS.Timeout;

  constructor(
    public readonly opts: {
      readonly blockListUrl: string;
      readonly fetchingIntervalMs: number;
      readonly retryIntervalMs: number;
    }
  ) {}

  init() {
    this.startFetchPhishingList();
  }

  stop() {
    if (this.timeoutId != null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

  async startFetchPhishingList() {
    if (this.timeoutId != null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
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

      this.map = map;
    } catch (e) {
      failed = true;
      console.log(e);
    }

    this.timeoutId = setTimeout(
      () => {
        this.startFetchPhishingList();
      },
      failed ? this.opts.retryIntervalMs : this.opts.fetchingIntervalMs
    );
  }

  checkURLIsPhishing(url: string): boolean {
    const parsed = new URL(url);
    return this.map.get(parseDomainUntilSecondLevel(parsed.origin)) === true;
  }
}
