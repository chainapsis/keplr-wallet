import React, { FunctionComponent, useEffect } from "react";
import { useHistory } from "react-router";
import { Button, Alert } from "reactstrap";

import style from "./style.module.scss";
import { EmptyLayout } from "../../../layouts/empty-layout";
import { FormattedMessage } from "react-intl";
import { useInteractionInfo } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";

export const ChainSuggestedPage: FunctionComponent = observer(() => {
  const { chainSuggestStore, analyticsStore } = useStore();
  const history = useHistory();

  const interactionInfo = useInteractionInfo(() => {
    chainSuggestStore.rejectAll();
  });

  useEffect(() => {
    if (chainSuggestStore.waitingSuggestedChainInfo) {
      analyticsStore.logEvent("Chain suggested", {
        chainId: chainSuggestStore.waitingSuggestedChainInfo.data.chainId,
        chainName: chainSuggestStore.waitingSuggestedChainInfo.data.chainName,
        rpc: chainSuggestStore.waitingSuggestedChainInfo.data.rpc,
        rest: chainSuggestStore.waitingSuggestedChainInfo.data.rest,
      });
    }
  }, [analyticsStore, chainSuggestStore.waitingSuggestedChainInfo]);

  return (
    <EmptyLayout style={{ height: "100%", paddingTop: "80px" }}>
      <div className={style.container}>
        <img
          src={require("../../../public/assets/temp-icon.svg")}
          alt="logo"
          style={{ height: "92px" }}
        />
        <h1 className={style.header}>
          <FormattedMessage id="chain.suggested.title" />
        </h1>
        <p className={style.paragraph}>
          <FormattedMessage
            id="chain.suggested.paragraph"
            values={{
              host: chainSuggestStore.waitingSuggestedChainInfo?.data.origin,
              chainId:
                chainSuggestStore.waitingSuggestedChainInfo?.data.chainId,
              // eslint-disable-next-line react/display-name
              b: (...chunks: any) => <b>{chunks}</b>,
            }}
          />
        </p>
        <div style={{ flex: 1 }} />
        <Alert className={style.warning} color="warning">
          <div className={style.imgContainer}>
            <img
              src={require("../../../public/assets/img/icons8-test-tube.svg")}
              alt="experiment"
            />
          </div>
          <div className={style.content}>
            <div className={style.title}>
              <FormattedMessage id="chain.suggested.waring.experiment.title" />
            </div>
            <div>
              <FormattedMessage id="chain.suggested.waring.experiment.paragraph" />
            </div>
          </div>
        </Alert>
        <div className={style.buttons}>
          <Button
            className={style.button}
            color="danger"
            outline
            disabled={!chainSuggestStore.waitingSuggestedChainInfo}
            data-loading={chainSuggestStore.isLoading}
            onClick={async (e) => {
              e.preventDefault();

              await chainSuggestStore.reject();

              if (
                interactionInfo.interaction &&
                !interactionInfo.interactionInternal
              ) {
                window.close();
              } else {
                history.push("/");
              }
            }}
          >
            <FormattedMessage id="chain.suggested.button.reject" />
          </Button>
          <Button
            className={style.button}
            color="primary"
            disabled={!chainSuggestStore.waitingSuggestedChainInfo}
            data-loading={chainSuggestStore.isLoading}
            onClick={async (e) => {
              e.preventDefault();

              await chainSuggestStore.approve();

              if (
                interactionInfo.interaction &&
                !interactionInfo.interactionInternal
              ) {
                window.close();
              } else {
                history.push("/");
              }
            }}
          >
            <FormattedMessage id="chain.suggested.button.approve" />
          </Button>
        </div>
      </div>
    </EmptyLayout>
  );
});
