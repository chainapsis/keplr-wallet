import React, { FunctionComponent } from "react";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";
import { useStore } from "../../../../stores";
import { Column, Columns } from "../../../../components/column";
import { observer } from "mobx-react-lite";
import { ViewToken } from "../../index";
import {
  Body2,
  Caption1,
  Subtitle2,
  Subtitle4,
} from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { QuestionIcon } from "../../../../components/icon";
import styled from "styled-components";

const Styles = {
  Container: styled.div`
    background-color: ${ColorPalette["gray-600"]};
    padding: 1rem;
    border-radius: 0.375rem;
    cursor: pointer;
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

export const TokenItem: FunctionComponent<{ viewToken: ViewToken }> = observer(
  ({ viewToken }) => {
    const { priceStore } = useStore();

    return (
      <Styles.Container>
        <Columns sum={1} gutter="0.5rem" alignY="center">
          {viewToken.token.currency.coinImageUrl && (
            <img
              width="36px"
              height="36px"
              src={viewToken.token.currency.coinImageUrl}
            />
          )}
          <Stack gutter="0.25rem">
            <Subtitle2>{viewToken.token.currency.coinDenom}</Subtitle2>
            <Caption1 style={{ color: ColorPalette["gray-300"] }}>
              {viewToken.chainInfo.chainName}
            </Caption1>
          </Stack>

          <Column weight={1} />

          <Stack gutter="0.25rem" alignX="right">
            <Body2>{viewToken.token.hideDenom(true).toString()}</Body2>
            <Body2 style={{ color: ColorPalette["gray-300"] }}>
              {parseFloat(
                priceStore
                  .calculatePrice(viewToken.token)
                  ?.toDec()
                  .toString() ?? "0"
              )}
            </Body2>
          </Stack>
        </Columns>
      </Styles.Container>
    );
  }
);
