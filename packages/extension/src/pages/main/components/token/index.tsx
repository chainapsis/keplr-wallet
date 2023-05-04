import React, { FunctionComponent, useMemo } from "react";
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
import { ArrowRightIcon, QuestionIcon } from "../../../../components/icon";
import styled from "styled-components";
import { useNavigate } from "react-router";
import { ChainImageFallback } from "../../../../components/image";
import { Tooltip } from "../../../../components/tooltip";
import { DenomHelper } from "@keplr-wallet/common";
import { Tag } from "../../../../components/tag";
import { XAxis } from "../../../../components/axis";
import { Gutter } from "../../../../components/gutter";

const Styles = {
  Container: styled.div<{ forChange: boolean | undefined }>`
    background-color: ${ColorPalette["gray-600"]};
    padding ${({ forChange }) =>
      forChange ? "0.875rem 0.25rem 0.875rem 1rem" : "1rem 0.875rem"};
    border-radius: 0.375rem;
    cursor: pointer;
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

export const TokenItem: FunctionComponent<{
  viewToken: ViewToken;
  forChange?: boolean;
}> = observer(({ viewToken, forChange }) => {
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
      onClick={(e) => {
        e.preventDefault();

        if (forChange) {
          navigate("/send/select-asset");
        } else {
          navigate(
            `/send?chainId=${viewToken.chainInfo.chainId}&coinMinimalDenom=${viewToken.token.currency.coinMinimalDenom}`
          );
        }
      }}
    >
      <Columns sum={1} gutter="0.5rem" alignY="center">
        <ChainImageFallback
          style={{
            width: "2.5rem",
            height: "2.5rem",
          }}
          src={viewToken.token.currency.coinImageUrl}
          alt={viewToken.token.currency.coinDenom}
        />
        <Stack gutter="0.25rem">
          <XAxis alignY="center">
            <Subtitle2>{coinDenom}</Subtitle2>
            {tag ? (
              <React.Fragment>
                <Gutter size="0.5rem" />
                <Box alignY="center" height="1px">
                  <Tag text={tag.text} tooltip={tag.tooltip} />
                </Box>
              </React.Fragment>
            ) : null}
          </XAxis>
          <Caption1 style={{ color: ColorPalette["gray-300"] }}>
            {isIBC
              ? `on ${viewToken.chainInfo.chainName}`
              : viewToken.chainInfo.chainName}
          </Caption1>
        </Stack>

        <Column weight={1} />

        <Columns sum={1} gutter="0.25rem" alignY="center">
          <Stack gutter="0.25rem" alignX="right">
            <Subtitle3>
              {viewToken.token
                .hideDenom(true)
                .maxDecimals(6)
                .inequalitySymbol(true)
                .shrink(true)
                .toString()}
            </Subtitle3>
            <Subtitle3 style={{ color: ColorPalette["gray-300"] }}>
              {pricePretty
                ? pricePretty.inequalitySymbol(true).toString()
                : "-"}
            </Subtitle3>
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
});
