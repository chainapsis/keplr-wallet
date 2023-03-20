import React, { FunctionComponent, useState } from "react";
import { Column, Columns } from "../../../../components/column";
import { Button } from "../../../../components/button";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse";
import { Body2, Subtitle2 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { ViewToken } from "../../index";
import styled from "styled-components";
import { ArrowDownIcon, ArrowUpIcon } from "../../../../components/icon";

const Styles = {
  Container: styled.div`
    background-color: ${ColorPalette["gray-600"]};
    padding: 0.75rem 1rem 0 1rem;
    border-radius: 0.375rem;
  `,
};

export const ClaimAll: FunctionComponent<{ viewTokens: ViewToken[] }> = ({
  viewTokens,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Styles.Container>
      <Columns sum={1} alignY="center">
        <Column weight={1}>
          <Stack gutter="0.5rem">
            <Body2 style={{ color: ColorPalette["gray-300"] }}>
              Pending Staking Reward
            </Body2>
            <Subtitle2 style={{ color: ColorPalette["gray-10"] }}>
              $ 1.50
            </Subtitle2>
          </Stack>
        </Column>
        <Button text="Claim All" />
      </Columns>

      <Box
        paddingX="0.125rem"
        alignX="center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ArrowDownIcon width="1.25rem" height="1.25rem" />
        ) : (
          <ArrowUpIcon width="1.25rem" height="1.25rem" />
        )}
      </Box>

      <VerticalCollapseTransition collapsed={isExpanded}>
        {viewTokens.map((viewToken) => {
          return (
            <Columns
              sum={1}
              key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
            >
              {viewToken.token.currency.coinImageUrl && (
                <img
                  width="32px"
                  height="32px"
                  src={viewToken.token.currency.coinImageUrl}
                />
              )}
              <Column weight={1}>
                <Stack>
                  <Box>{viewToken.token.currency.coinDenom}</Box>
                  <Box>{viewToken.token.hideDenom(true).toString()}</Box>
                </Stack>
              </Column>

              <Button text="Claim" />
            </Columns>
          );
        })}
      </VerticalCollapseTransition>
    </Styles.Container>
  );
};
