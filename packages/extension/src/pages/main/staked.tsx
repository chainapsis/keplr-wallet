import React, { FunctionComponent } from "react";
import { CollapsibleList } from "../../components/collapsible-list";
import { MainEmptyView, TokenItem, TokenTitleView } from "./components";
import { Dec } from "@keplr-wallet/unit";
import { ViewToken } from "./index";
import { observer } from "mobx-react-lite";
import { MainQueryState } from "./query";
import { Stack } from "../../components/stack";
import { Button } from "../../components/button";

export const StakedTabView: FunctionComponent<{
  queryState: MainQueryState;
}> = observer(({ queryState }) => {
  const delegations: ViewToken[] = queryState.delegations.filter((token) => {
    return token.token.toDec().gt(new Dec(0));
  });

  const unbondings: ViewToken[] = queryState.unbondings.filter((token) => {
    return token.token.toDec().gt(new Dec(0));
  });

  const TokenViewData: {
    title: string;
    balance: ViewToken[];
    lenAlwaysShown: number;
  }[] = [
    { title: "Staked Balance", balance: delegations, lenAlwaysShown: 5 },
    { title: "Unstaking Balance", balance: unbondings, lenAlwaysShown: 3 },
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

      {delegations.length === 0 && unbondings.length === 0 ? (
        <MainEmptyView
          image={
            <img
              src={require("../../public/assets/img/empty-staking.png")}
              alt="empty staking image"
            />
          }
          title="Ready to Start Staking?"
          paragraph="Stake your assets to earn rewards and contribute to maintaining the networks!"
          button={
            <Button text="Go to Dashboard" color="primary" size="small" />
          }
        />
      ) : null}
    </React.Fragment>
  );
});
