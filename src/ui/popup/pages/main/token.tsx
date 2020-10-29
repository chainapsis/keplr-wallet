import React, { FunctionComponent, useMemo, useState } from "react";

import styleToken from "./token.module.scss";
import { observer } from "mobx-react";
import { Coin } from "@chainapsis/cosmosjs/common/coin";
import { useStore } from "../../stores";
import { useHistory } from "react-router";
import { CoinUtils } from "../../../../common/coin-utils";
import { DecUtils } from "../../../../common/dec-utils";
import { Crypto } from "../../../../background/keyring/crypto";

const TokenView: FunctionComponent<{
  name: string;
  minimalDenom: string;
  amount: string;
  onClick: () => void;
}> = ({ name, minimalDenom, amount, onClick }) => {
  const [backgroundColors] = useState([
    "#5e72e4",
    "#11cdef",
    "#2dce89",
    "#fb6340"
  ]);

  const backgroundColor = useMemo(() => {
    const hash = Crypto.sha256(Buffer.from(minimalDenom));
    if (hash.length > 0) {
      return backgroundColors[hash[0] % backgroundColors.length];
    } else {
      return backgroundColors[0];
    }
  }, [backgroundColors, minimalDenom]);

  return (
    <div
      className={styleToken.tokenContainer}
      onClick={e => {
        e.preventDefault();

        onClick();
      }}
    >
      <div className={styleToken.icon}>
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "100000px",
            backgroundColor,

            display: "flex",
            justifyContent: "center",
            alignItems: "center",

            color: "#FFFFFF",
            fontSize: "16px"
          }}
        >
          {name.length > 0 ? name[0] : "?"}
        </div>
      </div>
      <div className={styleToken.innerContainer}>
        <div className={styleToken.content}>
          <div className={styleToken.name}>{name}</div>
          <div className={styleToken.amount}>{amount}</div>
        </div>
        <div className={styleToken.arrow}>
          <i className="fas fa-angle-right" />
        </div>
      </div>
    </div>
  );
};

export const TokensView: FunctionComponent<{
  tokens: Coin[];
}> = observer(({ tokens }) => {
  const { chainStore } = useStore();

  const history = useHistory();

  return (
    <div className={styleToken.tokensContainer}>
      <h1 className={styleToken.title}>Tokens</h1>
      {tokens.map((asset, i) => {
        const currencies = chainStore.chainInfo.currencies;

        const currency = currencies.find(cur => {
          return cur.coinMinimalDenom === asset.denom;
        });

        if (currency) {
          const name = currency.coinDenom.toUpperCase();
          const amount = DecUtils.trim(
            CoinUtils.shrinkDecimals(asset.amount, currency.coinDecimals, 0, 6)
          );

          return (
            <TokenView
              key={i.toString()}
              name={name}
              minimalDenom={currency.coinMinimalDenom}
              amount={`${amount} ${name}`}
              onClick={() => {
                history.push({
                  pathname: "/send",
                  search: `?defaultdenom=${currency.coinMinimalDenom}`
                });
              }}
            />
          );
        }
      })}
    </div>
  );
});
