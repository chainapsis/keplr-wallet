import React, { FunctionComponent, useEffect, useState } from "react";

import { AccountView } from "./account";
import { TxButtonView } from "./tx-button";

import style from "./style.module.scss";
import styleAsset from "./asset.module.scss";

import { observer } from "mobx-react";
import { useStore } from "../../../stores";

import { getAccount } from "../../../utils/rest";
import { defaultBech32Config } from "@everett-protocol/cosmosjs/core/bech32Config";

export const AccountInfo: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  const [asset, setAsset] = useState("0");

  useEffect(() => {
    getAccount(
      chainStore.chainInfo.rpc,
      defaultBech32Config(chainStore.chainInfo.bech32AddrPrefix),
      chainStore.bech32Address
    )
      .then(account => {
        const coins = account.getCoins();
        if (coins.length > 0) {
          setAsset(coins[0].amount.toString());
        }
      })
      .catch(() => {
        setAsset("0");
      });
  }, [
    chainStore.chainInfo,
    chainStore.chainInfo.bech32AddrPrefix,
    chainStore.bech32Address
  ]);

  return (
    <div className={style.container}>
      <div className={styleAsset.containerAsset}>
        <div className={styleAsset.containerSymbol}>
          <img
            className={styleAsset.symbol}
            src={require("assets/atom-icon.png")}
          />
        </div>
        <div className={styleAsset.amount}>
          {asset} {chainStore.chainInfo.coinDenom}
        </div>
      </div>
      <AccountView />
      <TxButtonView />
    </div>
  );
});
