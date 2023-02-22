import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import { useStore } from "../../stores";
import style from "./style.module.scss";
import classnames from "classnames";
import { useHistory } from "react-router";
import { HeaderLayout } from "../../layouts";
import { Input } from "reactstrap";

export const SelectAssetPage: FunctionComponent = observer(() => {
  const { accountStore, chainStore, queriesStore } = useStore();

  const history = useHistory();

  const chainBalances = chainStore.chainInfos
    .map((chainInfo) => {
      const accountInfo = accountStore.getAccount(chainInfo.chainId);
      const queries = queriesStore.get(chainInfo.chainId);

      const balances = queries.queryBalances.getQueryBech32Address(
        accountInfo.bech32Address
      ).positiveBalances;

      return balances;
    })
    .reduce(
      (accumulator, currentValue) => accumulator.concat(currentValue),
      []
    );

  const [search, setSearch] = useState("");

  const filteredBalances = chainBalances.filter((balance) => {
    return balance.currency.coinDenom.toLocaleLowerCase().includes(search);
  });

  return (
    <HeaderLayout
      showChainName={false}
      alternativeTitle={"Select Asset"}
      canChangeChainInfo={false}
      style={{ height: "auto", minHeight: "100%" }}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <div className={style.container}>
        <div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value.toLowerCase().trim())}
          />
        </div>
        <div className={style.coinContainer}>
          {filteredBalances.map((balance) => {
            return (
              <div
                key={`${balance.chainId}-${balance.currency.coinDenom}`}
                className={classnames(
                  style.coinItem,
                  style.cursorPointer,
                  style.padding16
                )}
                onClick={() => {
                  chainStore.selectChain(balance.chainId);
                  history.push(`/new-send/${JSON.stringify(balance.currency)}`);
                }}
              >
                <div className={style.flexColumn}>
                  <div>{balance.currency.coinDenom}</div>
                  <div>{balance.balance.toDec().toString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </HeaderLayout>
  );
});
