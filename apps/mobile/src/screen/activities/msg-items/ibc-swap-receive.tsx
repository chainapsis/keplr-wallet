import React, {FunctionComponent, useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import {MsgHistory} from '../types.ts';
import {useStore} from '../../../stores';
import {useStyle} from '../../../styles';
import {isValidCoinStr, parseCoinStr} from '@keplr-wallet/common';
import {CoinPretty} from '@keplr-wallet/unit';
import {ChainInfo} from '@keplr-wallet/types';
import {Buffer} from 'buffer';
import {MsgItemBase} from './base.tsx';
import {MessageSwapIcon} from '../../../components/icon';

export const MsgRelationIBCSwapReceive: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage: boolean | undefined;
}> = observer(({msg, prices, targetDenom, isInAllActivitiesPage}) => {
  const {chainStore, queriesStore} = useStore();

  const style = useStyle();

  const chainInfo = chainStore.getChain(msg.chainId);
  const osmosisChainInfo = chainStore.getChain('osmosis');

  const sendAmountPretty = useMemo(() => {
    const currency = chainInfo.forceFindCurrency(targetDenom);

    const receives = msg.meta['receives'];
    if (
      receives &&
      Array.isArray(receives) &&
      receives.length > 0 &&
      typeof receives[0] === 'string'
    ) {
      for (const coinStr of receives) {
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

  const sourceChain: ChainInfo | undefined = (() => {
    if (!msg.ibcTracking) {
      return undefined;
    }

    try {
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
      }

      if (msg.ibcTracking.paths.length > 0) {
        const path = msg.ibcTracking.paths[0];
        if (!path.chainId) {
          return undefined;
        }
        if (!chainStore.hasChain(path.chainId)) {
          return undefined;
        }
        return chainStore.getChain(path.chainId);
      }

      return undefined;
    } catch (e) {
      console.log(e);
      return undefined;
    }
  })();

  // XXX: queries store를 쓰게되면서 구조상 useMemo를 쓰기 어렵다...
  const srcDenom: string | undefined = (() => {
    try {
      // osmosis가 그자체에서 swap/receive가 끝난 경우.
      if (
        (msg.msg as any)['@type'] === '/cosmwasm.wasm.v1.MsgExecuteContract'
      ) {
        const operations = (msg.msg as any).msg?.swap_and_action?.user_swap
          ?.swap_exact_asset_in?.operations;
        if (operations && operations.length > 0) {
          const minimalDenom = operations[0].denom_in;
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
            const minimalDenom = operations[0].denom_in;
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

      // 위에서 wasm 관련된 msg를 찾으면 바로 return되기 때문에
      // 여기까지 왔으면 wasm 관련된 msg를 못찾은거다
      // 이 경우는 osmosis에서 바로 swap되고 transfer된 경우다...
      // 여기서 osmosis 위의 currency를 찾아야 하는데
      // 어차피 osmosis밖에 지원 안하므로 첫 지점은 무조건 osmosis다...
      // 문제는 packet은 receive에 대한 정보만 주기 때문에 찾을수가 없다...;;
      // 따로 query를 사용해서 origin message를 찾는수밖에 없다;
      const queryOriginMsg = queriesStore.simpleQuery.queryGet(
        process.env['KEPLR_EXT_TX_HISTORY_BASE_URL'] || '',
        `/block/msg/${msg.ibcTracking.chainIdentifier}/${Buffer.from(
          msg.ibcTracking.txHash,
          'base64',
        ).toString('hex')}/${msg.ibcTracking.msgIndex}`,
      );
      if (queryOriginMsg.response) {
        const originMsg = queryOriginMsg.response.data as any;
        if (
          originMsg?.msg?.swap_and_action?.user_swap?.swap_exact_asset_in
            ?.operations
        ) {
          const operations =
            originMsg.msg.swap_and_action?.user_swap?.swap_exact_asset_in
              .operations;
          if (operations && operations.length > 0) {
            const minimalDenom = operations[0].denom_in;
            const currency = osmosisChainInfo.findCurrency(minimalDenom);
            if (currency) {
              if ('originCurrency' in currency && currency.originCurrency) {
                return currency.originCurrency.coinDenom;
              }
              return currency.coinDenom;
            }
          }
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
      title="Swap Completed"
      paragraph={(() => {
        if (srcDenom) {
          if (!msg.ibcTracking) {
            return `From ${srcDenom} on ${chainInfo.chainName}`;
          }

          if (sourceChain) {
            return `From ${srcDenom} on ${sourceChain.chainName}`;
          }
        }
        return 'Unknown';
      })()}
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
