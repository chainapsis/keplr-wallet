import React, { FunctionComponent, useMemo } from "react";
import { MsgHistory } from "../types";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { MsgItemBase } from "./base";
import { ItemLogo } from "./logo";
import { ChainInfo } from "@keplr-wallet/types";
import { isValidCoinStr, parseCoinStr } from "@keplr-wallet/common";
import { Buffer } from "buffer/";
import { MessageSwapIcon } from "../../../../components/icon";
import { SwapVenues } from "../../../../config.ui";

export const MsgRelationIBCSwap: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage: boolean | undefined;
  isLegacyOsmosis?: boolean;
}> = observer(
  ({ msg, prices, targetDenom, isInAllActivitiesPage, isLegacyOsmosis }) => {
    const { chainStore } = useStore();

    const chainInfo = chainStore.getChain(msg.chainId);

    const sendAmountPretty = useMemo(() => {
      const currency = chainInfo.forceFindCurrency(targetDenom);

      const from = msg.meta["from"];
      if (
        from &&
        Array.isArray(from) &&
        from.length > 0 &&
        typeof from[0] === "string"
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

      return new CoinPretty(currency, "0");
    }, [chainInfo, msg.meta, targetDenom]);

    const destinationChain: ChainInfo | undefined = (() => {
      if (!msg.ibcTracking) {
        return undefined;
      }

      try {
        let res: ChainInfo | undefined = undefined;
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

          res = chainStore.getChain(path.clientChainId);
        }

        return res;
      } catch (e) {
        console.log(e);
        return undefined;
      }
    })();

    const swapVenueChain = (() => {
      if (isLegacyOsmosis) {
        return chainStore.getChain("osmosis");
      }

      const swapVenue = msg.meta["swapVenue"];
      if (swapVenue) {
        const swapVenueChainId = SwapVenues.find(
          (venue) => venue.name === swapVenue
        )?.chainId;

        if (swapVenueChainId) {
          return chainStore.hasModularChain(swapVenueChainId)
            ? chainStore.getChain(swapVenueChainId)
            : undefined;
        }
      }

      return undefined;
    })();

    const destDenom: string | undefined = (() => {
      try {
        // swap venue가 시작 지점일 경우.
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
          if (operations && operations.length > 0 && swapVenueChain) {
            const minimalDenom = operations[operations.length - 1].denom_out;
            const currency = swapVenueChain.findCurrency(minimalDenom);
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

            if (operations && operations.length > 0 && swapVenueChain) {
              const minimalDenom = operations[operations.length - 1].denom_out;
              const currency = swapVenueChain.findCurrency(minimalDenom);
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
          return "Unknown";
        })()}
        amount={sendAmountPretty}
        prices={prices || {}}
        msg={msg}
        targetDenom={targetDenom}
        amountDeco={{
          color: "none",
          prefix: "minus",
        }}
        isInAllActivitiesPage={isInAllActivitiesPage}
      />
    );
  }
);
