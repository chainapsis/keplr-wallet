import { action, makeObservable, observable } from "mobx";
import { ChainGetter } from "@keplr-wallet/stores";
import { GENESIS_HASH_TO_NETWORK, GenesisHash } from "@keplr-wallet/types";
import { useState } from "react";
import validate, {
  Network,
  getAddressInfo,
  AddressType,
} from "bitcoin-address-validation";
import { ISenderConfig, UIProperties } from "./types";
import { TxChainSetter } from "./chain";
import { EmptyAddressError, InvalidBitcoinAddressError } from "./errors";

export class SenderConfig extends TxChainSetter implements ISenderConfig {
  @observable
  protected _value: string = "";

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    initialSender: string
  ) {
    super(chainGetter, initialChainId);

    this._value = initialSender;

    makeObservable(this);
  }

  get sender(): string {
    return this._value;
  }

  get value(): string {
    return this._value;
  }

  @action
  setValue(value: string): void {
    this._value = value;
  }

  get uiProperties(): UIProperties {
    if (!this.value) {
      return {
        error: new EmptyAddressError("Address is empty"),
      };
    }

    const [, genesisHash, paymentType] = this.chainId.split(":");
    const network = GENESIS_HASH_TO_NETWORK[genesisHash as GenesisHash];
    if (
      !network ||
      (paymentType !== "native-segwit" && paymentType !== "taproot")
    ) {
      return {
        error: new InvalidBitcoinAddressError(
          "Unsupported format of Bitcoin address"
        ),
      };
    }

    try {
      const isValid = validate(this.value, network as unknown as Network, {
        castTestnetTo: network === "signet" ? Network.signet : undefined,
      });

      if (!isValid) {
        return {
          error: new InvalidBitcoinAddressError(
            `Invalid Bitcoin address for ${network}, ${paymentType}`
          ),
        };
      }

      const addressInfo = getAddressInfo(this.value, {
        castTestnetTo: network === "signet" ? Network.signet : undefined,
      });

      if (
        paymentType === "native-segwit" &&
        addressInfo.type !== AddressType.p2wpkh
      ) {
        return {
          error: new InvalidBitcoinAddressError(
            `Invalid Bitcoin address for ${network}, ${paymentType}`
          ),
        };
      }

      if (paymentType === "taproot" && addressInfo.type !== AddressType.p2tr) {
        return {
          error: new InvalidBitcoinAddressError(
            `Invalid Bitcoin address for ${network}, ${paymentType}`
          ),
        };
      }

      return {};
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";

      return {
        error: new InvalidBitcoinAddressError(errorMessage),
      };
    }
  }
}

export const useSenderConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  sender: string
) => {
  const [config] = useState(
    () => new SenderConfig(chainGetter, chainId, sender)
  );
  config.setChain(chainId);
  config.setValue(sender);

  return config;
};
