import React, { FunctionComponent, useState } from "react";
import { Column, Columns } from "../../../../components/column";
import { Button } from "../../../../components/button";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse";
import { Body2, Subtitle2, Subtitle3 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { ViewToken } from "../../index";
import styled from "styled-components";
import { ArrowDownIcon, ArrowUpIcon } from "../../../../components/icon";

const Styles = {
  Container: styled.div`
    background-color: ${ColorPalette["gray-600"]};
    padding: 0.75rem 0 0 0;
    border-radius: 0.375rem;
  `,
  ExpandButton: styled(Box)`
    :hover {
      background-color: ${ColorPalette["gray-500"]};
      opacity: 0.5;
    }

    :active {
      background-color: ${ColorPalette["gray-500"]};
      opacity: 0.2;
    }
  `,
};

export const ClaimAll: FunctionComponent<{ viewTokens: ViewToken[] }> = ({
  viewTokens,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Styles.Container>
      <Box paddingX="1rem">
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
          <Button text="Claim All" size="small" />
        </Columns>
      </Box>

      <Styles.ExpandButton
        paddingX="0.125rem"
        alignX="center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ArrowDownIcon width="1.25rem" height="1.25rem" />
        ) : (
          <ArrowUpIcon width="1.25rem" height="1.25rem" />
        )}
      </Styles.ExpandButton>

      <VerticalCollapseTransition collapsed={isExpanded}>
        {viewTokens.map((viewToken) => {
          return (
            <ClaimTokenItem
              viewToken={viewToken}
              key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
            />
          );
        })}
      </VerticalCollapseTransition>
    </Styles.Container>
  );
};

const ClaimTokenItem: FunctionComponent<{ viewToken: ViewToken }> = ({
  viewToken,
}) => {
  return (
    <Box paddingY="0.5rem">
      <Columns sum={1} gutter="0.75rem" alignY="center">
        {viewToken.token.currency.coinImageUrl && (
          <img
            width="32px"
            height="32px"
            src={viewToken.token.currency.coinImageUrl}
          />
        )}
        <Column weight={1}>
          <Stack gutter="0.375rem">
            <Subtitle3 style={{ color: ColorPalette["gray-300"] }}>
              {viewToken.token.currency.coinDenom}
            </Subtitle3>
            <Subtitle2 style={{ color: ColorPalette["gray-10"] }}>
              {viewToken.token.hideDenom(true).toString()}
            </Subtitle2>
          </Stack>
        </Column>

        <Button text="Claim" size="small" color="secondary" />
      </Columns>
    </Box>
  );
};
