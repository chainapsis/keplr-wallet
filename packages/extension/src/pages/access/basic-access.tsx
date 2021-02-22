import React, { FunctionComponent, useEffect, useMemo } from "react";

import { useInteractionInfo } from "@keplr/hooks";
import { Button } from "reactstrap";

import { ChainIdHelper } from "@keplr/cosmos";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";

import style from "./style.module.scss";
import { EmptyLayout } from "../../layouts/empty-layout";
import { FormattedMessage } from "react-intl";

export const AccessPage: FunctionComponent = observer(() => {
  const { chainStore, permissionStore } = useStore();

  const waitingPermission =
    permissionStore.waitingBasicAccessPermissions.length > 0
      ? permissionStore.waitingBasicAccessPermissions[0]
      : undefined;

  const ineractionInfo = useInteractionInfo(() => {
    permissionStore.rejectAll();
  });

  const current = chainStore.current;

  const isSecretWasm = useMemo(() => {
    if (current.features) {
      return current.features.indexOf("secretwasm") >= 0;
    }
    return false;
  }, [current]);

  useEffect(() => {
    if (waitingPermission) {
      chainStore.selectChain(waitingPermission.data.chainId);
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
          <FormattedMessage id="access.title" />
        </h1>
        <p className={style.paragraph}>
          <FormattedMessage
            id="access.paragraph"
            values={{
              host,
              chainId: waitingPermission
                ? chainStore.getChain(waitingPermission.data.chainId).chainId
                : "loading...",
              // eslint-disable-next-line react/display-name
              b: (...chunks: any) => <b>{chunks}</b>,
            }}
          />
        </p>
        <div className={style.permission}>
          <FormattedMessage id="access.permission.title" />
        </div>
        <ul>
          <li>
            <FormattedMessage id="access.permission.account" />
          </li>
          <li>
            <FormattedMessage id="access.permission.tx-request" />
          </li>
          {isSecretWasm ? (
            <li>
              <FormattedMessage id="access.permission.secret" />
            </li>
          ) : null}
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
                  permissionStore.waitingBasicAccessPermissions.length === 0
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
            <FormattedMessage id="access.button.reject" />
          </Button>
          <Button
            className={style.button}
            color="primary"
            onClick={async (e) => {
              e.preventDefault();

              if (waitingPermission) {
                await permissionStore.approve(waitingPermission.id);
                if (
                  permissionStore.waitingBasicAccessPermissions.length === 0
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
                ChainIdHelper.parse(waitingPermission.data.chainId).identifier
            }
            data-loading={permissionStore.isLoading}
          >
            <FormattedMessage id="access.button.approve" />
          </Button>
        </div>
      </div>
    </EmptyLayout>
  );
});
