import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { ISenderConfig } from "@keplr-wallet/hooks";
import { useStore } from "../../../../stores";
import { Box } from "../../../../components/box";
import { XAxis } from "../../../../components/axis";
import { Gutter } from "../../../../components/gutter";
import { Body3, Subtitle2, Subtitle3 } from "../../../../components/typography";
import styled from "styled-components";
import { ColorPalette } from "../../../../styles";
import { ChainImageFallback } from "../../../../components/image";
import { AppCurrency } from "@keplr-wallet/types";
import { IBCSwapAmountConfig } from "../../../../hooks/ibc-swap";
import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";

const Styles = {
  TextInput: styled.input`
    font-weight: 600;
    font-size: 1.25rem;

    width: 100%;

    background: none;
    margin: 0;
    padding: 0;
    border: 0;

    // Remove normalized css properties
    outline: none;

    ::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    ::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  `,
};

export const SwapAssetInfo: FunctionComponent<{
  type: "from" | "to";

  senderConfig: ISenderConfig;
  amountConfig: IBCSwapAmountConfig;
}> = observer(({ type, senderConfig, amountConfig }) => {
  const { chainStore, queriesStore } = useStore();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const fromChainInfo = chainStore.getChain(amountConfig.chainId);
  const fromCurrency: AppCurrency | undefined = (() => {
    if (amountConfig.amount.length === 0) {
      return;
    }

    return amountConfig.amount[0].currency;
  })();

  const toChainInfo = chainStore.getChain(amountConfig.outChainId);
  const outCurrency: AppCurrency = amountConfig.outCurrency;

  return (
    <Box
      padding="1rem"
      paddingBottom="0.75rem"
      backgroundColor={ColorPalette["gray-600"]}
      borderRadius="0.375rem"
    >
      <XAxis alignY="center">
        <Gutter size="0.25rem" />
        <Subtitle3 color={ColorPalette["gray-200"]}>
          {type === "from" ? "From" : "To"}
        </Subtitle3>
        <div
          style={{
            flex: 1,
          }}
        />
        {type === "from" ? (
          <Box
            cursor="pointer"
            onClick={(e) => {
              e.preventDefault();

              amountConfig.setFraction(1);
            }}
          >
            <Body3 color={ColorPalette["gray-200"]}>{`Max: ${(() => {
              const bal = queriesStore
                .get(senderConfig.chainId)
                .queryBalances.getQueryBech32Address(senderConfig.sender)
                .getBalance(amountConfig.currency);

              if (!bal) {
                return `0 ${amountConfig.currency.coinDenom}`;
              }

              return bal.balance
                .maxDecimals(6)
                .trim(true)
                .shrink(true)
                .inequalitySymbol(true)
                .toString();
            })()}`}</Body3>
          </Box>
        ) : null}
      </XAxis>

      <Gutter size="0.75rem" />

      <XAxis alignY="center">
        <Styles.TextInput
          value={
            type === "from"
              ? amountConfig.value
              : amountConfig.outAmount
                  .maxDecimals(6)
                  .trim(true)
                  .shrink(true)
                  .inequalitySymbol(true)
                  .hideDenom(true)
                  .toString()
          }
          placeholder="0"
          type={type === "from" ? "number" : undefined}
          onChange={(e) => {
            e.preventDefault();

            if (type === "from") {
              amountConfig.setValue(e.target.value);
            }
          }}
          autoComplete="off"
          readOnly={type !== "from"}
        />
        <Gutter size="0.5rem" />
        <Box
          paddingLeft="0.62rem"
          paddingRight="0.75rem"
          paddingY="0.5rem"
          borderRadius="99999999px"
          backgroundColor={ColorPalette["gray-500"]}
          cursor="pointer"
          onClick={(e) => {
            e.preventDefault();

            if (type === "from") {
              const outChainId = searchParams.get("outChainId");
              const outCoinMinimalDenom = searchParams.get(
                "outCoinMinimalDenom"
              );
              // from에 대한 currency를 선택하고 나면 이미 input 값의 의미(?) 자체가 크게 변했기 때문에
              // 다른 state는 유지할 필요가 없다. query string을 단순하게 to에 대한 currency만 유지한다.
              navigate(
                `/send/select-asset?isIBCSwap=true&navigateReplace=true&navigateTo=${encodeURIComponent(
                  `/ibc-swap?chainId={chainId}&coinMinimalDenom={coinMinimalDenom}${(() => {
                    let q = "";
                    if (outChainId) {
                      q += `outChainId=${outChainId}`;
                    }
                    if (outCoinMinimalDenom) {
                      if (q.length > 0) {
                        q += "&";
                      }
                      q += `outCoinMinimalDenom=${outCoinMinimalDenom}`;
                    }
                    if (q.length > 0) {
                      q = `&${q}`;
                    }
                    return q;
                  })()}`
                )}`
              );
            } else {
              // to에 대한 currency를 선택할 때 from에서 선택한 currency와 다른 state들은 여전히 유지시켜야한다.
              // 그러므로 query string을 최대한 유지한다.
              const qs = Object.fromEntries(searchParams.entries());
              delete qs["outChainId"];
              delete qs["outCoinMinimalDenom"];
              navigate(
                `/send/select-asset?isIBCSwapDestination=true&navigateReplace=true&navigateTo=${encodeURIComponent(
                  `/ibc-swap?outChainId={chainId}&outCoinMinimalDenom={coinMinimalDenom}${(() => {
                    let q = "";
                    for (const [key, value] of Object.entries(qs)) {
                      q += `&${key}=${value}`;
                    }
                    return q;
                  })()}`
                )}`
              );
            }
          }}
        >
          <XAxis alignY="center">
            {(() => {
              const currency = type === "from" ? fromCurrency : outCurrency;

              return (
                <React.Fragment>
                  <ChainImageFallback
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                    }}
                    src={currency?.coinImageUrl}
                    alt={currency?.coinDenom || "coinDenom"}
                  />
                  <Gutter size="0.5rem" />
                  <Subtitle2 color={ColorPalette["gray-10"]}>
                    {currency?.coinDenom || "Unknown"}
                  </Subtitle2>
                  <Gutter size="0.25rem" />
                  <AllowLowIcon
                    width="1rem"
                    height="1rem"
                    color={ColorPalette["gray-200"]}
                  />
                </React.Fragment>
              );
            })()}
          </XAxis>
        </Box>
      </XAxis>

      <Gutter size="0.2rem" />

      <XAxis alignY="center">
        <Gutter size="0.25rem" />
        <Body3>TODO</Body3>
        <div
          style={{
            flex: 1,
          }}
        />
        <Body3 color={ColorPalette["gray-300"]}>{`on ${(() => {
          const chainInfo = type === "from" ? fromChainInfo : toChainInfo;
          const currency = type === "from" ? fromCurrency : outCurrency;

          if (!currency) {
            return "Unknown";
          }

          // XXX: 타입스크립트의 타입 추론이 먼가 이상함 일단 대충 이렇게 하고 패스.
          const appCurrency: AppCurrency = currency as AppCurrency;
          if ("originChainId" in appCurrency && appCurrency.originChainId) {
            return chainStore.getChain(appCurrency.originChainId).chainName;
          }

          return chainInfo.chainName;
        })()}`}</Body3>
        <Gutter size="0.25rem" />
      </XAxis>
    </Box>
  );
});

const AllowLowIcon: FunctionComponent<{
  width: string;
  height: string;
  color: string;
}> = ({ width, height, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      stroke="none"
      viewBox="0 0 16 16"
    >
      <path
        fill={color || "currentColor"}
        d="M8.632 11.188a.8.8 0 01-1.263 0L3.404 6.091A.8.8 0 014.036 4.8h7.928a.8.8 0 01.632 1.291l-3.964 5.097z"
      />
    </svg>
  );
};
