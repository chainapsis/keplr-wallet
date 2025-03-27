export interface NameService {
  type: string;

  setIsEnabled: (isEnabled: boolean) => void;
  // must be observable
  isEnabled: boolean;

  // must be observable
  result:
    | {
        address: string;
        fullName: string;
        domain: string;
        suffix: string;
      }
    | undefined;

  // must be observable
  isFetching: boolean;

  setValue: (value: string) => void;
  value: string;
}

export class FetchDebounce {
  readonly debounceMs = 50;

  protected timeout: NodeJS.Timeout | undefined = undefined;

  run(fn: () => Promise<void>) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.timeout = undefined;
      fn();
    }, this.debounceMs);
  }
}
