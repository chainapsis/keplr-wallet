/* eslint-disable import/no-extraneous-dependencies */
import { IPermissionConfig, PermissionDetails } from "./types";
import { action, makeObservable, observable } from "mobx";
import { ChainGetter } from "@keplr-wallet/stores";
import { TxChainSetter } from "./chain";
import { useState } from "react";
import faCoins from "@fortawesome/fontawesome-free-regular";
import faArrowsRotate from "@fortawesome/fontawesome-free-regular";
import faLightEmergencyOn from "@fortawesome/fontawesome-free-regular";
import faCat from "@fortawesome/fontawesome-free-regular";
import faHeartCirclePlus from "@fortawesome/fontawesome-free-regular";

export class PermissionConfig
  extends TxChainSetter
  implements IPermissionConfig {
  @observable
  protected _permission: PermissionDetails = {
    icon: null,
    name: "",
    contract: "",
    message_name: "",
    fields: null,
  };

  public availablePermissions: PermissionDetails[] = [
    {
      icon: { faCoins },
      name: "Spend OSMO (Limited)",
      contract: "placeholder",
      message_name: "placeholder",
      fields: null,
    },
    {
      icon: { faArrowsRotate },
      name: "Trade on Osmosis",
      contract: "osmo_placeholder",
      message_name: "trade",
      fields: null,
    },
    {
      icon: { faLightEmergencyOn },
      name: "Set as Recovery Partner",
      contract: "placeholder",
      message_name: "placeholder",
      fields: null,
    },
    {
      icon: { faCat },
      name: "Trade NFTs",
      contract: "placeholder",
      message_name: "placeholder",
      fields: null,
    },
    {
      icon: { faHeartCirclePlus },
      name: "Set as Inheritance Beneficiary",
      contract: "placeholder",
      message_name: "placeholder",
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
    this.selectedPermission = permission;
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
