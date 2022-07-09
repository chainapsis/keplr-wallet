import React, { FunctionComponent } from "react";
import { Button } from "reactstrap";
import { useNavigate } from "react-router";

import styleTransfer from "./ibc-transfer.module.scss";
import classnames from "classnames";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Dec } from "@keplr-wallet/unit";
import { FormattedMessage } from "react-intl";

export const IBCTransferView: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const { accountStore, chainStore, queriesStore } = useStore();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);
  const queryBalances = queries.queryBalances.getQueryBech32Address(
    accountInfo.bech32Address
  );

  const hasAssets =
    queryBalances.balances.find((bal) => bal.balance.toDec().gt(new Dec(0))) !==
    undefined;

  return (
    <div className={styleTransfer.containerInner}>
      <div className={styleTransfer.vertical}>
        <p
          className={classnames(
            "h2",
            "my-0",
            "font-weight-normal",
            styleTransfer.paragraphMain
          )}
        >
          <FormattedMessage id="main.ibc.transfer.title" />
        </p>
        <p
          className={classnames(
            "h4",
            "my-0",
            "font-weight-normal",
            styleTransfer.paragraphSub
          )}
        >
          <FormattedMessage id="main.ibc.transfer.paragraph" />
        </p>
      </div>
      <div style={{ flex: 1 }} />
      <Button
        className={styleTransfer.button}
        color="primary"
        size="sm"
        disabled={!hasAssets}
        data-loading={accountInfo.isSendingMsg === "ibcTransfer"}
        onClick={(e) => {
          e.preventDefault();

          navigate("/ibc-transfer");
        }}
      >
        <FormattedMessage id="main.ibc.transfer.button" />
      </Button>
    </div>
  );
});
