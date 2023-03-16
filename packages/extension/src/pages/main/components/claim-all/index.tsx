import React, { FunctionComponent, useState } from "react";
import { Column, Columns } from "../../../../components/column";
import { Button } from "../../../../components/button";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";
import { CoinPretty } from "@keplr-wallet/unit";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse";

export const ClaimAll: FunctionComponent<{ tokens: CoinPretty[] }> = ({
  tokens,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Box paddingX="0.5rem">
      <Columns sum={1} alignY="center">
        <Column weight={1}>
          <Stack>
            <Box>Pending Staking Reward</Box>
            <Box>$ 1.50</Box>
          </Stack>
        </Column>
        <Button text="Claim All" />
      </Columns>

      <Button text="claim tokens" onClick={() => setIsExpanded(!isExpanded)} />

      <VerticalCollapseTransition collapsed={isExpanded}>
        {tokens.map((token) => {
          return (
            <Columns sum={1} key={token.currency.coinMinimalDenom}>
              {token.currency.coinImageUrl && (
                <img
                  width="32px"
                  height="32px"
                  src={token.currency.coinImageUrl}
                />
              )}
              <Column weight={1}>
                <Stack>
                  <Box>{token.currency.coinDenom}</Box>
                  <Box>{token.hideDenom(true).toString()}</Box>
                </Stack>
              </Column>

              <Button text="Claim" />
            </Columns>
          );
        })}
      </VerticalCollapseTransition>
    </Box>
  );
};
