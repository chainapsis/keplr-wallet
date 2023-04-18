import React, { FunctionComponent } from "react";
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

export const TokenTitleView: FunctionComponent<{ title: string }> = ({
  title,
}) => {
  return (
    <Columns sum={1} alignY="center">
      <Subtitle4 style={{ color: ColorPalette["gray-200"] }}>{title}</Subtitle4>
      <Box paddingLeft="0.375rem" paddingY="0.5rem">
        <QuestionIcon
          width="1rem"
          height="1rem"
          color={ColorPalette["gray-300"]}
        />
      </Box>
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
            width: "2rem",
            height: "2rem",
          }}
          src={viewToken.token.currency.coinImageUrl}
          alt={viewToken.token.currency.coinDenom}
        />
        <Stack gutter="0.25rem">
          <Subtitle2>{viewToken.token.currency.coinDenom}</Subtitle2>
          <Caption1 style={{ color: ColorPalette["gray-300"] }}>
            {viewToken.chainInfo.chainName}
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
