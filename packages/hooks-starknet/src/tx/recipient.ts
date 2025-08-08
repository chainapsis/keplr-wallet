import {
  IRecipientConfig,
  UIProperties,
  IRecipientConfigWithNameServices,
} from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { EmptyAddressError, InvalidHexError } from "./errors";
import { useState } from "react";
import { NameService } from "./name-service";
import { StarknetIdNameService } from "./name-service-starknet-id";
import { StarknetAccountBase } from "@keplr-wallet/stores-starknet";

export class RecipientConfig
  extends TxChainSetter
  implements IRecipientConfig, IRecipientConfigWithNameServices
{
  @observable
  protected _value: string = "";

  @observable
  protected _preferredNameService: string | undefined = undefined;

  @observable.ref
  protected nameServices: NameService[] = [];

  constructor(chainGetter: ChainGetter, initialChainId: string) {
    super(chainGetter, initialChainId);

    this.nameServices.push(new StarknetIdNameService(this, chainGetter));

    makeObservable(this);
  }

  get preferredNameService(): string | undefined {
    return this._preferredNameService;
  }

  @action
  setPreferredNameService(nameService: string | undefined) {
    this._preferredNameService = nameService;
  }

  getNameService(type: string): NameService | undefined {
    return this.nameServices.find((nameService) => nameService.type === type);
  }

  getNameServices(): NameService[] {
    return this.nameServices;
  }

  @computed
  get nameServiceResult(): {
    type: string;
    address: string;
    fullName: string;
    domain: string;
    suffix: string;
  }[] {
    const result: {
      type: string;
      address: string;
      fullName: string;
      domain: string;
      suffix: string;
    }[] = [];
    for (const nameService of this.nameServices) {
      if (
        this.preferredNameService &&
        nameService.type !== this.preferredNameService
      ) {
        continue;
      }

      const r = nameService.result;
      if (r) {
        result.push({
          ...r,
          type: nameService.type,
        });
      }
    }
    return result;
  }

  @action
  setStarknetID(chainId: string) {
    const found = this.nameServices.find(
      (nameService) => nameService.type === "starknet-id"
    );
    if (found) {
      (found as StarknetIdNameService).setStarknetID(chainId);
    } else {
      this.nameServices.push(
        new StarknetIdNameService(this, this.chainGetter, chainId)
      );
    }
  }

  get recipient(): string {
    if (this.nameServiceResult.length > 0) {
      const r = this.nameServiceResult[0];
      return r.address;
    }

    const rawRecipient = this.value.trim();

    const modularChainInfoImpl = this.modularChainInfo;
    if (!("starknet" in modularChainInfoImpl.embedded)) {
      throw new Error("Chain doesn't support the starknet");
    }

    return rawRecipient;
  }

  @computed
  get uiProperties(): UIProperties {
    let rawRecipient = this.value.trim();

    if (!rawRecipient) {
      return {
        error: new EmptyAddressError("Address is empty"),
      };
    }

    if (this.nameServiceResult.length > 0) {
      const r = this.nameServiceResult[0];
      rawRecipient = r.address;
    }

    if (!StarknetAccountBase.isStarknetHexAddress(rawRecipient)) {
      return {
        error: new InvalidHexError("Not found"),
      };
    }

    return {};
  }

  get value(): string {
    return this._value;
  }

  @action
  setValue(value: string): void {
    this._value = value;

    for (const nameService of this.nameServices) {
      nameService.setValue(value);
    }
  }
}

export const useRecipientConfig = (
  chainGetter: ChainGetter,
  chainId: string
) => {
  const [config] = useState(() => new RecipientConfig(chainGetter, chainId));
  config.setChain(chainId);
  config.setStarknetID(chainId);

  return config;
};
