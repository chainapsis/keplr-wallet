import React, {FunctionComponent, useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import {MsgHistory} from '../types.ts';
import {useStore} from '../../../stores';
import {isValidCoinStr, parseCoinStr} from '@keplr-wallet/common';
import {CoinPretty} from '@keplr-wallet/unit';
import {ChainInfo} from '@keplr-wallet/types';
import {Buffer} from 'buffer';
import {MsgItemBase} from './base.tsx';
import {useStyle} from '../../../styles';
import {MessageSwapIcon} from '../../../components/icon';

export const MsgRelationIBCSwap: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage: boolean | undefined;
}> = observer(({msg, prices, targetDenom, isInAllActivitiesPage}) => {
  const {chainStore} = useStore();

  const style = useStyle();

  const chainInfo = chainStore.getChain(msg.chainId);
  const osmosisChainInfo = chainStore.getChain('osmosis');

  const sendAmountPretty = useMemo(() => {
    const currency = chainInfo.forceFindCurrency(targetDenom);

    const from = msg.meta['from'];
    if (
      from &&
      Array.isArray(from) &&
      from.length > 0 &&
      typeof from[0] === 'string'
    ) {
      for (const coinStr of from) {
        if (isValidCoinStr(coinStr as string)) {
          const coin = parseCoinStr(coinStr as string);
          if (coin.denom === targetDenom) {
            return new CoinPretty(currency, coin.amount);
          }
        }
      }
    }

    return new CoinPretty(currency, '0');
  }, [chainInfo, msg.meta, targetDenom]);

  const destinationChain: ChainInfo | undefined = (() => {
    if (!msg.ibcTracking) {
      return undefined;
    }

    try {
      let res: ChainInfo | undefined;
      for (const path of msg.ibcTracking.paths) {
        if (!path.chainId) {
          return undefined;
        }
        if (!chainStore.hasChain(path.chainId)) {
          return undefined;
        }

        if (!path.clientChainId) {
          return undefined;
        }
        if (!chainStore.hasChain(path.clientChainId)) {
          return undefined;
        }

        res = chainStore.getChain(path.clientChainId);
      }

      return res;
    } catch (e) {
      console.log(e);
      return undefined;
    }
  })();

  const destDenom: string | undefined = (() => {
    try {
      // osmosis가 시작 지점일 경우.
      if (
        (msg.msg as any)['@type'] === '/cosmwasm.wasm.v1.MsgExecuteContract'
      ) {
        const operations = (msg.msg as any).msg?.swap_and_action?.user_swap
          ?.swap_exact_asset_in?.operations;
        if (operations && operations.length > 0) {
          const minimalDenom = operations[operations.length - 1].denom_out;
          const currency = chainInfo.findCurrency(minimalDenom);
          if (currency) {
            if ('originCurrency' in currency && currency.originCurrency) {
              return currency.originCurrency.coinDenom;
            }
            return currency.coinDenom;
          }
        }
      }

      if (!msg.ibcTracking) {
        return undefined;
      }

      const parsed = JSON.parse(
        Buffer.from(msg.ibcTracking.originPacket, 'base64').toString(),
      );
      let obj: any = (() => {
        if (!parsed.memo) {
          return undefined;
        }

        return typeof parsed.memo === 'string'
          ? JSON.parse(parsed.memo)
          : parsed.memo;
      })();

      // 일단 대충 wasm 관련 msg를 찾는다.
      // 어차피 지금은 osmosis 밖에 지원 안하니까 대충 osmosis에서 실행된다고 가정하면 된다.
      while (obj) {
        if (
          obj.forward &&
          obj.forward.port &&
          obj.forward.channel &&
          typeof obj.forward.port === 'string' &&
          typeof obj.forward.channel === 'string'
        ) {
          obj = typeof obj.next === 'string' ? JSON.parse(obj.next) : obj.next;
        } else if (
          obj.wasm?.msg?.swap_and_action?.user_swap?.swap_exact_asset_in
            ?.operations
        ) {
          const operations =
            obj.wasm.msg.swap_and_action?.user_swap?.swap_exact_asset_in
              .operations;

          if (operations && operations.length > 0) {
            const minimalDenom = operations[operations.length - 1].denom_out;
            const currency = osmosisChainInfo.findCurrency(minimalDenom);
            if (currency) {
              if ('originCurrency' in currency && currency.originCurrency) {
                return currency.originCurrency.coinDenom;
              }
              return currency.coinDenom;
            }
          }

          obj = typeof obj.next === 'string' ? JSON.parse(obj.next) : obj.next;
          break;
        } else {
          break;
        }
      }
    } catch (e) {
      console.log(e);
      return undefined;
    }
  })();

  return (
    <MsgItemBase
      logo={
        <MessageSwapIcon size={40} color={style.get('color-gray-200').color} />
      }
      chainId={msg.chainId}
      title="Swap"
      paragraph={(() => {
        if (destDenom) {
          if (!msg.ibcTracking) {
            return `To ${destDenom} on ${chainInfo.chainName}`;
          }

          if (destinationChain) {
            return `To ${destDenom} on ${destinationChain.chainName}`;
          }
        }
        return 'Unknown';
      })()}
      amount={sendAmountPretty}
      prices={prices || {}}
      msg={msg}
      targetDenom={targetDenom}
      amountDeco={{
        color: 'none',
        prefix: 'minus',
      }}
      isInAllActivitiesPage={isInAllActivitiesPage}
    />
  );
});
