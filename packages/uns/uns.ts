import { flow, makeObservable, observable } from "mobx";
import { Resolution, ResolutionError } from '@unstoppabledomains/resolution';

export const UNSError = ResolutionError;

/** Responsible for resolving addresses from Unstoppable Domains */
export class UNS {

  static _resolution: Resolution;

  @observable
  protected _isFetching = false;

  @observable
  protected _name: string = "";

  @observable
  protected _network: string = "";

  @observable.ref
  protected _address: String | undefined = undefined;

  @observable.ref
  protected _error: ResolutionError | Error | undefined = undefined;

  get isFetching(): boolean {
    return this._isFetching;
  }

  get name(): string {
    return this._name;
  }

  get address(): String | undefined {
    return this._address;
  }

  get error(): ResolutionError | Error | undefined {
    return this._error;
  }

  static isValidUNS(name: string): boolean {
    const strs = name.split(".");
    if (strs.length <= 1) {
      return false;
    }

    const tld = strs[strs.length - 1];
    // TODO: What if more top level domain is added?
    return tld === "crypto"
      || tld === "bitcoin"
      || tld === "blockchain"
      || tld === "coin"
      || tld === "dao"
      || tld === "nft"
      || tld === "888"
      || tld === "wallet"
      || tld === "x"
      || tld === "zil";
  }

  constructor() {
    UNS._resolution = new Resolution();
    makeObservable(this);
  }

  @flow
  protected *resolve(domain: string, currency = "ETH", chain?: string) {
    this._isFetching = true;

    try {
      this._address = yield UNS._resolution.addr(domain, currency);
      this._error = undefined;
    } catch (e) {
      if (e instanceof ResolutionError) {
        this._error = e;
      }

      if (e instanceof Error) {
        this._error = e;
      }

      throw e;
    }

    this._isFetching = false;
  }
};
