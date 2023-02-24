import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";

export const MainPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore } = useStore();

  return (
    <div>
      {chainStore.chainInfosInUI.map((chainInfo) => {
        return (
          <div key={chainInfo.chainId}>
            <div>{chainInfo.chainId}</div>
            {chainInfo.currencies.map((currency) => {
              const account = accountStore.getAccount(chainInfo.chainId);

              const queries = queriesStore.get(chainInfo.chainId);

              return (
                <div key={currency.coinMinimalDenom}>
                  {queries.queryBalances
                    .getQueryBech32Address(account.bech32Address)
                    .getBalanceFromCurrency(currency)
                    .toString()}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
});
