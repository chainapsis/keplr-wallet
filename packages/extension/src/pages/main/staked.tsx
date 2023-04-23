import React, { FunctionComponent } from "react";
import { CollapsibleList } from "../../components/collapsible-list";
import { MainEmptyView, TokenItem, TokenTitleView } from "./components";
import { Dec } from "@keplr-wallet/unit";
import { ViewToken } from "./index";
import { observer } from "mobx-react-lite";
import { Stack } from "../../components/stack";
import { Button } from "../../components/button";
import { useStore } from "../../stores";

export const StakedTabView: FunctionComponent = observer(() => {
  const { hugeQueriesStore } = useStore();

  const delegations: ViewToken[] = hugeQueriesStore.delegations.filter(
    (token) => {
      return token.token.toDec().gt(new Dec(0));
    }
  );

  const unbondings: ViewToken[] = hugeQueriesStore.unbondings.filter(
    (token) => {
      return token.token.toDec().gt(new Dec(0));
    }
  );

  const TokenViewData: {
    title: string;
    balance: ViewToken[];
    lenAlwaysShown: number;
    tooltip?: string | React.ReactElement;
  }[] = [
    { title: "Staked Balance", balance: delegations, lenAlwaysShown: 5 },
    { title: "Unstaking Balance", balance: unbondings, lenAlwaysShown: 3 },
  ];

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

      {delegations.length === 0 && unbondings.length === 0 ? (
        <MainEmptyView
          image={
            <img
              src={require("../../public/assets/img/empty-staking.png")}
              style={{
                width: "6.25rem",
                height: "6.25rem",
              }}
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
