import React from 'react';
import {UnsignedTransaction} from '@ethersproject/transactions';

export interface IEthTxRenderer {
  process(
    chainId: string,
    unsignedTx: UnsignedTransaction,
  ):
    | {
        content: string | React.ReactElement;
      }
    | undefined;
}

export interface IEthTxRenderRegistry {
  register(renderer: IEthTxRenderer): void;

  render(
    chainId: string,
    unsignedTx: UnsignedTransaction,
  ): {
    content: string | React.ReactElement;
  };
}
