import React, { FunctionComponent } from "react";
import { CoinPretty } from "@keplr-wallet/unit";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";
import { useStore } from "../../../../stores";
import { Column, Columns } from "../../../../components/column";
import { observer } from "mobx-react-lite";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse";

export interface TokenViewProps {
  title: string;
  tokens: CoinPretty[];
}

export const TokenItem: FunctionComponent<{ token: CoinPretty }> = observer(
  ({ token }) => {
    const { priceStore } = useStore();

    return (
      <Columns sum={1}>
        {token.currency.coinImageUrl && (
          <img src={token.currency.coinImageUrl} />
        )}
        <Column weight={1}>
          <Stack>
            <Box>{token.currency.coinDenom}</Box>
          </Stack>
        </Column>

        <Stack>
          <Box>{token.hideDenom(true).toString()}</Box>
          <Box>
            {parseFloat(
              priceStore.calculatePrice(token)?.toDec().toString() ?? "0"
            )}
          </Box>
        </Stack>
      </Columns>
    );
  }
);

export const TokenView: FunctionComponent<TokenViewProps> = ({
  title,
  tokens,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const alwaysShownTokens = tokens.slice(0, 2);
  const collapsedTokens = tokens.slice(2);

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
        {alwaysShownTokens.map((token) => (
          <TokenItem token={token} key={token.currency.coinMinimalDenom} />
        ))}
        <VerticalCollapseTransition collapsed={isExpanded}>
          {collapsedTokens.map((token) => (
            <TokenItem token={token} key={token.currency.coinMinimalDenom} />
          ))}
        </VerticalCollapseTransition>
      </Stack>
    </Stack>
  );
};
