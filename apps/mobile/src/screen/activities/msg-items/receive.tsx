import React, {FunctionComponent, useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import {MsgItemBase} from './base.tsx';
import {useStore} from '../../../stores';
import {IconProps} from '../../../components/icon/types.ts';
import {Path, Svg} from 'react-native-svg';
import {useStyle} from '../../../styles';
import {CoinPretty} from '@keplr-wallet/unit';
import {Bech32Address} from '@keplr-wallet/cosmos';
import {MsgHistory} from '../types.ts';

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
        <ArrowDownLeftIcon
          size={16}
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

export const ArrowDownLeftIcon: FunctionComponent<IconProps> = ({
  size,
  color,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M13 3L3 13M3 13L10.5 13M3 13L3 5.5"
        stroke={color || 'currentColor'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.87"
      />
    </Svg>
  );
};
