import { action, flow, makeObservable, observable } from "mobx";
import { Buffer } from "buffer";
import { LCDClient } from "@terra-money/terra.js";
import keccak256 from "keccak256";

const REGISTRY_ADDRESS = "terra19gqw63xnt9237d2s8cdrzstn98g98y7hkl80gs";

/**
 * Generate a unique hash for any valid domain name.
 *
 * @param name - A TNS identifier such as "alice.ust"
 * @returns The result of namehash function in a {@link Buffer} form
 */
const namehash = (name: string): Buffer => {
  if (name) {
    const [label, remainder] = name.split(".");
    const concat = Buffer.concat([namehash(remainder), keccak256(label)]);
    return keccak256(concat);
  }

  return Buffer.from("".padStart(64, "0"), "hex");
};

/**
 * Generate the output of the namehash function in a form of number array
 * which is supported by the contract query.
 *
 * @param name - A TNS identifier such as "alice.ust"
 * @returns The result of namehash function in a number array format
 */
const getNode = (name: string): number[] => {
  return Array.from(Uint8Array.from(namehash(name)));
};

const getResolver = async (
  lcdClient: LCDClient,
  name: string
): Promise<string> => {
  const { resolver } = await lcdClient.wasm.contractQuery(REGISTRY_ADDRESS, {
    get_record: { name },
  });
  return resolver;
};

const getAddress = async (
  lcdClient: LCDClient,
  resolver: string,
  name: string,
  coinType: number
): Promise<string> => {
  const node = getNode(name);
  const { address } = await lcdClient.wasm.contractQuery(resolver, {
    get_address: { node, coin_type: coinType },
  });
  return address;
};

export class ObservableTnsFetcher {
  static isValidTNS(name: string): boolean {
    const regex = /^([a-z0-9-]+)\.ust$/;
    return regex.test(name);
  }

  protected lcdClient: LCDClient;

  @observable
  protected _isFetching = false;

  @observable
  protected _name: string = "";

  @observable
  protected _coinType: number | undefined = undefined;

  @observable.ref
  protected _address: string | undefined = undefined;

  @observable.ref
  protected _error: Error | undefined = undefined;

  constructor(public readonly endpoint: string) {
    this.lcdClient = new LCDClient({
      URL: endpoint,
      chainID: "columbus-5",
    });
    makeObservable(this);
  }

  @action
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

  get address(): string | undefined {
    return this._address;
  }

  get error(): Error | undefined {
    return this._error;
  }

  @flow
  protected *fetch(name: string, coinType: number) {
    this._isFetching = true;
    try {
      const resolver: string = yield getResolver(this.lcdClient, name);
      const addr: string = yield getAddress(
        this.lcdClient,
        resolver,
        name,
        coinType
      );
      this._address = addr;
      this._error = undefined;
    } catch (e: any) {
      this._error = e;
    }

    this._isFetching = false;
  }
}
