import React, { FunctionComponent } from "react";
import { Button } from "reactstrap";
import { useStore } from "../../stores";

import styleTransfer from "./evmos-dashboard.module.scss";
import classnames from "classnames";
import { observer } from "mobx-react-lite";
import { FormattedMessage } from "react-intl";

export const EvmosDashboardView: FunctionComponent = observer(() => {
  const { chainStore, analyticsStore } = useStore();

  return (
    <div className={styleTransfer["containerInner"]}>
      <div className={styleTransfer["vertical"]}>
        <p
          className={classnames(
            "h2",
            "my-0",
            "font-weight-normal",
            styleTransfer["paragraphMain"]
          )}
        >
          <FormattedMessage id="main.evmos.dashboard.title" />
        </p>
        <p
          className={classnames(
            "h4",
            "my-0",
            "font-weight-normal",
            styleTransfer["paragraphSub"]
          )}
        >
          <FormattedMessage id="main.evmos.dashboard.paragraph" />
        </p>
      </div>
      <div style={{ flex: 1 }} />
      <a
        href="https://app.evmos.org"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          analyticsStore.logEvent("Evmos dashboard opened", {
            chainId: chainStore.current.chainId,
            chainName: chainStore.current.chainName,
          });
        }}
      >
        <Button className={styleTransfer["button"]} color="primary" size="sm">
          <FormattedMessage id="main.evmos.dashboard.button" />
        </Button>
      </a>
    </div>
  );
});
