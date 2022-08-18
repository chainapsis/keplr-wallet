import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import style from "./style.module.scss";
import { Card, CardBody } from "reactstrap";
import { FormattedRelativeTime } from "react-intl";
import { Hash } from "@keplr-wallet/crypto";
import styleVestingInfo from "./vesting-info.module.scss";

export const VestingInfo: FunctionComponent = observer(() => {
  const { chainStore, queriesStore, accountStore } = useStore();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const spendableBalances = queries.cosmos.querySpendableBalances.getQueryBech32Address(
    accountInfo.bech32Address
  );

  const relativeTime = (() => {
    if (!spendableBalances.response) {
      return 0;
    }

    const res = spendableBalances.response.timestamp - new Date().getTime();
    if (Math.abs(res) <= 1000) {
      return -1;
    }
    return Math.round(res / 1000);
  })();

  const [backgroundColors] = useState([
    "#5e72e4",
    "#11cdef",
    "#2dce89",
    "#fb6340",
  ]);

  return (
    <Card className={style.card}>
      <CardBody>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            marginBottom: "8px",
          }}
        >
          <h3 style={{ marginBottom: "0" }}>Spendable Amount</h3>
          {spendableBalances.isFetching ? (
            <div
              style={{
                marginLeft: "2px",
              }}
            >
              <i className="fa fa-spinner fa-spin fa-fw" />
            </div>
          ) : null}
          <div style={{ flex: 1 }} />
          {relativeTime < 0 ? (
            <div>
              <FormattedRelativeTime
                value={relativeTime}
                style="narrow"
                updateIntervalInSeconds={1}
              />
            </div>
          ) : null}
        </div>
        {spendableBalances.balances.map((balance) => {
          // TODO: Make `TokenView` Component...

          const name = balance.currency.coinDenom.toUpperCase();
          const minimalDenom = balance.currency.coinMinimalDenom;
          let amount = balance.trim(true).shrink(true);

          const backgroundColor = (() => {
            const hash = Hash.sha256(Buffer.from(minimalDenom));
            if (hash.length > 0) {
              return backgroundColors[hash[0] % backgroundColors.length];
            } else {
              return backgroundColors[0];
            }
          })();

          // If the currency is the IBC Currency.
          // Show the amount as slightly different with other currencies.
          // Show the actual coin denom to the top and just show the coin denom without channel info to the bottom.
          if (
            "originCurrency" in amount.currency &&
            amount.currency.originCurrency
          ) {
            amount = amount.setCurrency(amount.currency.originCurrency);
          }

          return (
            <div
              className={styleVestingInfo.tokenContainer}
              key={balance.currency.coinMinimalDenom}
            >
              <div className={styleVestingInfo.icon}>
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
                    fontSize: "16px",
                  }}
                >
                  {name.length > 0 ? name[0] : "?"}
                </div>
              </div>
              <div className={styleVestingInfo.innerContainer}>
                <div className={styleVestingInfo.content}>
                  <div className={styleVestingInfo.name}>{name}</div>
                  <div className={styleVestingInfo.amount}>
                    {amount.maxDecimals(6).toString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
});
