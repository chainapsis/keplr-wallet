import { action, autorun, makeObservable, observable, runInAction } from "mobx";
import { ChainGetter } from "@keplr-wallet/stores";
import { FetchDebounce, NameService } from "./name-service";
import { ITxChainSetter } from "./types";
import { CallData, constants } from "starknet";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { StarknetIDIsFetchingError } from "./errors";

export class StarknetIdNameService implements NameService {
  readonly type = "starknet-id";

  @observable
  protected _isEnabled: boolean = true;

  @observable
  protected _isFetching: boolean = false;

  @observable
  protected _value: string = "";

  @observable.ref
  protected _result:
    | {
        address: string;
        fullName: string;
        domain: string;
        suffix: string;
      }
    | undefined = undefined;

  // Deep equal check is required to avoid infinite re-render.
  @observable.struct
  protected _starknetID:
    | {
        networkName: string;
        namingContractAddress: string;
      }
    | undefined = undefined;

  protected debounce = new FetchDebounce();

  constructor(
    protected readonly base: ITxChainSetter,
    protected readonly chainGetter: ChainGetter,
    starknetID: string | undefined = undefined
  ) {
    if (starknetID) {
      this.setStarknetID(starknetID);
    }

    makeObservable(this);

    autorun(() => {
      noop(
        this.base.modularChainInfo,
        this._starknetID,
        this.isEnabled,
        this.value
      );
      // 위의 값에 변경이 있으면 새로고침
      this.fetch();
    });
  }

  @action
  setStarknetID(chainId: string) {
    const split = chainId.split(":"); // `starknet:networkName`
    if (split.length < 2) {
      return;
    }

    const networkName = split[1] as constants.NetworkName;
    if (!networkName) {
      return;
    }

    const namingContractAddress = networkToNamingContractAddress[networkName];
    if (!namingContractAddress) {
      this._starknetID = undefined;
      return;
    }

    this._starknetID = {
      networkName,
      namingContractAddress,
    };
  }

  @action
  setIsEnabled(isEnabled: boolean) {
    this._isEnabled = isEnabled;
  }

  get isEnabled(): boolean {
    if (!this._starknetID || !("starknet" in this.base.modularChainInfo)) {
      return false;
    }

    return this._isEnabled;
  }

  @action
  setValue(value: string) {
    this._value = value;
  }

  get value(): string {
    let v = this._value;
    if (this.isEnabled) {
      const suffix = "stark";
      if (v.endsWith("." + suffix)) {
        v = v.slice(0, v.length - suffix.length - 1);
      }
    }

    return v;
  }

  get result() {
    if (!this.isEnabled) {
      return undefined;
    }

    if (!this._result) {
      return undefined;
    }

    if (this._result.domain !== this.value) {
      return undefined;
    }

    return this._result;
  }

  get isFetching(): boolean {
    return this._isFetching;
  }

  protected async fetch(): Promise<void> {
    if (
      !this.isEnabled ||
      this.value.trim().length === 0 ||
      !this._starknetID
    ) {
      runInAction(() => {
        this._result = undefined;
        this._isFetching = false;
      });
      return;
    }

    this.debounce.run(() => this.fetchInternal());
  }

  protected async fetchInternal(): Promise<void> {
    try {
      const modularChainInfo = this.base.modularChainInfo;
      if (!("starknet" in modularChainInfo)) {
        throw new Error(`${modularChainInfo.chainId} is not starknet chain`);
      }
      if (!this._starknetID) {
        throw new Error("Starknet id is not set");
      }

      runInAction(() => {
        this._isFetching = true;
      });

      const prevValue = this.value;

      const suffix = "stark";
      const domain = this.value;
      const username = domain + "." + suffix;

      const res = await simpleFetch<{
        jsonrpc: "2.0";
        result?: string[];
        id: string;
        error?: {
          code?: number;
          message?: string;
        };
      }>(modularChainInfo.starknet.rpc, "", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "1",
          method: "starknet_call",
          params: [
            {
              contract_address: this._starknetID.namingContractAddress,
              calldata: CallData.toHex({
                domain: encodeDomain(username).map((v) => v.toString(10)),
                hint: [],
              }),
              entry_point_selector:
                "0x2e269d930f6d7ab92b15ce8ff9f5e63709391617e3465fff79ba6baf278ce60", // selector.getSelectorFromName("domain_to_address"),
            },
            "latest",
          ],
        }),
      });

      if (this.value === prevValue) {
        if (res.data.error && res.data.error.message) {
          throw new StarknetIDIsFetchingError(res.data.error.message);
        }

        const data = res.data.result;
        if (!data) {
          throw new StarknetIDIsFetchingError("no address found");
        }

        const rawHexAddr = data[0];
        if (rawHexAddr === "0x0") {
          throw new StarknetIDIsFetchingError("no address found");
        }

        const addr = "0x" + rawHexAddr.replace("0x", "").padStart(64, "0");

        runInAction(() => {
          this._result = {
            address: addr,
            fullName: username,
            domain,
            suffix,
          };
          this._isFetching = false;
        });
      }
    } catch (e) {
      console.log(e);
      runInAction(() => {
        this._result = undefined;
        this._isFetching = false;
      });
    }
  }
}

const noop = (..._args: any[]) => {
  // noop
};

const networkToNamingContractAddress = {
  [constants.NetworkName.SN_MAIN]:
    "0x6ac597f8116f886fa1c97a23fa4e08299975ecaf6b598873ca6792b9bbfb678",
  [constants.NetworkName.SN_SEPOLIA]:
    "0x0707f09bc576bd7cfee59694846291047e965f4184fe13dac62c56759b3b6fa7",
};

const basicAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789-";
const basicSizePlusOne = BigInt(basicAlphabet.length + 1);
const bigAlphabet = "这来";
const basicAlphabetSize = BigInt(basicAlphabet.length);
const bigAlphabetSize = BigInt(bigAlphabet.length);

function encodeDomain(domain: string | undefined | null): bigint[] {
  if (!domain) return [BigInt(0)];

  const encoded = [];
  for (const subdomain of domain.replace(".stark", "").split("."))
    encoded.push(encode(subdomain));
  return encoded;
}

function extractStars(str: string): [string, number] {
  let k = 0;
  while (str.endsWith(bigAlphabet[bigAlphabet.length - 1])) {
    str = str.substring(0, str.length - 1);
    k += 1;
  }
  return [str, k];
}

function encode(decoded: string | undefined): bigint {
  let encoded = BigInt(0);
  let multiplier = BigInt(1);

  if (!decoded) {
    return encoded;
  }

  if (decoded.endsWith(bigAlphabet[0] + basicAlphabet[1])) {
    const [str, k] = extractStars(decoded.substring(0, decoded.length - 2));
    decoded = str + bigAlphabet[bigAlphabet.length - 1].repeat(2 * (k + 1));
  } else {
    const [str, k] = extractStars(decoded);
    if (k)
      decoded =
        str + bigAlphabet[bigAlphabet.length - 1].repeat(1 + 2 * (k - 1));
  }

  for (let i = 0; i < decoded.length; i += 1) {
    const char = decoded[i];
    const index = basicAlphabet.indexOf(char);
    const bnIndex = BigInt(basicAlphabet.indexOf(char));

    if (index !== -1) {
      // add encoded + multiplier * index
      if (i === decoded.length - 1 && decoded[i] === basicAlphabet[0]) {
        encoded += multiplier * basicAlphabetSize;
        multiplier *= basicSizePlusOne;
        // add 0
        multiplier *= basicSizePlusOne;
      } else {
        encoded += multiplier * bnIndex;
        multiplier *= basicSizePlusOne;
      }
    } else if (bigAlphabet.indexOf(char) !== -1) {
      // add encoded + multiplier * (basicAlphabetSize)
      encoded += multiplier * basicAlphabetSize;
      multiplier *= basicSizePlusOne;
      // add encoded + multiplier * index
      const newid =
        (i === decoded.length - 1 ? 1 : 0) + bigAlphabet.indexOf(char);
      encoded += multiplier * BigInt(newid);
      multiplier *= bigAlphabetSize;
    }
  }

  return encoded;
}
