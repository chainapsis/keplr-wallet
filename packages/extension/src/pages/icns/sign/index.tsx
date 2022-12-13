import React, { FunctionComponent, useLayoutEffect } from "react";
import { observer } from "mobx-react-lite";
import { Button } from "reactstrap";
import { useStore } from "../../../stores";
import { EmptyLayout } from "../../../layouts/empty-layout";
import style from "./style.module.scss";
import { Bech32Address } from "@keplr-wallet/cosmos";

export const ICNSAdr36SignPage: FunctionComponent = observer(() => {
  useLayoutEffect(() => {
    // XXX: Temporal solution for fitting the popup window.
    //      Even though this is noy proper way to adjust style,
    //      it is safe because this page only can be open on popup.
    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";
    const app = document.getElementById("app");
    if (app) {
      app.style.height = "100%";
    }
  }, []);

  const { icnsInteractionStore } = useStore();

  return (
    <EmptyLayout style={{ height: "100%" }}>
      <div className={style.container}>
        <div style={{ flex: 1, overflow: "scroll", borderRadius: "14px" }}>
          {icnsInteractionStore.waitingData?.data.accountInfos.map(
            (accountInfo, i) => {
              return (
                <div key={i} className={style.nameContainer}>
                  <div
                    className={style.name}
                  >{`${icnsInteractionStore.waitingData?.data.username}.${accountInfo.bech32Prefix}`}</div>
                  <div className={style.address}>
                    {Bech32Address.shortenAddress(
                      accountInfo.bech32Address,
                      30
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
        <div className={style.buttons}>
          <Button
            className={style.button}
            color="danger"
            outline={true}
            block={true}
            onClick={(e) => {
              e.preventDefault();

              if (icnsInteractionStore.waitingData) {
                icnsInteractionStore.reject(
                  icnsInteractionStore.waitingData.id
                );
              }

              window.close();
            }}
          >
            Reject
          </Button>
          <Button
            className={style.button}
            color="primary"
            block={true}
            disabled={!icnsInteractionStore.waitingData}
            onClick={(e) => {
              e.preventDefault();

              if (icnsInteractionStore.waitingData) {
                icnsInteractionStore.approve(
                  icnsInteractionStore.waitingData.id
                );
              }

              window.close();
            }}
          >
            Approve
          </Button>
        </div>
      </div>
    </EmptyLayout>
  );
});
