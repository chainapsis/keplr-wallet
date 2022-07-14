import React, { FunctionComponent, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "reactstrap";

import style from "./style.module.scss";
import { EmptyLayout } from "../../../layouts/empty-layout";
import { FormattedMessage } from "react-intl";
import { useInteractionInfo } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { AlertExperimentalFeature } from "../../../components/alert-experimental-feature";

export const ChainSuggestedPage: FunctionComponent = observer(() => {
  const { chainSuggestStore, analyticsStore } = useStore();
  const navigate = useNavigate();

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
          src={require("../../../public/assets/logo-256.png")}
          alt="logo"
          style={{ width: "92px", height: "92px", margin: "0 auto" }}
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
        <AlertExperimentalFeature />
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
                navigate("/");
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
                navigate("/");
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
