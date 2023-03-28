import React, { FunctionComponent, useState } from "react";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";
import { useStore } from "../../../../stores";
import { Column, Columns } from "../../../../components/column";
import { observer } from "mobx-react-lite";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse";
import { ViewToken } from "../../index";
import {
  Body2,
  Caption1,
  Subtitle2,
  Subtitle4,
} from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  QuestionIcon,
} from "../../../../components/icon";
import styled from "styled-components";
import { useNavigate } from "react-router";

const Styles = {
  Container: styled.div`
    background-color: ${ColorPalette["gray-600"]};
    padding: 1rem;
    border-radius: 0.375rem;
    cursor: pointer;
  `,
};
export const TokenItem: FunctionComponent<{ viewToken: ViewToken }> = observer(
  ({ viewToken }) => {
    const { priceStore } = useStore();

    const navigate = useNavigate();

    return (
      <Styles.Container
        onClick={(e) => {
          e.preventDefault();

          navigate(
            `/send?chainId=${viewToken.chainInfo.chainId}&coinMinimalDenom=${viewToken.token.currency.coinMinimalDenom}`
          );
        }}
      >
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

export const TokenView: FunctionComponent<{
  title: string;
  viewTokens: ViewToken[];
}> = ({ title, viewTokens }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const alwaysShownTokens = viewTokens.slice(0, 2);
  const collapsedTokens = viewTokens.slice(2);

  return (
    <Stack>
      <Box
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
        cursor="pointer"
      >
        <Columns sum={1} alignY="center">
          <Subtitle4 style={{ color: ColorPalette["gray-200"] }}>
            {title}
          </Subtitle4>
          <Box paddingLeft="0.375rem" paddingY="0.5rem">
            <QuestionIcon
              width="1rem"
              height="1rem"
              color={ColorPalette["gray-300"]}
            />
          </Box>

          <Column weight={1} />

          <Subtitle4 style={{ color: ColorPalette["gray-300"] }}>
            {viewTokens.length}
          </Subtitle4>
          <Box paddingLeft="0.25rem">
            {isExpanded ? (
              <ArrowDownIcon
                width="1rem"
                height="1rem"
                color={ColorPalette["gray-300"]}
              />
            ) : (
              <ArrowUpIcon
                width="1rem"
                height="1rem"
                color={ColorPalette["gray-300"]}
              />
            )}
          </Box>
        </Columns>
      </Box>

      <Stack gutter="0.5rem">
        {alwaysShownTokens.map((viewToken) => (
          <TokenItem
            viewToken={viewToken}
            key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
          />
        ))}
      </Stack>

      <Box marginTop="0.5rem">
        <VerticalCollapseTransition collapsed={isExpanded}>
          <Stack gutter="0.5rem">
            {collapsedTokens.map((viewToken) => (
              <TokenItem
                viewToken={viewToken}
                key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
              />
            ))}
          </Stack>
        </VerticalCollapseTransition>
      </Box>
    </Stack>
  );
};
