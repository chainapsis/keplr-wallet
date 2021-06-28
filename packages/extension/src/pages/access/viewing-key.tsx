import React, { FunctionComponent, useEffect, useMemo } from "react";

import { useInteractionInfo } from "@keplr-wallet/hooks";
import { Button } from "reactstrap";

import { ChainIdHelper } from "@keplr-wallet/cosmos";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";

import style from "./style.module.scss";
import { EmptyLayout } from "../../layouts/empty-layout";
import { FormattedMessage } from "react-intl";

export const Secret20ViewingKeyAccessPage: FunctionComponent = observer(() => {
  const { chainStore, permissionStore } = useStore();

  const waitingPermission =
    permissionStore.waitingSecret20ViewingKeyAccessPermissions.length > 0
      ? permissionStore.waitingSecret20ViewingKeyAccessPermissions[0]
      : undefined;

  const ineractionInfo = useInteractionInfo(() => {
    permissionStore.rejectAll();
  });

  useEffect(() => {
    if (waitingPermission) {
      // XXX: You can only one chain id per the request.
      //      This limit exists on the background service.
      chainStore.selectChain(waitingPermission.data.chainIds[0]);
    }
  }, [chainStore, waitingPermission]);

  const host = useMemo(() => {
    if (waitingPermission) {
      return waitingPermission.data.origins
        .map((origin) => {
          return new URL(origin).host;
        })
        .join(",");
    } else {
      return "";
    }
  }, [waitingPermission]);

  return (
    <EmptyLayout style={{ height: "100%", paddingTop: "80px" }}>
      <div className={style.container}>
        <img
          src={require("../../public/assets/temp-icon.svg")}
          alt="logo"
          style={{ height: "92px" }}
        />
        <h1 className={style.header}>
          <FormattedMessage id="access.viewing-key.title" />
        </h1>
        <p className={style.paragraph}>
          <FormattedMessage
            id="access.viewing-key.paragraph"
            values={{
              host,
              contractAddress: waitingPermission
                ? waitingPermission.data.contractAddress
                : "loading...",
              // eslint-disable-next-line react/display-name
              b: (...chunks: any) => <b>{chunks}</b>,
            }}
          />
        </p>
        <div className={style.permission}>
          <FormattedMessage id="access.viewing-key.permission.title" />
        </div>
        <ul>
          <li>
            <FormattedMessage id="access.viewing-key.permission.secret" />
          </li>
        </ul>
        <div style={{ flex: 1 }} />
        <div className={style.buttons}>
          <Button
            className={style.button}
            color="danger"
            outline
            onClick={async (e) => {
              e.preventDefault();

              if (waitingPermission) {
                await permissionStore.reject(waitingPermission.id);
                if (
                  permissionStore.waitingSecret20ViewingKeyAccessPermissions
                    .length === 0
                ) {
                  if (
                    ineractionInfo.interaction &&
                    !ineractionInfo.interactionInternal
                  ) {
                    window.close();
                  }
                }
              }
            }}
            data-loading={permissionStore.isLoading}
          >
            <FormattedMessage id="access.viewing-key.button.reject" />
          </Button>
          <Button
            className={style.button}
            color="primary"
            onClick={async (e) => {
              e.preventDefault();

              if (waitingPermission) {
                await permissionStore.approve(waitingPermission.id);
                if (
                  permissionStore.waitingSecret20ViewingKeyAccessPermissions
                    .length === 0
                ) {
                  if (
                    ineractionInfo.interaction &&
                    !ineractionInfo.interactionInternal
                  ) {
                    window.close();
                  }
                }
              }
            }}
            disabled={
              !waitingPermission ||
              ChainIdHelper.parse(chainStore.current.chainId).identifier !==
                ChainIdHelper.parse(waitingPermission.data.chainIds[0])
                  .identifier
            }
            data-loading={permissionStore.isLoading}
          >
            <FormattedMessage id="access.viewing-key.button.approve" />
          </Button>
        </div>
      </div>
    </EmptyLayout>
  );
});
