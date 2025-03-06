import React, {FunctionComponent, useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../../stores';
import {isValidCoinStr, parseCoinStr} from '@keplr-wallet/common';
import {CoinPretty} from '@keplr-wallet/unit';
import {MsgItemBase} from './base.tsx';
import {useStyle} from '../../../styles';
import {MsgHistory} from '../types.ts';
import {MessageReceiveIcon} from '../../../components/icon';

export const MsgRelationIBCSwapRefunded: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage: boolean | undefined;
}> = observer(({msg, prices, targetDenom, isInAllActivitiesPage}) => {
  const {chainStore} = useStore();
  const style = useStyle();

  const chainInfo = chainStore.getChain(msg.chainId);

  const sendAmountPretty = useMemo(() => {
    const currency = chainInfo.forceFindCurrency(targetDenom);

    const receives = msg.meta['receives'] as string[];
    for (const receive of receives) {
      if (isValidCoinStr(receive)) {
        const coin = parseCoinStr(receive);
        if (coin.denom === targetDenom) {
          return new CoinPretty(currency, coin.amount);
        }
      }
    }

    return new CoinPretty(currency, '0');
  }, [chainInfo, msg.meta, targetDenom]);

  return (
    <MsgItemBase
      logo={
        <MessageReceiveIcon
          size={40}
          color={style.get('color-gray-200').color}
        />
      }
      chainId={msg.chainId}
      title="Swap Refunded"
      amount={sendAmountPretty}
      prices={prices || {}}
      msg={msg}
      targetDenom={targetDenom}
      amountDeco={{
        color: 'none',
        prefix: 'plus',
      }}
      isInAllActivitiesPage={isInAllActivitiesPage}
    />
  );
});
