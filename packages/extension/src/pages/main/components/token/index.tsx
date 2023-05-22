import React, {
  FunctionComponent,
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
import styled, { css } from "styled-components";
import { ChainImageFallback } from "../../../../components/image";
import { Tooltip } from "../../../../components/tooltip";
import { DenomHelper } from "@keplr-wallet/common";
import { Tag } from "../../../../components/tag";
import { XAxis } from "../../../../components/axis";
import { Gutter } from "../../../../components/gutter";
import Color from "color";
import { Skeleton } from "../../../../components/skeleton";
import { WrongViewingKeyError } from "@keplr-wallet/stores";
import { useNavigate } from "react-router";
import { Secret20Currency } from "@keplr-wallet/types";

const Styles = {
  Container: styled.div<{
    forChange: boolean | undefined;
    isError: boolean;
    disabled?: boolean;
  }>`
    background-color: ${ColorPalette["gray-600"]};
    padding ${({ forChange }) =>
      forChange ? "0.875rem 0.25rem 0.875rem 1rem" : "1rem 0.875rem"};
    border-radius: 0.375rem;
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
    
    border: ${({ isError }) =>
      isError
        ? `1.5px solid ${Color(ColorPalette["yellow-400"])
            .alpha(0.5)
            .toString()}`
        : undefined};
    
    ${({ disabled }) => {
      if (!disabled) {
        return css`
          &:hover {
            background-color: ${ColorPalette["gray-550"]};
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
}> = ({ title, tooltip }) => {
  return (
    <Columns sum={1} alignY="center">
      <Subtitle4 style={{ color: ColorPalette["gray-200"] }}>{title}</Subtitle4>
      {tooltip ? (
        <Box marginLeft="0.25rem">
          <Tooltip content={tooltip}>
            <QuestionIcon
              width="1rem"
              height="1rem"
              color={ColorPalette["gray-300"]}
            />
          </Tooltip>
        </Box>
      ) : null}
    </Columns>
  );
};

interface TokenItemProps {
  viewToken: ViewToken;
  onClick?: () => void;
  disabled?: boolean;
  forChange?: boolean;
  isNotReady?: boolean;

  // For remaining unbonding time.
  altSentence?: string | React.ReactElement;
}

export const TokenItem: FunctionComponent<TokenItemProps> = observer(
  ({ viewToken, onClick, disabled, forChange, isNotReady, altSentence }) => {
    const { priceStore } = useStore();
    const navigate = useNavigate();

    const pricePretty = priceStore.calculatePrice(viewToken.token);

    const isIBC = useMemo(() => {
      return viewToken.token.currency.coinMinimalDenom.startsWith("ibc/");
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
            return currency.coinDenom.slice(start + 1, end);
          })(),
        };
      }
      if (denomHelper.type !== "native") {
        return {
          text: denomHelper.type,
        };
      }
    }, [viewToken.token.currency]);

    return (
      <Styles.Container
        forChange={forChange}
        isError={viewToken.error != null}
        disabled={disabled}
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
            <ChainImageFallback
              style={{
                width: "2rem",
                height: "2rem",
              }}
              src={viewToken.token.currency.coinImageUrl}
              alt={viewToken.token.currency.coinDenom}
            />
          </Skeleton>

          <Gutter size="0.75rem" />

          <Stack gutter="0.25rem">
            <XAxis alignY="center">
              <Skeleton
                layer={1}
                isNotReady={isNotReady}
                dummyMinWidth="3.25rem"
              >
                <Subtitle2>{coinDenom}</Subtitle2>
              </Skeleton>

              {tag ? (
                <React.Fragment>
                  <Gutter size="0.25rem" />
                  <Box alignY="center" height="1px">
                    <Tag text={tag.text} tooltip={tag.tooltip} />
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
                  <Tooltip content={viewToken.error.message}>
                    <ErrorIcon size="1rem" />
                  </Tooltip>
                </Box>
              ) : undefined}
            </XAxis>
            <Skeleton layer={1} isNotReady={isNotReady} dummyMinWidth="4.5rem">
              <Caption1 style={{ color: ColorPalette["gray-300"] }}>
                {isIBC
                  ? `on ${viewToken.chainInfo.chainName}`
                  : viewToken.chainInfo.chainName}
              </Caption1>
            </Skeleton>
          </Stack>

          <Column weight={1} />

          <Columns sum={1} gutter="0.25rem" alignY="center">
            <Stack gutter="0.25rem" alignX="right">
              <Skeleton
                layer={1}
                isNotReady={isNotReady}
                dummyMinWidth="3.25rem"
              >
                <Subtitle3>
                  {viewToken.token
                    .hideDenom(true)
                    .maxDecimals(6)
                    .inequalitySymbol(true)
                    .shrink(true)
                    .toString()}
                </Subtitle3>
              </Skeleton>
              <Skeleton
                layer={1}
                isNotReady={isNotReady}
                dummyMinWidth="4.5rem"
              >
                {viewToken.error?.data &&
                viewToken.error.data instanceof WrongViewingKeyError ? (
                  <Box position="relative" alignX="right">
                    <Subtitle3
                      color={ColorPalette["gray-100"]}
                      style={{
                        textDecoration: "underline",
                        position: "absolute",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Set your viewing key
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
                      if (altSentence) {
                        return altSentence;
                      }

                      return pricePretty
                        ? pricePretty.inequalitySymbol(true).toString()
                        : "-";
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
        </Columns>
      </Styles.Container>
    );
  }
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

const DelayedLoadingRender: FunctionComponent<{
  isFetching: boolean;
}> = ({ isFetching, children }) => {
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
