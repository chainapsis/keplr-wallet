import React, { FunctionComponent } from "react";
import { CollapsibleList } from "../../components/collapsible-list";
import { TokenItem, TokenTitleView } from "./components";
import { Dec } from "@keplr-wallet/unit";
import { ViewToken } from "./index";
import { observer } from "mobx-react-lite";
import { MainQueryState } from "./query";

export const AvailableTabView: FunctionComponent<{
  queryState: MainQueryState;
}> = observer(({ queryState }) => {
  const stakableBalances: ViewToken[] = queryState.stakables.sort((a, b) => {
    // Move zeros to last
    const aIsZero = a.token.toDec().lte(new Dec(0));
    const bIsZero = b.token.toDec().lte(new Dec(0));

    if (aIsZero && bIsZero) {
      return 0;
    }
    if (aIsZero) {
      return 1;
    }
    if (bIsZero) {
      return -1;
    }

    return 0;
  });

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
    </React.Fragment>
  );
});
