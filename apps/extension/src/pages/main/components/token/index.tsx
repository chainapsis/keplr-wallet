import React, {
  FunctionComponent,
  PropsWithChildren,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";
import { useStore } from "../../../../stores";
import { Column, Columns } from "../../../../components/column";
import { observer } from "mobx-react-lite";
import { ViewToken } from "../../index";
import {
  Caption1,
  Subtitle2,
  Subtitle3,
  Subtitle4,
} from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import {
  ArrowRightIcon,
  LoadingIcon,
  QuestionIcon,
} from "../../../../components/icon";
import styled, { css, useTheme } from "styled-components";
import { CurrencyImageFallback } from "../../../../components/image";
import { Tooltip } from "../../../../components/tooltip";
import { DenomHelper } from "@keplr-wallet/common";
import { XAxis } from "../../../../components/axis";
import { Gutter } from "../../../../components/gutter";
import Color from "color";
import { Skeleton } from "../../../../components/skeleton";
import { WrongViewingKeyError } from "@keplr-wallet/stores";
import { useNavigate } from "react-router";
import { Secret20Currency } from "@keplr-wallet/types";
import { FormattedMessage, useIntl } from "react-intl";
import { WrapperwithBottomTag } from "./wrapper-with-bottom-tag";
import { usePriceChange } from "../../../../hooks/use-price-change";
import { PriceChangeTag } from "./price-change-tag";
import { TokenTag } from "./token-tag";
import { CopyAddressButton } from "./copy-address-button";

const Styles = {
  Container: styled.div<{
    forChange: boolean | undefined;
    isError: boolean;
    disabled?: boolean;
    disableHoverStyle?: boolean;
    isNotReady?: boolean;
  }>`
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? props.isNotReady
          ? ColorPalette["skeleton-layer-0"]
          : ColorPalette.white
        : ColorPalette["gray-650"]};
    padding: ${({ forChange }) =>
      forChange ? "0.875rem 0.25rem 0.875rem 1rem" : "0.875rem 1rem"};
    border-radius: 0.375rem;
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};

    border: ${({ isError }) =>
      isError
        ? `1.5px solid ${Color(ColorPalette["yellow-400"])
            .alpha(0.5)
            .toString()}`
        : undefined};

    box-shadow: ${(props) =>
      props.theme.mode === "light" && !props.isNotReady
        ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
        : "none"};

    ${({ disabled, theme, disableHoverStyle }) => {
      if (!disableHoverStyle && !disabled) {
        return css`
          &:hover {
            background-color: ${theme.mode === "light"
              ? ColorPalette["gray-10"]
              : ColorPalette["gray-600"]};
          }
        `;
      }
    }}
  `,
  IconContainer: styled.div`
    color: ${ColorPalette["gray-300"]};
  `,
};

export const TokenTitleView: FunctionComponent<{
  title: string;
  tooltip?: string | React.ReactElement;

  right?: React.ReactElement;
}> = ({ title, tooltip, right }) => {
  const theme = useTheme();

  return (
    <Box
      style={{
        flex: 1,
      }}
    >
      <Columns sum={1} alignY="center">
        <Subtitle4
          style={{
            color:
              theme.mode === "light"
                ? ColorPalette["gray-500"]
                : ColorPalette["gray-200"],
          }}
        >
          {title}
        </Subtitle4>
        {tooltip ? (
          <Box marginLeft="0.25rem">
            <Tooltip content={tooltip}>
              <QuestionIcon
                width="1rem"
                height="1rem"
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-200"]
                    : ColorPalette["gray-300"]
                }
              />
            </Tooltip>
          </Box>
        ) : null}
        {right ? (
          <React.Fragment>
            <Column weight={1} />
            {right}
          </React.Fragment>
        ) : null}
      </Columns>
    </Box>
  );
};

export type BottomTagType = "nudgeEarn" | "showEarnSavings";

interface TokenItemProps {
  viewToken: ViewToken;
  onClick?: () => void;
  disabled?: boolean;
  forChange?: boolean;
  isNotReady?: boolean;

  // For remaining unbonding time.
  altSentence?: string | React.ReactElement;

  // If this prop is provided, the copied button will be shown.
  copyAddress?: string;

  // swap destination select 페이지에서 balance 숨기기 위한 옵션
  hideBalance?: boolean;
  showPrice24HChange?: boolean;
  disableHoverStyle?: boolean;
  right?: React.ReactElement;

  bottomTagType?: BottomTagType;
  earnedAssetPrice?: string;

  // If this prop is provided, the token tag will not be shown.
  noTokenTag?: boolean;

  // If this prop is provided, the token item will be shown with loading state.
  isLoading?: boolean;
}

export const TokenItem: FunctionComponent<TokenItemProps> = observer(
  ({
    viewToken,
    onClick,
    disabled,
    forChange,
    isNotReady,
    altSentence,
    copyAddress,
    hideBalance,
    showPrice24HChange,
    disableHoverStyle,
    right,
    bottomTagType,
    earnedAssetPrice,
    noTokenTag,
    isLoading,
  }) => {
    const { priceStore, uiConfigStore } = useStore();
    const navigate = useNavigate();
    const intl = useIntl();
    const theme = useTheme();

    const [isHover, setIsHover] = useState(false);

    const pricePretty = priceStore.calculatePrice(viewToken.token);

    const isIBC = useMemo(() => {
      return viewToken.token.currency.coinMinimalDenom.startsWith("ibc/");
    }, [viewToken.token.currency]);

    const tokenTag = useMemo(() => {
      if (noTokenTag) {
        return;
      }

      const currency = viewToken.token.currency;
      const denomHelper = new DenomHelper(currency.coinMinimalDenom);

      if (denomHelper.type === "native") {
        if (currency.coinMinimalDenom.startsWith("ibc/")) {
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

        if (viewToken.chainInfo.chainId.startsWith("bip122:")) {
          const paymentType = viewToken.chainInfo.chainId.split(":")[2] as
            | string
            | undefined;
          if (paymentType) {
            return {
              text: paymentType
                .split("-")
                .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                .join(" "),
            };
          }
        }
      } else {
        if (denomHelper.type === "erc20") {
          return undefined;
        }
        return {
          text: denomHelper.type.toUpperCase(),
        };
      }
    }, [noTokenTag, viewToken.token.currency, viewToken.chainInfo.chainId]);

    const price24HChange = usePriceChange(
      showPrice24HChange,
      viewToken.token.currency.coinGeckoId
    );

    const content = (
      <TokenItemContent
        viewToken={viewToken}
        forChange={forChange}
        isError={viewToken.error != null}
        disabled={disabled}
        isNotReady={isNotReady}
        disableHoverStyle={disableHoverStyle}
        isHover={isHover}
        setIsHover={setIsHover}
        onClick={onClick}
        hideBalance={hideBalance}
        altSentence={altSentence}
        copyAddress={copyAddress}
        right={right}
        theme={theme}
        intl={intl}
        uiConfigStore={uiConfigStore}
        navigate={navigate}
        isIBC={isIBC}
        pricePretty={pricePretty}
        price24HChange={price24HChange}
        tag={tokenTag}
        isLoading={isLoading}
      />
    );

    if (bottomTagType) {
      return (
        <WrapperwithBottomTag
          bottomTagType={bottomTagType as BottomTagType}
          earnedAssetPrice={earnedAssetPrice}
        >
          {content}
        </WrapperwithBottomTag>
      );
    }

    return content;
  }
);

interface TokenItemContentProps {
  viewToken: ViewToken;
  forChange?: boolean;
  isError: boolean;
  disabled?: boolean;
  isNotReady?: boolean;
  disableHoverStyle?: boolean;
  isHover: boolean;
  setIsHover: (isHover: boolean) => void;
  onClick?: () => void;
  hideBalance?: boolean;
  altSentence?: string | React.ReactElement;
  copyAddress?: string;
  right?: React.ReactElement;
  theme: any;
  intl: any;
  uiConfigStore: any;
  navigate: any;
  isIBC: boolean;
  pricePretty: any;
  price24HChange?: any;
  tag?: {
    text: string;
    tooltip?: string;
  };
  isLoading?: boolean;
}

const TokenItemContent: FunctionComponent<TokenItemContentProps> = ({
  viewToken,
  forChange,
  isError,
  disabled,
  isNotReady,
  disableHoverStyle,
  isHover,
  setIsHover,
  onClick,
  hideBalance,
  altSentence,
  copyAddress,
  right,
  theme,
  intl,
  uiConfigStore,
  navigate,
  isIBC,
  pricePretty,
  price24HChange,
  tag,
}) => (
  <Styles.Container
    forChange={forChange}
    isError={isError}
    disabled={disabled}
    isNotReady={isNotReady}
    disableHoverStyle={disableHoverStyle}
    onMouseEnter={() => {
      setIsHover(true);
    }}
    onMouseOver={() => {
      // onMouseOut에 대해서는 처리하지 않는다.
      // onMouseOver는 레이아웃에 변경에 의해서도 이벤트가 발생하기 때문에
      // 좀 디테일한 케이스를 처리하기 위해서 사용한다.
      // 근데 onMouseOut까지 하면 isHover 값이 여러가지 이유로 수시로 변해서...
      // 근데 hover out의 경우는 딱히 처리할 case가 보이지 않기 때문에
      // copy address가 별 중요한 기능은 아니기 때문에 문제를 해결하지 않고 그냥 생략한다.
      setIsHover(true);
    }}
    onMouseLeave={() => {
      setIsHover(false);
    }}
    onClick={async (e) => {
      e.preventDefault();

      if (
        viewToken.error?.data &&
        viewToken.error.data instanceof WrongViewingKeyError
      ) {
        navigate(
          `/setting/token/add?chainId=${
            viewToken.chainInfo.chainId
          }&contractAddress=${
            (viewToken.token.currency as Secret20Currency).contractAddress
          }`
        );

        return;
      }

      if (onClick) {
        onClick();
      }
    }}
  >
    <Columns sum={1} gutter="0.5rem" alignY="center">
      <Skeleton type="circle" layer={1} isNotReady={isNotReady}>
        <CurrencyImageFallback
          chainInfo={viewToken.chainInfo}
          currency={viewToken.token.currency}
          size="2rem"
        />
      </Skeleton>

      <Gutter size="0.75rem" />

      <Stack gutter="0.25rem">
        <XAxis alignY="center">
          <Skeleton layer={1} isNotReady={isNotReady} dummyMinWidth="3.25rem">
            <Subtitle2
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette["gray-10"]
              }
              style={{
                wordBreak: "break-all",
              }}
            >
              {viewToken.token
                .hideAmount(true)
                .hideIBCMetadata(true)
                .toString()}
            </Subtitle2>
          </Skeleton>

          {price24HChange ? (
            <React.Fragment>
              <Gutter size="0.25rem" />
              <Box alignY="center" height="1px">
                <PriceChangeTag rate={price24HChange} />
              </Box>
            </React.Fragment>
          ) : null}

          {viewToken.isFetching ? (
            // 처음에는 무조건 로딩이 발생하는데 일반적으로 쿼리는 100ms 정도면 끝난다.
            // 이정도면 유저가 별 문제를 느끼기 힘들기 때문에
            // 일괄적으로 로딩을 보여줄 필요가 없다.
            // 그러므로 로딩 상태가 500ms 이상 지속되면 로딩을 표시힌다.
            // 근데 또 문제가 있어서 추가 사항이 있는데 그건 DelayedLoadingRender의 주석을 참고
            <DelayedLoadingRender isFetching={viewToken.isFetching}>
              <Box
                marginLeft="0.25rem"
                style={{
                  color: ColorPalette["gray-300"],
                }}
              >
                <LoadingIcon width="1rem" height="1rem" />
              </Box>
            </DelayedLoadingRender>
          ) : viewToken.error ? (
            <Box
              marginLeft="0.25rem"
              style={{
                color: ColorPalette["yellow-400"],
              }}
            >
              <Tooltip
                content={(() => {
                  if (
                    viewToken.error?.message ===
                    "Wrong viewing key for this address or viewing key not set"
                  ) {
                    return intl.formatMessage({
                      id: "page.main.components.token.wrong-viewing-key-error",
                    });
                  }

                  return (
                    viewToken.error.message ||
                    "Failed to query response from endpoint. Check again in a few minutes."
                  );
                })()}
              >
                <ErrorIcon size="1rem" />
              </Tooltip>
            </Box>
          ) : undefined}
        </XAxis>
        <Box
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.25rem",
          }}
        >
          <Skeleton layer={1} isNotReady={isNotReady} dummyMinWidth="4.5rem">
            <Caption1 style={{ color: ColorPalette["gray-300"] }}>
              {isIBC
                ? `on ${viewToken.chainInfo.chainName}`
                : viewToken.chainInfo.chainName}
            </Caption1>
          </Skeleton>
          <XAxis>
            {tag ? (
              <Box alignY="center" key="token-tag">
                <TokenTag text={tag.text} tooltip={tag.tooltip} />
              </Box>
            ) : null}
            {!isNotReady && copyAddress ? (
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
          </XAxis>
        </Box>
      </Stack>

      <Column weight={1} />

      <Columns sum={1} gutter="0.25rem" alignY="center">
        <Stack gutter="0.25rem" alignX="right">
          {!hideBalance ? (
            <Skeleton layer={1} isNotReady={isNotReady} dummyMinWidth="3.25rem">
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
            </Skeleton>
          ) : null}
          <Skeleton layer={1} isNotReady={isNotReady} dummyMinWidth="4.5rem">
            {viewToken.error?.data &&
            viewToken.error.data instanceof WrongViewingKeyError ? (
              <Box position="relative" alignX="right">
                <Subtitle3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-200"]
                      : ColorPalette["gray-100"]
                  }
                  style={{
                    textDecoration: "underline",
                    position: "absolute",
                    whiteSpace: "nowrap",
                  }}
                >
                  <FormattedMessage id="page.main.components.token.set-your-viewing-key" />
                </Subtitle3>
                <Subtitle3
                  style={{
                    textDecoration: "underline",
                    whiteSpace: "nowrap",
                    opacity: 0,
                  }}
                >
                  &nbps;
                </Subtitle3>
              </Box>
            ) : (
              <Subtitle3 color={ColorPalette["gray-300"]}>
                {(() => {
                  // XXX: 이 부분에서 hide balance가 true더라도
                  //      isNotReady 상태에서 스켈레톤이 여전히 보이는 문제가 있긴한데...
                  //      어차피 이 prop을 쓰는 때는 한정되어있고 지금은 문제가 안되니 이 문제는 패스한다.
                  if (hideBalance) {
                    return "";
                  }

                  if (altSentence) {
                    return altSentence;
                  }

                  return uiConfigStore.hideStringIfPrivacyMode(
                    pricePretty
                      ? pricePretty.inequalitySymbol(true).toString()
                      : "-",
                    2
                  );
                })()}
              </Subtitle3>
            )}
          </Skeleton>
        </Stack>

        {forChange ? (
          <Styles.IconContainer>
            <ArrowRightIcon />
          </Styles.IconContainer>
        ) : null}
      </Columns>
      {right}
    </Columns>
  </Styles.Container>
);

const ErrorIcon: FunctionComponent<{
  size: string;
}> = ({ size }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  );
};

let initialOnLoad = false;
setTimeout(() => {
  initialOnLoad = true;
}, 1000);

const DelayedLoadingRender: FunctionComponent<
  PropsWithChildren<{
    isFetching: boolean;
  }>
> = ({ isFetching, children }) => {
  const [show, setShow] = useState(false);

  useLayoutEffect(() => {
    if (isFetching) {
      const id = setTimeout(
        () => {
          setShow(true);
        },
        // 유저가 토큰이 많은 경우에 locla state load하고 render하는데만 해도 500ms 가까이 걸리는 경우가 있다.
        // 이런 경우에는 이 컴포넌트의 목표를 달성하지 못한건데...
        // 일단 간단하게 그냥 처음에는 1초 기다리도록 처리한다...
        initialOnLoad ? 500 : 1000
      );

      return () => {
        clearTimeout(id);
      };
    } else {
      setShow(false);
    }
  }, [isFetching]);

  if (!show) {
    return null;
  }

  return <React.Fragment>{children}</React.Fragment>;
};
