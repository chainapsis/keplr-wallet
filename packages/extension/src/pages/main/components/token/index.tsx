import React, { FunctionComponent, useState } from "react";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";
import { useStore } from "../../../../stores";
import { Column, Columns } from "../../../../components/column";
import { observer } from "mobx-react-lite";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse";
import { ViewToken } from "../../index";

export const TokenItem: FunctionComponent<{ viewToken: ViewToken }> = observer(
  ({ viewToken }) => {
    const { priceStore } = useStore();

    return (
      <Columns sum={1}>
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
            <Box>{viewToken.chainName}</Box>
          </Stack>
        </Column>

        <Stack>
          <Box>{viewToken.token.hideDenom(true).toString()}</Box>
          <Box>
            {parseFloat(
              priceStore.calculatePrice(viewToken.token)?.toDec().toString() ??
                "0"
            )}
          </Box>
        </Stack>
      </Columns>
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
      >
        <b>{title}</b>
      </Box>

      <Stack gutter="1rem">
        {alwaysShownTokens.map((viewToken) => (
          <TokenItem
            viewToken={viewToken}
            key={viewToken.token.currency.coinMinimalDenom}
          />
        ))}
        <VerticalCollapseTransition collapsed={isExpanded}>
          {collapsedTokens.map((viewToken) => (
            <TokenItem
              viewToken={viewToken}
              key={viewToken.token.currency.coinMinimalDenom}
            />
          ))}
        </VerticalCollapseTransition>
      </Stack>
    </Stack>
  );
};
