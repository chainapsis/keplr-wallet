import React, { FunctionComponent, useMemo, useState } from "react";
import { ViewToken } from "../../../main";
import { ChainInfo, ModularChainInfo } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { useTheme } from "styled-components";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { useSpring, animated } from "@react-spring/web";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { Column, Columns } from "../../../../components/column";
import { XAxis, YAxis } from "../../../../components/axis";
import {
  ChainImageFallback,
  CurrencyImageFallback,
} from "../../../../components/image";
import { NativeChainMarkIcon } from "../../../../components/icon";
import { Gutter } from "../../../../components/gutter";
import {
  BaseTypography,
  Subtitle2,
  Subtitle3,
} from "../../../../components/typography";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse";
import { Stack } from "../../../../components/stack";
import { hexToRgba } from "../../../../utils";
import { Tooltip } from "../../../../components/tooltip";
import { DenomHelper } from "@keplr-wallet/common";
import { Checkbox } from "../../../../components/checkbox";
import { EnableChainsArrowDownIcon } from "./enable-chains-arrow-down-icon";
import { IconButton } from "../../../../components/icon-button";
import { Tag } from "../../../../components/tag";
import { FormattedMessage } from "react-intl";

export const ChainItem: FunctionComponent<{
  chainInfo: ChainInfo | ModularChainInfo;
  balance?: CoinPretty;
  isNativeChain?: boolean;
  enabled: boolean;
  blockInteraction: boolean;

  onClick: () => void;

  isFresh: boolean;
  tokens?: ViewToken[];
  showTagText?: "EVM" | "Starknet";
}> = observer(
  ({
    chainInfo,
    balance,
    enabled,
    blockInteraction,
    isNativeChain,
    onClick,
    isFresh,
    tokens,
    showTagText,
  }) => {
    const { priceStore } = useStore();
    const theme = useTheme();
    const [isCollapsedTokenView, setIsCollapsedTokenView] = useState(true);

    const price = balance ? priceStore.calculatePrice(balance) : undefined;

    const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId).identifier;

    const arrowAnimation = useSpring({
      transform: isCollapsedTokenView ? "rotate(0deg)" : "rotate(-180deg)",
      config: { tension: 300, friction: 25, clamp: true },
    });

    const isShowTokenView =
      !!tokens?.length &&
      (!balance?.toDec().isZero() ||
        tokens.some((token) => !token.token.toDec().isZero()));

    return (
      <Box
        borderRadius="0.375rem"
        paddingX="1rem"
        paddingY="0.75rem"
        backgroundColor={
          enabled
            ? theme.mode === "light"
              ? ColorPalette["gray-10"]
              : ColorPalette["gray-550"]
            : theme.mode === "light"
            ? ColorPalette.white
            : ColorPalette["gray-600"]
        }
        cursor={blockInteraction ? "not-allowed" : "pointer"}
        onClick={() => {
          if (!blockInteraction) {
            onClick();
          }
        }}
      >
        <Columns sum={1}>
          <XAxis alignY="center">
            {isNativeChain ? (
              <Box position="relative">
                <ChainImageFallback chainInfo={chainInfo} size="3rem" />
                <Box
                  position="absolute"
                  style={{
                    bottom: "-0.125rem",
                    right: "-0.125rem",
                  }}
                >
                  <NativeChainMarkIcon
                    width="1.25rem"
                    height="1.25rem"
                    color={
                      enabled
                        ? theme.mode === "light"
                          ? ColorPalette["gray-10"]
                          : ColorPalette["gray-550"]
                        : theme.mode === "light"
                        ? ColorPalette.white
                        : ColorPalette["gray-600"]
                    }
                  />
                </Box>
              </Box>
            ) : (
              <ChainImageFallback chainInfo={chainInfo} size="3rem" />
            )}

            <Gutter size="0.5rem" />

            <YAxis>
              <XAxis alignY="center">
                <XAxis alignY="center">
                  <Subtitle2>
                    {(() => {
                      // Noble의 경우만 약간 특수하게 표시해줌
                      if (chainIdentifier === "noble") {
                        return `${chainInfo.chainName} (USDC)`;
                      }

                      return chainInfo.chainName;
                    })()}
                  </Subtitle2>

                  {showTagText && (
                    <React.Fragment>
                      <Gutter size="0.375rem" />
                      <Tag text={showTagText} />
                    </React.Fragment>
                  )}
                </XAxis>
                {isShowTokenView && (
                  <React.Fragment>
                    <Gutter size="0.25rem" />
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setIsCollapsedTokenView(!isCollapsedTokenView);
                      }}
                      hoverColor={
                        theme.mode === "light"
                          ? hexToRgba(ColorPalette["gray-100"], 0.5)
                          : ColorPalette["gray-500"]
                      }
                      padding="0.25rem"
                    >
                      <animated.div
                        style={{
                          ...arrowAnimation,
                          padding: "0",
                          height: "1rem",
                        }}
                      >
                        <EnableChainsArrowDownIcon
                          width="1rem"
                          height="1rem"
                          color={
                            theme.mode === "light"
                              ? ColorPalette["gray-200"]
                              : ColorPalette["gray-300"]
                          }
                        />
                      </animated.div>
                    </IconButton>
                  </React.Fragment>
                )}
              </XAxis>
              {isShowTokenView && (
                <React.Fragment>
                  <Gutter size="0.25rem" />
                  <Subtitle3 color={ColorPalette["gray-300"]}>
                    <FormattedMessage
                      id="pages.register.enable-chains.chain-item-token-count"
                      values={{ count: tokens?.length }}
                    />
                  </Subtitle3>
                </React.Fragment>
              )}
            </YAxis>
          </XAxis>
          <Column weight={1} />
          <XAxis alignY="center">
            {isFresh ||
            balance == null ||
            (balance.toDec().isZero() && !isShowTokenView) ? null : (
              <YAxis alignX="right">
                <Subtitle3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-600"]
                      : ColorPalette.white
                  }
                >
                  {balance
                    .maxDecimals(6)
                    .shrink(true)
                    .inequalitySymbol(true)
                    .toString()}
                </Subtitle3>
                <Gutter size="0.25rem" />
                <Subtitle3 color={ColorPalette["gray-300"]}>
                  {price ? price.toString() : "-"}
                </Subtitle3>
              </YAxis>
            )}

            <Gutter size="1rem" />
            <Checkbox
              checked={enabled}
              onChange={() => {
                if (!blockInteraction) {
                  onClick();
                }
              }}
            />
          </XAxis>
        </Columns>
        {tokens && (
          <VerticalCollapseTransition
            collapsed={isCollapsedTokenView}
            opacityLeft={0}
          >
            <TokenView tokens={tokens} />
          </VerticalCollapseTransition>
        )}
      </Box>
    );
  }
);

const TokenItem: FunctionComponent<{
  viewToken: ViewToken;
}> = ({ viewToken }) => {
  const theme = useTheme();

  const tag = useMemo(() => {
    const currency = viewToken.token.currency;
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);
    if (
      denomHelper.type === "native" &&
      currency.coinMinimalDenom.startsWith("ibc/")
    ) {
      return {
        text: "IBC",
        tooltip: (() => {
          const start = currency.coinDenom.indexOf("(");
          const end = currency.coinDenom.lastIndexOf(")");

          if (start < 0 || end < 0) {
            return "Unknown";
          }

          return currency.coinDenom.slice(start + 1, end);
        })(),
      };
    }
    if (denomHelper.type !== "native") {
      if (viewToken.chainInfo.chainId.startsWith("bip122:")) {
        return {
          text: denomHelper.type
            .split(/(?=[A-Z])/)
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" "),
        };
      }

      return {
        text: denomHelper.type,
      };
    }
  }, [viewToken.token.currency]);
  const coinDenom = useMemo(() => {
    if (
      "originCurrency" in viewToken.token.currency &&
      viewToken.token.currency.originCurrency
    ) {
      return viewToken.token.currency.originCurrency.coinDenom;
    }
    return viewToken.token.currency.coinDenom;
  }, [viewToken.token.currency]);

  return (
    <Columns
      alignY="center"
      sum={1}
      key={viewToken.token.currency.coinMinimalDenom}
    >
      <CurrencyImageFallback
        chainInfo={viewToken.chainInfo}
        currency={viewToken.token.currency}
        size="1.5rem"
      />
      <Gutter size="0.25rem" />
      <Subtitle3
        color={
          theme.mode === "light"
            ? ColorPalette["gray-700"]
            : ColorPalette["gray-50"]
        }
        style={{
          wordBreak: "break-all",
        }}
      >
        {coinDenom}
      </Subtitle3>

      {tag ? (
        <React.Fragment>
          <Gutter size="0.25rem" />
          <Box alignY="center" height="1px">
            <TokenTag text={tag.text} tooltip={tag.tooltip} />
          </Box>
        </React.Fragment>
      ) : null}

      <Column weight={1} />
      <Gutter size="0.5rem" />
      <Subtitle3
        color={
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-200"]
        }
      >
        {viewToken.token
          .hideDenom(true)
          .maxDecimals(6)
          .inequalitySymbol(true)
          .shrink(true)
          .toString()}
      </Subtitle3>
    </Columns>
  );
};

const TokenView: FunctionComponent<{
  tokens: ViewToken[];
}> = ({ tokens }) => {
  const theme = useTheme();

  return (
    <Box
      paddingX="1rem"
      paddingY="0.75rem"
      marginTop="0.625rem"
      borderRadius="0.375rem"
      backgroundColor={
        theme.mode === "light"
          ? hexToRgba(ColorPalette["gray-100"], 0.5)
          : ColorPalette["gray-500"]
      }
    >
      <Stack gutter="0.5rem">
        {tokens?.map((token) => (
          <TokenItem
            key={token.token.currency.coinMinimalDenom}
            viewToken={token}
          />
        ))}
      </Stack>
    </Box>
  );
};

const TokenTag: FunctionComponent<{
  text: string;
  tooltip?: string;
}> = ({ text, tooltip }) => {
  const theme = useTheme();

  return (
    <Tooltip enabled={!!tooltip} content={tooltip}>
      <Box
        alignX="center"
        alignY="center"
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["blue-50"]
            : ColorPalette["gray-550"]
        }
        borderRadius="0.375rem"
        height="1rem"
        paddingX="0.375rem"
      >
        <BaseTypography
          style={{
            fontWeight: 400,
            fontSize: "0.6875rem",
          }}
          color={
            theme.mode === "light"
              ? ColorPalette["blue-400"]
              : ColorPalette["gray-200"]
          }
        >
          {text}
        </BaseTypography>
      </Box>
    </Tooltip>
  );
};
