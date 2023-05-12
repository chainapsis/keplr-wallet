import React, { FunctionComponent } from "react";
import { CollapsibleList } from "../../components/collapsible-list";
import { MainEmptyView, TokenItem, TokenTitleView } from "./components";
import { Dec } from "@keplr-wallet/unit";
import { ViewToken } from "./index";
import { observer } from "mobx-react-lite";
import { Stack } from "../../components/stack";
import { useStore } from "../../stores";
import { TextButton } from "../../components/button-text";
import { ArrowRightSolidIcon } from "../../components/icon";
import { ColorPalette } from "../../styles";

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
                  disabled={!!viewToken.chainInfo.walletUrlForStaking}
                  onClick={() => {
                    if (viewToken.chainInfo.walletUrlForStaking) {
                      browser.tabs.create({
                        url: viewToken.chainInfo.walletUrlForStaking,
                      });
                    }
                  }}
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
              src={require("../../public/assets/img/main-empty-staking.png")}
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
            <TextButton
              text="Go to Dashboard"
              size="small"
              right={
                <ArrowRightSolidIcon
                  width="1.125rem"
                  height="1.125rem"
                  color={ColorPalette["gray-10"]}
                />
              }
            />
          }
        />
      ) : null}
    </React.Fragment>
  );
});
