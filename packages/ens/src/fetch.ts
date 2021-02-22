import Web3 from "web3";
import { flow, makeObservable, observable } from "mobx";
import { Buffer } from "buffer/";

// TODO: Add definition for ethereum-ens.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ENS = require("ethereum-ens");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Resolver } = require("@ensdomains/resolver");

const ensCache: Map<string, any> = new Map();

// In this case, web3 doesn't make a transaction.
// And, it is used for just fetching a registered address from ENS.
// So, just using http provider is fine.
function getENSProvider(endpoint: string) {
  if (ensCache.has(endpoint)) {
    return ensCache.get(endpoint);
  }

  const provider = new Web3.providers.HttpProvider(endpoint);
  ensCache.set(endpoint, new ENS(provider));
  return ensCache.get(endpoint);
}

export class ObservableEnsFetcher {
  static isValidENS(name: string): boolean {
    const strs = name.split(".");
    if (strs.length <= 1) {
      return false;
    }

    const tld = strs[strs.length - 1];
    // TODO: What if more top level domain is added?
    return tld === "eth" || tld === "xyz" || tld === "luxe" || tld === "kred";
  }

  protected readonly ens: any;

  @observable
  protected _isFetching = false;

  @observable
  protected _name: string = "";

  @observable
  protected _coinType: number | undefined = undefined;

  @observable.ref
  protected _address: Uint8Array | undefined = undefined;

  @observable.ref
  protected _error: Error | undefined = undefined;

  constructor(public readonly endpoint: string) {
    this.ens = getENSProvider(endpoint);

    makeObservable(this);
  }

  setNameAndCoinType(name: string, coinType: number) {
    const prevName = this._name;
    const prevCoinType = this._coinType;

    this._name = name;
    this._coinType = coinType;

    if (this._name !== prevName || this._coinType !== prevCoinType) {
      this.fetch(this._name, this._coinType);
    }
  }

  get isFetching(): boolean {
    return this._isFetching;
  }

  get name(): string {
    return this._name;
  }

  get coinType(): number | undefined {
    return this._coinType;
  }

  get address(): Uint8Array | undefined {
    return this._address;
  }

  get error(): Error | undefined {
    return this._error;
  }

  @flow
  protected *fetch(name: string, coinType: number) {
    this._isFetching = true;

    try {
      // It seems that ethereum ens doesn't support the abi of recent public resolver yet.
      // So to solve this problem, inject the recent public resolver's abi manually.
      const resolver = yield this.ens.resolver(name, Resolver.abi);
      const addr = yield resolver.addr(coinType);
      this._address = Buffer.from(addr.replace("0x", ""), "hex");
      this._error = undefined;
    } catch (e) {
      this._error = e;
    }

    this._isFetching = false;
  }
}
