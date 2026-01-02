import React, { FunctionComponent, useMemo } from "react";
import { MsgHistory } from "../types";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { MsgItemBase } from "./base";
import { ItemLogo } from "./logo";
import { ModularChainInfo } from "@keplr-wallet/types";
import { isValidCoinStr, parseCoinStr } from "@keplr-wallet/common";
import { Buffer } from "buffer/";
import { MessageSwapIcon } from "../../../../components/icon";
import { SwapVenues } from "../../../../config.ui";

export const MsgRelationIBCSwapReceive: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage: boolean | undefined;
  isLegacyOsmosis?: boolean;
}> = observer(
  ({ msg, prices, targetDenom, isInAllActivitiesPage, isLegacyOsmosis }) => {
    const { chainStore, queriesStore } = useStore();

    const modularChainInfoImpl = chainStore.getModularChainInfoImpl(
      msg.chainId
    );

    const sendAmountPretty = useMemo(() => {
      const currency = modularChainInfoImpl.forceFindCurrency(targetDenom);

      const receives = msg.meta["receives"];
      if (
        receives &&
        Array.isArray(receives) &&
        receives.length > 0 &&
        typeof receives[0] === "string"
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

      return new CoinPretty(currency, "0");
    }, [modularChainInfoImpl, msg.meta, targetDenom]);

    const sourceChain: ModularChainInfo | undefined = (() => {
      if (!msg.ibcTracking) {
        return undefined;
      }

      try {
        for (const path of msg.ibcTracking.paths) {
          if (!path.chainId) {
            return undefined;
          }
          if (!chainStore.hasModularChain(path.chainId)) {
            return undefined;
          }

          if (!path.clientChainId) {
            return undefined;
          }
          if (!chainStore.hasModularChain(path.clientChainId)) {
            return undefined;
          }
        }

        if (msg.ibcTracking.paths.length > 0) {
          const path = msg.ibcTracking.paths[0];
          if (!path.chainId) {
            return undefined;
          }
          if (!chainStore.hasModularChain(path.chainId)) {
            return undefined;
          }
          return chainStore.getModularChain(path.chainId);
        }

        return undefined;
      } catch (e) {
        console.log(e);
        return undefined;
      }
    })();

    const swapVenueChainInfoImpl = (() => {
      if (isLegacyOsmosis) {
        return chainStore.getModularChainInfoImpl("osmosis");
      }

      const swapVenue = msg.meta["swapVenue"];
      if (swapVenue) {
        const swapVenueChainId = SwapVenues.find(
          (venue) => venue.name === swapVenue
        )?.chainId;

        if (swapVenueChainId) {
          return chainStore.hasModularChain(swapVenueChainId)
            ? chainStore.getModularChainInfoImpl(swapVenueChainId)
            : undefined;
        }
      }

      return undefined;
    })();

    // XXX: queries store를 쓰게되면서 구조상 useMemo를 쓰기 어렵다...
    const srcDenom: string | undefined = (() => {
      try {
        // swap venue에서 swap/receive가 끝난 경우.
        if (
          (msg.msg as any)["@type"] === "/cosmwasm.wasm.v1.MsgExecuteContract"
        ) {
          const operations = (() => {
            let operations = (msg.msg as any).msg?.swap_and_action?.user_swap
              ?.swap_exact_asset_in?.operations;
            if (operations) {
              return operations;
            }
            if (
              (msg.msg as any).msg?.smart_swap_exact_asset_in?.user_swap
                ?.swap_exact_asset_in?.routes &&
              (msg.msg as any).msg?.smart_swap_exact_asset_in?.user_swap
                ?.swap_exact_asset_in?.routes.length > 0
            ) {
              operations = (msg.msg as any).msg?.smart_swap_exact_asset_in
                ?.user_swap?.swap_exact_asset_in?.routes[
                (msg.msg as any).msg?.smart_swap_exact_asset_in?.user_swap
                  ?.swap_exact_asset_in?.routes.length - 1
              ].operations;
            }
            return operations;
          })();
          if (operations && operations.length > 0 && swapVenueChainInfoImpl) {
            const minimalDenom = operations[0].denom_in;
            const currency = swapVenueChainInfoImpl.findCurrency(minimalDenom);
            if (currency) {
              if ("originCurrency" in currency && currency.originCurrency) {
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
          Buffer.from(msg.ibcTracking.originPacket, "base64").toString()
        );

        let obj: any = (() => {
          if (!parsed.memo) {
            return undefined;
          }

          return typeof parsed.memo === "string"
            ? JSON.parse(parsed.memo)
            : parsed.memo;
        })();

        // 일단 대충 wasm 관련 msg를 찾는다.
        while (obj) {
          if (
            obj.forward &&
            obj.forward.port &&
            obj.forward.channel &&
            typeof obj.forward.port === "string" &&
            typeof obj.forward.channel === "string"
          ) {
            obj = (() => {
              if (
                obj.forward &&
                typeof obj.forward === "object" &&
                obj.forward.next
              ) {
                const next = obj.forward.next;
                return typeof next === "string" ? JSON.parse(next) : next;
              }

              return typeof obj.next === "string"
                ? JSON.parse(obj.next)
                : obj.next;
            })();
          } else if (
            obj.wasm?.msg?.swap_and_action?.user_swap?.swap_exact_asset_in
              ?.operations ||
            obj.wasm?.msg?.swap_and_action?.user_swap?.smart_swap_exact_asset_in
              ?.routes
          ) {
            const operations = obj.wasm?.msg?.swap_and_action?.user_swap
              ?.smart_swap_exact_asset_in?.routes
              ? (() => {
                  if (
                    obj.wasm?.msg?.swap_and_action?.user_swap
                      ?.smart_swap_exact_asset_in?.routes.length > 0
                  ) {
                    return obj.wasm?.msg?.swap_and_action?.user_swap
                      ?.smart_swap_exact_asset_in?.routes[
                      obj.wasm?.msg?.swap_and_action?.user_swap
                        ?.smart_swap_exact_asset_in?.routes.length - 1
                    ].operations;
                  }
                })()
              : obj.wasm.msg.swap_and_action?.user_swap?.swap_exact_asset_in
                  .operations;

            if (operations && operations.length > 0 && swapVenueChainInfoImpl) {
              const minimalDenom = operations[0].denom_in;
              const currency =
                swapVenueChainInfoImpl.findCurrency(minimalDenom);
              if (currency) {
                if ("originCurrency" in currency && currency.originCurrency) {
                  return currency.originCurrency.coinDenom;
                }
                return currency.coinDenom;
              }
            }

            obj = (() => {
              if (
                obj.forward &&
                typeof obj.forward === "object" &&
                obj.forward.next
              ) {
                const next = obj.forward.next;
                return typeof next === "string" ? JSON.parse(next) : next;
              }

              return typeof obj.next === "string"
                ? JSON.parse(obj.next)
                : obj.next;
            })();
            break;
          } else {
            break;
          }
        }

        // 위에서 wasm 관련된 msg를 찾으면 바로 return되기 때문에
        // 여기까지 왔으면 wasm 관련된 msg를 못찾은거다
        // 이 경우는 swap venue에서 바로 swap되고 transfer된 경우다...
        // 여기서 swap venue 체인 위의 currency를 찾아야 하는데
        // 문제는 packet은 receive에 대한 정보만 주기 때문에 찾을수가 없다...;;
        // 따로 query를 사용해서 origin message를 찾는수밖에 없다;
        const queryOriginMsg = queriesStore.simpleQuery.queryGet(
          process.env["KEPLR_EXT_TX_HISTORY_BASE_URL"],
          `/block/msg/${msg.ibcTracking.chainIdentifier}/${Buffer.from(
            msg.ibcTracking.txHash,
            "base64"
          ).toString("hex")}/${msg.ibcTracking.msgIndex}`
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
            if (operations && operations.length > 0 && swapVenueChainInfoImpl) {
              const minimalDenom = operations[0].denom_in;
              const currency =
                swapVenueChainInfoImpl.findCurrency(minimalDenom);
              if (currency) {
                if ("originCurrency" in currency && currency.originCurrency) {
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
          <ItemLogo center={<MessageSwapIcon width="2rem" height="2rem" />} />
        }
        chainId={msg.chainId}
        title="Swap Completed"
        paragraph={(() => {
          if (srcDenom) {
            if (!msg.ibcTracking) {
              return `From ${srcDenom} on ${modularChainInfoImpl.embedded.chainName}`;
            }

            if (sourceChain) {
              return `From ${srcDenom} on ${sourceChain.chainName}`;
            }
          }
          return "Unknown";
        })()}
        amount={sendAmountPretty}
        prices={prices || {}}
        msg={msg}
        targetDenom={targetDenom}
        amountDeco={{
          color: "green",
          prefix: "plus",
        }}
        isInAllActivitiesPage={isInAllActivitiesPage}
      />
    );
  }
);
