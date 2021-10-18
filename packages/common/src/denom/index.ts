import { Buffer } from "buffer/";
import { Hash } from "@keplr-wallet/crypto";

export class DenomHelper {
  static ibcDenom(
    paths: {
      portId: string;
      channelId: string;
    }[],
    coinMinimalDenom: string
  ): string {
    const prefixes: string[] = [];
    for (const path of paths) {
      prefixes.push(`${path.portId}/${path.channelId}`);
    }

    const prefix = prefixes.join("/");
    const denom = `${prefix}/${coinMinimalDenom}`;

    return (
      "ibc/" +
      Buffer.from(Hash.sha256(Buffer.from(denom)))
        .toString("hex")
        .toUpperCase()
    );
  }

  protected readonly _type: string;
  protected readonly _contractAddress: string;

  constructor(protected readonly _denom: string) {
    // Remember that the coin's actual denom should start with "type:contractAddress:denom" if it is for the token based on contract.
    const split = this.denom.split(/(\w+):(\w+):(.+)/).filter(Boolean);
    if (split.length !== 1 && split.length !== 3) {
      throw new Error(`Invalid denom: ${this.denom}`);
    }

    this._type = split.length === 3 ? split[0] : "";
    this._contractAddress = split.length === 3 ? split[1] : "";
  }

  get denom(): string {
    return this._denom;
  }

  get type(): string {
    return this._type || "native";
  }

  get contractAddress(): string {
    return this._contractAddress;
  }
}
