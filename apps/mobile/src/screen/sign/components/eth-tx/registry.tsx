import React, {FunctionComponent, PropsWithChildren} from 'react';
import {IEthTxRenderRegistry, IEthTxRenderer} from './types';
import {UnsignedTransaction} from '@ethersproject/transactions';
import {EthSendTokenTx} from './renders';
import {Text} from 'react-native';
import {useStyle} from '../../../../styles';

export class EthTxRenderRegistry implements IEthTxRenderRegistry {
  protected renderers: IEthTxRenderer[] = [];

  register(renderer: IEthTxRenderer): void {
    this.renderers.push(renderer);
  }

  render(
    chainId: string,
    unsignedTx: UnsignedTransaction,
  ): {
    content: string | React.ReactElement;
  } {
    try {
      for (const renderer of this.renderers) {
        const res = renderer.process(chainId, unsignedTx);
        if (res) {
          return res;
        }
      }
    } catch (e) {
      console.log(e);
      // Fallback to unknown content.
    }

    return {
      content: (
        <UnknownContent>{JSON.stringify(unsignedTx, null, 2)}</UnknownContent>
      ),
    };
  }
}

const UnknownContent: FunctionComponent<PropsWithChildren> = ({children}) => {
  const style = useStyle();

  return (
    <Text style={style.flatten(['body3', 'color-text-middle'])}>
      {children}
    </Text>
  );
};

export const defaultRegistry = new EthTxRenderRegistry();

defaultRegistry.register(EthSendTokenTx);
