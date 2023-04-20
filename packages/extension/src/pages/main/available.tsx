import React, { FunctionComponent } from "react";
import { CollapsibleList } from "../../components/collapsible-list";
import { MainEmptyView, TokenItem, TokenTitleView } from "./components";
import { Dec } from "@keplr-wallet/unit";
import { ViewToken } from "./index";
import { observer } from "mobx-react-lite";
import { MainQueryState } from "./query";
import { Stack } from "../../components/stack";
import { Button } from "../../components/button";

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
    tooltip?: string | React.ReactElement;
  }[] = [
    {
      title: "Balance",
      balance: stakableBalances,
      lenAlwaysShown: 5,
      tooltip: "TODO: Lorem ipsum dolor sit amet",
    },
    {
      title: "Token Balance",
      balance: tokenBalances,
      lenAlwaysShown: 3,
      tooltip: "TODO: Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    },
    {
      title: "IBC Balance",
      balance: ibcBalances,
      lenAlwaysShown: 3,
      tooltip:
        "TODO: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
  ];

  const countFilter = (viewToken: ViewToken) =>
    viewToken.token.toDec().gt(new Dec(0));

  const isFisrtTime =
    stakableBalances.filter(countFilter).length === 0 &&
    tokenBalances.filter(countFilter).length === 0 &&
    ibcBalances.filter(countFilter).length === 0;

  return (
    <React.Fragment>
      <Stack gutter="0.5rem">
        {TokenViewData.map(({ title, balance, lenAlwaysShown, tooltip }) => {
          if (balance.length === 0) {
            return null;
          }

          return (
            <CollapsibleList
              key={title}
              title={<TokenTitleView title={title} tooltip={tooltip} />}
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

      {isFisrtTime ? (
        <MainEmptyView
          image={
            <img
              src={require("../../public/assets/img/empty-balance.png")}
              alt="empty balance image"
            />
          }
          paragraph="Gear up yourself by topping up your wallet! "
          title="Ready to Explore the Interchain?"
          button={<Button text="Get Started" color="primary" size="small" />}
        />
      ) : null}
    </React.Fragment>
  );
});
