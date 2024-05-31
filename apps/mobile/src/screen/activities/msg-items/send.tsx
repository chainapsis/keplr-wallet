import React, {FunctionComponent, useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import {MsgHistory} from '../types.ts';
import {useStore} from '../../../stores';
import {CoinPretty} from '@keplr-wallet/unit';
import {Bech32Address} from '@keplr-wallet/cosmos';
import {MsgItemBase} from './base.tsx';
import {IconProps} from '../../../components/icon/types.ts';
import {Path, Svg} from 'react-native-svg';
import {useStyle} from '../../../styles';

export const MsgRelationSend: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage: boolean | undefined;
}> = observer(({msg, prices, targetDenom, isInAllActivitiesPage}) => {
  const style = useStyle();

  const {chainStore} = useStore();

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

  const toAddress = (() => {
    try {
      return Bech32Address.shortenAddress((msg.msg as any)['to_address'], 20);
    } catch (e) {
      console.log(e);
      return 'Unknown';
    }
  })();

  return (
    <MsgItemBase
      logo={
        <ArrowUpRightIcon size={16} color={style.get('color-gray-200').color} />
      }
      chainId={msg.chainId}
      title="Send"
      paragraph={`To ${toAddress}`}
      amount={sendAmountPretty}
      prices={prices || {}}
      msg={msg}
      targetDenom={targetDenom}
      amountDeco={{
        prefix: 'minus',
        color: 'none',
      }}
      isInAllActivitiesPage={isInAllActivitiesPage}
    />
  );
});

export const ArrowUpRightIcon: FunctionComponent<IconProps> = ({
  size,
  color,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M3 13.5l10-10m0 0H5.5m7.5 0V11"
        stroke={color || 'currentColor'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.87"
      />
    </Svg>
  );
};
