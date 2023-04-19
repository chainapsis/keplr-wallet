import React, { FunctionComponent } from "react";
import { CollapsibleList } from "../../components/collapsible-list";
import { TokenItem, TokenTitleView } from "./components";
import { Dec } from "@keplr-wallet/unit";
import { ViewToken } from "./index";
import { observer } from "mobx-react-lite";
import { MainQueryState } from "./query";
import { Stack } from "../../components/stack";

export const AvailableTabView: FunctionComponent<{
  queryState: MainQueryState;
}> = observer(({ queryState }) => {
  const stakableBalances: ViewToken[] = queryState.stakables;

  const tokenBalances = queryState.notStakbles.filter((token) => {
    return token.token.toDec().gt(new Dec(0));
  });

  const ibcBalances = queryState.ibcTokens.filter((token) => {
    return token.token.toDec().gt(new Dec(0));
  });

  const TokenViewData: {
    title: string;
    balance: ViewToken[];
    lenAlwaysShown: number;
  }[] = [
    { title: "Balance", balance: stakableBalances, lenAlwaysShown: 5 },
    { title: "Token Balance", balance: tokenBalances, lenAlwaysShown: 3 },
    { title: "IBC Balance", balance: ibcBalances, lenAlwaysShown: 3 },
  ];

  return (
    <React.Fragment>
      <Stack gutter="0.5rem">
        {TokenViewData.map(({ title, balance, lenAlwaysShown }) => {
          if (balance.length === 0) {
            return null;
          }

          return (
            <CollapsibleList
              key={title}
              title={<TokenTitleView title={title} />}
              lenAlwaysShown={lenAlwaysShown}
              items={balance.map((viewToken) => (
                <TokenItem
                  viewToken={viewToken}
                  key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
                />
              ))}
            />
          );
        })}
      </Stack>
    </React.Fragment>
  );
});
