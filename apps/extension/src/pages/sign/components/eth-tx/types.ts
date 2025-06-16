import { Transaction } from "ethers";
import React from "react";

export interface IEthTxRenderer {
  process(
    chainId: string,
    unsignedTx: Transaction
  ):
    | {
        icon?: React.ReactElement;
        title?: string | React.ReactElement;
        content: string | React.ReactElement;
      }
    | undefined;
}

export interface IEthTxRenderRegistry {
  register(renderer: IEthTxRenderer): void;

  render(
    chainId: string,
    unsignedTx: Transaction
  ): {
    icon?: React.ReactElement;
    title?: string | React.ReactElement;
    content: string | React.ReactElement;
  };
}
