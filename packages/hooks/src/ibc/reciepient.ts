import { RecipientConfig, UIProperties } from "../tx";
import { ChainGetter } from "@keplr-wallet/stores";
import { IIBCChannelConfig } from "./types";
import { useState } from "react";
import { action, makeObservable, observable, override } from "mobx";
import { ChannelNotSetError } from "./errors";

/**
 * IBCRecipientConfig returns the recipient config for IBC transfer.
 * The recipient config's chain id should be the destination chain id for IBC.
 * But, actually, the recipient config's chain id would be set as the sending chain id if the channel not set.
 * So, you should remember that the recipient config's chain id is equal to the sending chain id, if channel not set.
 */
export class IBCRecipientConfig extends RecipientConfig {
  @observable
  protected isIBCTransfer: boolean = false;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    protected readonly channelConfig: IIBCChannelConfig,
    isIBCTransfer: boolean
  ) {
    super(chainGetter, initialChainId);

    this.isIBCTransfer = isIBCTransfer;

    makeObservable(this);
  }

  override get chainId(): string {
    if (!this.isIBCTransfer || this.channelConfig.channels.length === 0) {
      return super.chainId;
    }

    return this.channelConfig.channels[this.channelConfig.channels.length - 1]
      .counterpartyChainId;
  }

  @override
  override get uiProperties(): UIProperties {
    if (this.isIBCTransfer && this.channelConfig.channels.length === 0) {
      return {
        error: new ChannelNotSetError("Channel not set"),
      };
    }

    return super.uiProperties;
  }

  @action
  setIsIBCTransfer(isIBCTransfer: boolean) {
    this.isIBCTransfer = isIBCTransfer;
  }
}

export const useIBCRecipientConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  channelConfig: IIBCChannelConfig,
  options: {
    allowHexAddressToBech32Address?: boolean;
    allowHexAddressOnly?: boolean;
    icns?: {
      chainId: string;
      resolverContractAddress: string;
    };
    ens?: {
      chainId: string;
    };
  } = {},
  isIBCTransfer: boolean
) => {
  const [config] = useState(
    () =>
      new IBCRecipientConfig(chainGetter, chainId, channelConfig, isIBCTransfer)
  );
  config.setChain(chainId);
  config.setAllowHexAddressToBech32Address(
    options.allowHexAddressToBech32Address
  );
  config.setAllowHexAddressOnly(options.allowHexAddressOnly);
  config.setICNS(options.icns);
  config.setENS(options.ens);
  config.setIsIBCTransfer(isIBCTransfer);

  return config;
};
