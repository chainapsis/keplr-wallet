import React, { FunctionComponent, useCallback } from "react";

import { HeaderLayout } from "../../../layouts/header-layout";

import { observer } from "mobx-react";
import { useStore } from "../../../stores";

import { useHistory } from "react-router";
import { Button } from "reactstrap";

import style from "./style.module.scss";
import { useLoadingIndicator } from "../../../../components/loading-indicator";

export const SetKeyRingPage: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();
  const history = useHistory();

  const loadingIndicator = useLoadingIndicator();

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle="Set Account"
      onBackButton={useCallback(() => {
        history.goBack();
      }, [history])}
    >
      <div className={style.container}>
        {keyRingStore.multiKeyStoreInfo.map((keyStore, i) => {
          return (
            <Button
              key={i.toString()}
              onClick={async e => {
                e.preventDefault();

                loadingIndicator.setIsLoading(true);
                try {
                  await keyRingStore.changeKeyRing(i);
                  await keyRingStore.save();
                  history.push("/");
                } finally {
                  loadingIndicator.setIsLoading(false);
                }
              }}
              disabled={keyStore.selected}
              block
            >
              {keyStore.meta?.name ? keyStore.meta.name : "Unnamed"}
            </Button>
          );
        })}
        <Button
          color="primary"
          block
          onClick={e => {
            e.preventDefault();

            browser.tabs.create({
              url: "/popup.html#/register?mode=add"
            });
          }}
        >
          Add Account
        </Button>
      </div>
    </HeaderLayout>
  );
});
