import React, { FunctionComponent, useState, useMemo, useEffect } from "react";
import styled, { useTheme } from "styled-components";
import { observer } from "mobx-react-lite";
import { Box } from "../../../../components/box";
import { Stack } from "../../../../components/stack";
import { Column, Columns } from "../../../../components/column";
import { Gutter } from "../../../../components/gutter";
import { XAxis } from "../../../../components/axis";
import { ViewToken } from "../../index";
import { ColorPalette } from "../../../../styles";
import {
  ChainImageFallback,
  CurrencyImageFallback,
} from "../../../../components/image";
import {
  Subtitle2,
  Subtitle3,
  Caption1,
  Body2,
} from "../../../../components/typography";
import { BottomTagType, TokenItem } from "./index";
import { PriceChangeTag } from "./price-change-tag";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse/collapse";
import { ArrowRightIcon } from "../../../../components/icon";
import { useStore } from "../../../../stores";
import { useSearchParams } from "react-router-dom";
import { WrapperwithBottomTag } from "./wrapper-with-bottom-tag";
import { useEarnFeature } from "../../../../hooks/use-earn-feature";
import Color from "color";
import { IconProps } from "../../../../components/icon/types";
import { usePriceChange } from "../../../../hooks/use-price-change";
import { useTokenTag } from "../../../../hooks/use-token-tag";
import { TokenTag } from "./token-tag";
import { CopyAddressButton } from "./copy-address-button";
import { useCopyAddress } from "../../../../hooks/use-copy-address";
import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { Tooltip } from "../../../../components/tooltip";

const StandaloneEarnBox: FunctionComponent<{
  bottomTagType?: BottomTagType;
  earnedAssetPrice?: string;
}> = observer(({ bottomTagType, earnedAssetPrice }) => {
  const { message, handleClick } = useEarnFeature(
    bottomTagType,
    earnedAssetPrice
  );

  const theme = useTheme();

  const textColor =
    theme.mode === "light"
      ? ColorPalette["green-600"]
      : ColorPalette["green-400"];

  return (
    <StyledEarningsBox onClick={handleClick}>
      <Body2 color={textColor} style={{ textAlign: "center" }}>
        {message}
      </Body2>
      <ArrowRightIcon width="1rem" height="1rem" color={textColor} />
    </StyledEarningsBox>
  );
});

const NestedTokenItemContainer = styled.div<{ tagPosition: string }>`
  background-color: transparent;
  padding: 0rem 1rem 0rem 2rem;
  width: 100%;
  height: ${({ tagPosition }) => (tagPosition === "bottom" ? "56px" : "36px")};
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 0.375rem;
  cursor: pointer;
  box-shadow: none;

  &:hover {
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-10"]
        : ColorPalette["gray-650"]};
  }
`;

const NestedTokenItem: FunctionComponent<{
  viewToken: ViewToken;
  onClick?: () => void;
}> = observer(({ viewToken, onClick }) => {
  const { priceStore, uiConfigStore } = useStore();
  const theme = useTheme();
  const [isHover, setIsHover] = useState(false);

  const copyAddress = useCopyAddress(viewToken);

  const pricePretty = priceStore.calculatePrice(viewToken.token);

  const tag = useTokenTag(viewToken);

  const tagPosition = useMemo(() => {
    if (uiConfigStore.showFiatValue) {
      return "bottom";
    }
    return "right";
  }, [uiConfigStore.showFiatValue]);

  const TagItem = useMemo(
    () =>
      tag ? (
        <Box
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.125rem",
          }}
        >
          <XAxis>
            <Box alignY="center" key="token-tag">
              <TokenTag text={tag.text} tooltip={tag.tooltip} />
            </Box>
          </XAxis>
        </Box>
      ) : null,
    [tag]
  );

  const AmountItem = useMemo(() => {
    return (
      <Subtitle3
        color={
          theme.mode === "light"
            ? ColorPalette["gray-700"]
            : ColorPalette["gray-10"]
        }
      >
        {uiConfigStore.hideStringIfPrivacyMode(
          viewToken.token
            .hideDenom(true)
            .maxDecimals(6)
            .inequalitySymbol(true)
            .shrink(true)
            .toString(),
          2
        )}
      </Subtitle3>
    );
  }, [uiConfigStore.hideStringIfPrivacyMode, viewToken.token, theme.mode]);

  const pricePrettyString = useMemo(() => {
    return uiConfigStore.hideStringIfPrivacyMode(
      pricePretty ? pricePretty.inequalitySymbol(true).toString() : "-",
      2
    );
  }, [uiConfigStore.hideStringIfPrivacyMode, pricePretty]);
  return (
    <NestedTokenItemContainer
      tagPosition={tagPosition}
      onClick={onClick}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <Columns
        sum={1}
        gutter="0.6875rem"
        alignY="center"
        style={{ width: "100%" }}
      >
        <Stack gutter="0.25rem">
          <XAxis alignY="center">
            <Subtitle3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette["gray-10"]
              }
              style={{
                wordBreak: "break-all",
              }}
            >
              on {viewToken.chainInfo.chainName}
            </Subtitle3>
          </XAxis>
          {tagPosition === "bottom" ? TagItem : null}
        </Stack>
        {tagPosition === "right" ? TagItem : null}

        {copyAddress ? (
          <Box alignY="center" key="copy-address">
            <XAxis alignY="center">
              <Gutter size="-0.125rem" />
              <CopyAddressButton
                address={copyAddress}
                parentIsHover={isHover}
              />
            </XAxis>
          </Box>
        ) : null}

        <Column weight={1} />

        <Columns sum={1} gutter="0.25rem" alignY="center">
          <Stack gutter="0.25rem" alignX="right">
            {uiConfigStore.showFiatValue ? (
              AmountItem
            ) : (
              <Tooltip content={pricePrettyString} hideArrow={true}>
                {AmountItem}
              </Tooltip>
            )}
            {uiConfigStore.showFiatValue ? (
              <Subtitle3 color={ColorPalette["gray-300"]}>
                {pricePrettyString}
              </Subtitle3>
            ) : null}
          </Stack>
        </Columns>
      </Columns>
    </NestedTokenItemContainer>
  );
});

interface TokenGroupHeaderProps {
  disabled?: boolean;
  isOpen: boolean;
  onClick: () => void;
  mainToken: ViewToken;
  tokens: ViewToken[];
  uniqueChainIds: string[];
  coinDenom: string;
  price24HChange?: ReturnType<typeof usePriceChange>;
  totalBalance: CoinPretty;
  totalPrice: PricePretty | undefined;
}

const TokenGroupHeader: FunctionComponent<TokenGroupHeaderProps> = observer(
  ({
    disabled,
    isOpen,
    onClick,
    mainToken,
    tokens,
    uniqueChainIds,
    coinDenom,
    price24HChange,
    totalBalance,
    totalPrice,
  }) => {
    const { uiConfigStore } = useStore();
    const theme = useTheme();

    return (
      <Styles.Container disabled={disabled} isOpen={isOpen} onClick={onClick}>
        <Columns sum={1} gutter="0.5rem" alignY="center">
          <Styles.TokenImageWrapper>
            <CurrencyImageFallback
              chainInfo={mainToken.chainInfo}
              currency={mainToken.token.currency}
              size="2rem"
            />
            <StackIcon />
          </Styles.TokenImageWrapper>

          <Gutter size="0.75rem" />

          <Stack gutter="0.25rem">
            <XAxis alignY="center">
              <Subtitle2
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-700"]
                    : ColorPalette["gray-10"]
                }
              >
                {coinDenom}
              </Subtitle2>

              {price24HChange ? (
                <React.Fragment>
                  <Gutter size="0.25rem" />
                  <Box alignY="center" height="1px">
                    <PriceChangeTag rate={price24HChange} />
                  </Box>
                </React.Fragment>
              ) : null}
            </XAxis>
            <Box
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "0.125rem",
              }}
            >
              <Styles.ChainIconsContainer>
                {uniqueChainIds.slice(0, 3).map((chainId, index) => {
                  const token = tokens.find(
                    (t) => t.chainInfo.chainId === chainId
                  );
                  if (!token) return null;

                  return (
                    <Styles.ChainIcon key={chainId} zIndex={index}>
                      <ChainImageFallback
                        chainInfo={token.chainInfo}
                        size="1rem"
                      />
                    </Styles.ChainIcon>
                  );
                })}
                {uniqueChainIds.length > 3 && (
                  <Styles.PlusChainBadge>
                    +{uniqueChainIds.length - 3}
                  </Styles.PlusChainBadge>
                )}
              </Styles.ChainIconsContainer>
              <Styles.ExpandIcon isOpen={isOpen}>
                <ArrowIcon />
              </Styles.ExpandIcon>
            </Box>
          </Stack>

          <Column weight={1} />

          <Columns sum={1} gutter="0.25rem" alignY="center">
            <Stack gutter="0.25rem" alignX="right">
              <Subtitle3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-700"]
                    : ColorPalette["gray-10"]
                }
              >
                {uiConfigStore.hideStringIfPrivacyMode(
                  totalBalance
                    .hideDenom(true)
                    .maxDecimals(6)
                    .inequalitySymbol(true)
                    .shrink(true)
                    .toString(),
                  2
                )}
              </Subtitle3>
              <Subtitle3 color={ColorPalette["gray-300"]}>
                {uiConfigStore.hideStringIfPrivacyMode(
                  totalPrice
                    ? totalPrice.inequalitySymbol(true).toString()
                    : "-",
                  2
                )}
              </Subtitle3>
            </Stack>
          </Columns>
        </Columns>
      </Styles.Container>
    );
  }
);

export const GroupedTokenItem: FunctionComponent<{
  tokens: ViewToken[];
  onClick?: () => void;
  onTokenClick?: (token: ViewToken) => void;
  disabled?: boolean;
  bottomTagType?: BottomTagType;
  earnedAssetPrice?: string;
  showPrice24HChange?: boolean;
  alwaysOpen?: boolean;
}> = observer(
  ({
    tokens,
    onClick,
    disabled,
    bottomTagType,
    earnedAssetPrice,
    showPrice24HChange,
    alwaysOpen,
    onTokenClick,
  }) => {
    const [isOpen, setIsOpen] = useState(!!alwaysOpen);
    const { priceStore } = useStore();
    const [, setSearchParams] = useSearchParams();

    const mainToken = tokens[0];

    const totalBalance = useMemo(() => {
      let sum = tokens[0].token.clone();
      for (let i = 1; i < tokens.length; i++) {
        sum = sum.addDifferentDenoms(tokens[i].token);
      }
      return sum;
    }, [tokens]);

    const totalPrice = useMemo(() => {
      return priceStore.calculatePrice(totalBalance);
    }, [priceStore, totalBalance]);

    const uniqueChainIds = useMemo(() => {
      return [...new Set(tokens.map((token) => token.chainInfo.chainId))];
    }, [tokens]);

    const coinDenom = useMemo(() => {
      if (
        "originCurrency" in mainToken.token.currency &&
        mainToken.token.currency.originCurrency
      ) {
        return mainToken.token.currency.originCurrency.coinDenom;
      }
      return mainToken.token.currency.coinDenom;
    }, [mainToken.token.currency]);

    const effectiveEarnedAssetPrice = useMemo(() => {
      if (earnedAssetPrice) return earnedAssetPrice;
      const tokenWithPrice = tokens.find(
        (token) => "earnedAssetPrice" in token && token.earnedAssetPrice
      );
      return tokenWithPrice && "earnedAssetPrice" in tokenWithPrice
        ? (tokenWithPrice.earnedAssetPrice as string)
        : undefined;
    }, [tokens, earnedAssetPrice]);

    const price24HChange = usePriceChange(
      showPrice24HChange,
      mainToken.token.currency.coinGeckoId
    );

    const handleClick = () => {
      if (disabled) return;
      if (alwaysOpen) return;
      setIsOpen(!isOpen);
      if (onClick) onClick();
    };

    const openTokenDetail = (token: ViewToken) => {
      setSearchParams((prev) => {
        prev.set("tokenChainId", token.chainInfo.chainId);
        prev.set(
          "tokenCoinMinimalDenom",
          token.token.currency.coinMinimalDenom
        );
        prev.set("isTokenDetailModalOpen", "true");
        return prev;
      });
    };

    const [delayedIsOpen, setDelayedIsOpen] = useState(isOpen);

    const copyAddress = useCopyAddress(mainToken);

    useEffect(() => {
      if (isOpen && bottomTagType) {
        setTimeout(() => {
          setDelayedIsOpen(isOpen);
        }, 300);
      } else {
        setDelayedIsOpen(isOpen);
      }
    }, [isOpen, bottomTagType]);

    if (tokens.length === 1) {
      return (
        <TokenItem
          viewToken={{ ...tokens[0], isFetching: false }}
          onClick={() => {
            if (onClick) onClick();
            openTokenDetail(tokens[0]);
          }}
          disabled={disabled}
          bottomTagType={bottomTagType}
          earnedAssetPrice={earnedAssetPrice}
          showPrice24HChange={showPrice24HChange}
          copyAddress={copyAddress}
        />
      );
    }

    return (
      <div>
        <WrapperwithBottomTag
          bottomTagType={bottomTagType}
          earnedAssetPrice={effectiveEarnedAssetPrice}
          hideBottomTag={isOpen && !!bottomTagType}
        >
          <TokenGroupHeader
            disabled={disabled}
            isOpen={isOpen}
            onClick={handleClick}
            mainToken={mainToken}
            tokens={tokens}
            uniqueChainIds={uniqueChainIds}
            coinDenom={coinDenom}
            price24HChange={price24HChange}
            totalBalance={totalBalance}
            totalPrice={totalPrice}
          />
        </WrapperwithBottomTag>

        <VerticalCollapseTransition collapsed={!delayedIsOpen}>
          <Styles.ChildrenContainer>
            {tokens.map((token, index) => (
              <Box
                key={`${token.chainInfo.chainId}-${token.token.currency.coinMinimalDenom}`}
                marginTop={"0.375rem"}
                marginBottom={
                  alwaysOpen && index === tokens.length - 1 ? "1rem" : "none"
                }
              >
                <NestedTokenItem
                  viewToken={{ ...token }}
                  onClick={() => {
                    if (onTokenClick) onTokenClick(token);
                    else openTokenDetail(token);
                  }}
                />
              </Box>
            ))}

            {isOpen && bottomTagType && (
              <Box marginTop="0.375rem">
                <StandaloneEarnBox
                  bottomTagType={bottomTagType}
                  earnedAssetPrice={effectiveEarnedAssetPrice}
                />
              </Box>
            )}
          </Styles.ChildrenContainer>
        </VerticalCollapseTransition>
      </div>
    );
  }
);

const StackIcon: FunctionComponent<IconProps> = () => {
  return (
    <div
      style={{
        width: "1rem",
        height: "1rem",
        position: "absolute",
        top: "1.6875rem",
        left: "0.1875rem",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="13"
        viewBox="0 0 26 13"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M21.2859 8.02551C18.9217 9.6137 16.0699 10.5413 12.9999 10.5413C9.92962 10.5413 7.07773 9.61358 4.71338 8.02521C6.47131 10.7178 9.52586 12.4993 12.9998 12.4993C16.4735 12.4993 19.528 10.7179 21.2859 8.02551Z"
          fill="#353539"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M26.0001 0.499672C22.9245 4.23865 18.2432 6.62598 13 6.62598C7.757 6.62598 3.07589 4.23886 0.000244141 0.500161C1.91748 5.78461 7.01411 9.56302 13.0001 9.56302C18.9863 9.56302 24.083 5.78437 26.0001 0.499672Z"
          fill="#424247"
        />
      </svg>
    </div>
  );
};

const ArrowIcon: FunctionComponent<IconProps> = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M7.05288 5.21786C7.53331 4.60016 8.46689 4.60016 8.94732 5.21786L12.0938 9.26327C12.7068 10.0515 12.1451 11.2 11.1465 11.2L4.85366 11.2C3.85509 11.2 3.29338 10.0515 3.90644 9.26327L7.05288 5.21786Z"
        fill="#72747B"
      />
    </svg>
  );
};

const Styles = {
  Container: styled.div<{
    disabled?: boolean;
    isOpen: boolean;
  }>`
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette.white
        : ColorPalette["gray-650"]};
    padding: 0.875rem 1rem;
    border-radius: 0.375rem;
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
    box-shadow: ${(props) =>
      props.theme.mode === "light"
        ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
        : "none"};
    position: relative;

    &:hover {
      background-color: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-10"]
          : ColorPalette["gray-600"]};
    }
  `,
  ChainIconsContainer: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: -0.09375rem;
  `,
  ChainIcon: styled.div<{ zIndex: number }>`
    width: 1.1875rem;
    height: 1.1875rem;
    border-radius: 50%;
    overflow: hidden;
    margin-right: -0.25rem;
    border: 1px solid
      ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette.white
          : ColorPalette["gray-650"]};
    z-index: ${(props) => props.zIndex};
    border: ${(props) =>
      `0.09375rem solid ${
        props.theme.mode === "light"
          ? ColorPalette.white
          : ColorPalette["gray-650"]
      }`};
    margin-left: ${(props) => (props.zIndex !== 0 ? "-0.25rem" : "0")};
    margin-top: -0.09375rem;
    margin-bottom: -0.09375rem;
  `,
  TokenOverlay: styled.div`
    position: absolute;
    bottom: -0.25rem;
    right: -0.25rem;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background-color: ${ColorPalette["gray-700"]};
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.2);
  `,
  TokenImageWrapper: styled.div`
    position: relative;
    width: 2rem;
    height: 2rem;
  `,
  ExpandIcon: styled.div<{ isOpen: boolean }>`
    transition: transform 0.2s ease-in-out;
    transform: ${(props) => (props.isOpen ? "rotate(0deg)" : "rotate(180deg)")};
    height: 1rem;
    margin-left: 0.125rem;
  `,
  ChildrenContainer: styled.div`
    background-color: transparent;
  `,
  TransparentTokenItem: styled.div`
    > div {
      background-color: transparent !important;
      box-shadow: none !important;

      &:hover {
        background-color: ${(props) =>
          props.theme.mode === "light"
            ? ColorPalette["gray-10"]
            : ColorPalette["gray-650"]} !important;
      }
    }
  `,
  PlusChainBadge: styled(Caption1)`
    display: flex;
    height: 1.1875rem;
    padding: 0rem 0.375rem 0rem 0.25rem;
    justify-content: center;
    align-items: center;
    color: ${ColorPalette["gray-100"]};
    margin: -0.09375rem -0.25rem -0.09375rem -0.25rem;
    background-color: ${ColorPalette["gray-450"]};
    border-radius: 1.25rem;
    border: 0.09375rem solid
      ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-10"]
          : ColorPalette["gray-650"]};
    z-index: 999;
    font-size: 0.6875rem;
    font-style: normal;
    font-weight: 400;
  `,
};

const StyledEarningsBox = styled.div`
  display: flex;
  height: 40px;
  padding: 6px 0px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  align-self: stretch;
  border-radius: 6px;
  background: ${({ theme }) =>
    theme.mode === "light"
      ? ColorPalette["green-100"]
      : Color(ColorPalette["green-600"]).alpha(0.2).toString()};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) =>
      theme.mode === "light"
        ? Color(ColorPalette["green-200"]).alpha(0.5).toString()
        : Color(ColorPalette["green-600"]).alpha(0.15).toString()};
  }
`;
