import React, {FunctionComponent, useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import {MsgHistory} from '../types.ts';
import {useStore} from '../../../stores';
import {CoinPretty} from '@keplr-wallet/unit';
import {Bech32Address} from '@keplr-wallet/cosmos';
import {Buffer} from 'buffer';
import {MsgItemBase} from './base.tsx';
import {useStyle} from '../../../styles';
import {MessageSendIcon} from '../../../components/icon';

export const MsgRelationIBCSend: FunctionComponent<{
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

    const token = (msg.msg as any)['token'] as {
      denom: string;
      amount: string;
    };

    if (token.denom !== targetDenom) {
      return new CoinPretty(currency, '0');
    }
    return new CoinPretty(currency, token.amount);
  }, [chainInfo, msg.msg, targetDenom]);

  const toAddress = (() => {
    if (!msg.ibcTracking) {
      return 'Unknown';
    }

    try {
      let res = Bech32Address.shortenAddress((msg.msg as any)['receiver'], 20);
      const packetData = Buffer.from(
        msg.ibcTracking.originPacket,
        'base64',
      ).toString();
      const parsed = JSON.parse(packetData);
      let obj: any = (() => {
        if (!parsed.memo) {
          return undefined;
        }

        typeof parsed.memo === 'string' ? JSON.parse(parsed.memo) : parsed.memo;
      })();

      while (obj) {
        if (obj.receiver) {
          res = Bech32Address.shortenAddress(obj.receiver, 20);
        }
        obj = typeof obj.next === 'string' ? JSON.parse(obj.next) : obj.next;
      }

      return res;
    } catch (e) {
      console.log(e);
      return 'Unknown';
    }
  })();

  return (
    <MsgItemBase
      logo={
        <MessageSendIcon size={40} color={style.get('color-gray-200').color} />
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
