import { IPermissionConfig, PermissionDetails } from "./types";
import { action, makeObservable, observable } from "mobx";
import { ChainGetter } from "@keplr-wallet/stores";
import { TxChainSetter } from "./chain";
import { useState } from "react";

export class PermissionConfig
  extends TxChainSetter
  implements IPermissionConfig {
  @observable
  protected _permission: PermissionDetails = {
    name: "",
    contract: "",
    message_name: "",
    fields: null,
  };

  public availablePermissions: PermissionDetails[] = [
    {
      name: "Spend OSMO (Limited)",
      contract: "placeholder",
      message_name: "placeholder",
      fields: null,
    },
    {
      name: "Trade on Osmosis",
      contract: "osmo_placeholder",
      message_name: "trade",
      fields: null,
    },
  ];

  public selectedPermission = this.availablePermissions[0];

  constructor(chainGetter: ChainGetter, initialChainId: string) {
    super(chainGetter, initialChainId);
    makeObservable(this);
  }

  get permission(): PermissionDetails {
    return this._permission;
  }

  @action
  setPermission(permission: PermissionDetails) {
    this._permission = permission;
  }

  get error(): Error | undefined {
    return undefined;
  }
}

export const usePermissionConfig = (
  chainGetter: ChainGetter,
  chainId: string
) => {
  const [config] = useState(() => new PermissionConfig(chainGetter, chainId));
  config.setChain(chainId);

  return config;
};
