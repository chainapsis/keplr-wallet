import React from "react";
import { FunctionComponent } from "react";
import style from "../fns-view/style.module.scss";
import classnames from "classnames";
import { FormattedMessage } from "react-intl";
import { Button } from "reactstrap";
import { useNavigate } from "react-router";
import { useStore } from "../../stores";
import { extractNumberFromBalance } from "@utils/axl-bridge-utils";

export const AXLView: FunctionComponent = () => {
  const navigate = useNavigate();
  const { chainStore, analyticsStore, queriesStore, accountStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const query = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(accountInfo.bech32Address);
  const queryBalances = query.balances;
  const queryBalance = queryBalances[0];
  const balance = extractNumberFromBalance(
    queryBalance?.balance.trim(true).maxDecimals(18).toString()
  );
  const isEvm = chainStore.current.features?.includes("evm") ?? false;
  return (
    <div className={style["containerInner"]}>
      <div className={style["vertical"]}>
        <p
          className={classnames(
            "h2",
            "my-0",
            "font-weight-normal",
            style["paragraphMain"]
          )}
        >
          <FormattedMessage id="main.axl.title" />
        </p>
        <p
          className={classnames(
            "h4",
            "my-0",
            "font-weight-normal",
            style["paragraphSub"]
          )}
        >
          <FormattedMessage id="main.axl.paragraph" />
        </p>
      </div>
      <div style={{ flex: 1 }} />

      <Button
        className={style["button"]}
        color="primary"
        size="sm"
        disabled={!balance}
        onClick={() => {
          analyticsStore.logEvent("axl_transfer_click", {
            chainId: chainStore.current.chainId,
            chainName: chainStore.current.chainName,
          });
          isEvm ? navigate("/axl-bridge-evm") : navigate("/axl-bridge-cosmos");
        }}
      >
        <FormattedMessage id="main.axl.button" />
      </Button>
    </div>
  );
};
