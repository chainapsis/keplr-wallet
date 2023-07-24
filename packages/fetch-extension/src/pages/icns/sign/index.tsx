import React, { FunctionComponent, useEffect, useLayoutEffect } from "react";
import { observer } from "mobx-react-lite";
import { Button } from "reactstrap";
import { useStore } from "../../../stores";
import { EmptyLayout } from "@layouts/empty-layout";
import style from "./style.module.scss";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { useIntl } from "react-intl";

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

  const intl = useIntl();

  const { icnsInteractionStore } = useStore();

  useEffect(() => {
    // Execute the clean-up function when closing window.
    const beforeunload = async () => {
      icnsInteractionStore.rejectAll();
    };

    addEventListener("beforeunload", beforeunload);
    return () => {
      removeEventListener("beforeunload", beforeunload);
    };
  }, [icnsInteractionStore]);

  return (
    <EmptyLayout style={{ height: "100%" }}>
      <div className={style["container"]}>
        <img
          src={require("../../../public/assets/icns-logo.png")}
          className={style["logo"]}
        />
        <h1 className={style["title"]}>
          {intl.formatMessage({
            id: "sign.icns.registration.title",
          })}
        </h1>
        <div className={style["namesContainer"]}>
          {icnsInteractionStore.waitingData?.data.accountInfos.map(
            (accountInfo, i) => {
              return (
                <div key={i} className={style["nameContainer"]}>
                  <div
                    className={style["name"]}
                  >{`${icnsInteractionStore.waitingData?.data.username}.${accountInfo.bech32Prefix}`}</div>
                  <div className={style["address"]}>
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
        <div className={style["buttons"]}>
          <Button
            className={style["button"]}
            color="danger"
            outline={true}
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
            {intl.formatMessage({
              id: "sign.button.reject",
            })}
          </Button>
          <Button
            className={style["button"]}
            color="primary"
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
            {intl.formatMessage({
              id: "sign.button.approve",
            })}
          </Button>
        </div>
      </div>
    </EmptyLayout>
  );
});
