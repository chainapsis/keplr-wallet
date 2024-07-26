import React, {FunctionComponent, useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import {MsgItemBase} from './base.tsx';
import {useStore} from '../../../stores';
import {useStyle} from '../../../styles';
import {CoinPretty} from '@keplr-wallet/unit';
import {Bech32Address} from '@keplr-wallet/cosmos';
import {MsgHistory} from '../types.ts';
import {MessageReceiveIcon} from '../../../components/icon';

export const MsgRelationReceive: FunctionComponent<{
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

    const amounts = (msg.msg as any)['amount'] as {
      denom: string;
      amount: string;
    }[];

    const amt = amounts.find(amt => amt.denom === targetDenom);
    if (!amt) {
      return new CoinPretty(currency, '0');
    }
    return new CoinPretty(currency, amt.amount);
  }, [chainInfo, msg.msg, targetDenom]);

  const fromAddress = (() => {
    try {
      return Bech32Address.shortenAddress((msg.msg as any)['from_address'], 20);
    } catch (e) {
      console.log(e);
      return 'Unknown';
    }
  })();

  return (
    <MsgItemBase
      logo={
        <MessageReceiveIcon
          size={40}
          color={style.get('color-gray-200').color}
        />
      }
      chainId={msg.chainId}
      title="Receive"
      paragraph={`From ${fromAddress}`}
      amount={sendAmountPretty}
      prices={prices || {}}
      msg={msg}
      targetDenom={targetDenom}
      amountDeco={{
        color: 'green',
        prefix: 'plus',
      }}
      isInAllActivitiesPage={isInAllActivitiesPage}
    />
  );
});
