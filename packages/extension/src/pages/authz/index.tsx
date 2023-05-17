import React, { FunctionComponent, useCallback, useEffect } from "react";
import { HeaderLayout } from "../../layouts";
import { useHistory } from "react-router";
import { AuthZ } from "@keplr-wallet/stores";
import style from "./style.module.scss";
import classNames from "classnames";
import { FormattedDate, FormattedMessage, useIntl } from "react-intl";
import { useNotification } from "@components/notification";
import { useStore } from "../../stores";
import { Buffer } from "buffer/";

export const AuthZPage: FunctionComponent = () => {
  const { chainStore, accountStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);

  const intl = useIntl();
  const notification = useNotification();
  const history = useHistory();
  const grant: AuthZ.Grant = JSON.parse(
    Buffer.from(
      new URLSearchParams(history.location.search).get("grant") ?? "",
      "base64"
    ).toString()
  );

  useEffect(() => {
    // Scroll to top on page mounted.
    if (window.scrollTo) {
      window.scrollTo(0, 0);
    }
  }, []);

  const copyAddress = useCallback(
    async (address: string) => {
      await navigator.clipboard.writeText(address);
      notification.push({
        placement: "top-center",
        type: "success",
        duration: 2,
        content: intl.formatMessage({
          id: "main.address.copied",
        }),
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    },
    [notification, intl]
  );

  const onClickRevokeButton = async (grant: AuthZ.Grant) => {
    let messageType: string = "";

    if (
      grant.authorization["@type"] === "/cosmos.bank.v1beta1.SendAuthorization"
    ) {
      messageType = "/cosmos.bank.v1beta1.MsgSend";
    }

    if (
      grant.authorization["@type"] ===
      "/cosmos.staking.v1beta1.StakeAuthorization"
    ) {
      if (
        (grant.authorization as AuthZ.StakeAuthorization).authorization_type ===
        "AUTHORIZATION_TYPE_DELEGATE"
      ) {
        messageType = "/cosmos.staking.v1beta1.MsgDelegate";
      }

      if (
        (grant.authorization as AuthZ.StakeAuthorization).authorization_type ===
        "AUTHORIZATION_TYPE_REDELEGATE"
      ) {
        messageType = "/cosmos.staking.v1beta1.MsgBeginRedelegate";
      }

      if (
        (grant.authorization as AuthZ.StakeAuthorization).authorization_type ===
        "AUTHORIZATION_TYPE_UNDELEGATE"
      ) {
        messageType = "/cosmos.staking.v1beta1.MsgUndelegate";
      }
    }

    if (
      grant.authorization["@type"] ===
      "/cosmos.authz.v1beta1.GenericAuthorization"
    ) {
      messageType = (grant.authorization as AuthZ.GenericAuthorization).msg;
    }

    const tx = account.cosmos.makeRevokeMsg(grant.grantee, messageType);

    try {
      let gas = 120000;

      // Gas adjustment is 1.5
      // Since there is currently no convenient way to adjust the gas adjustment on the UI,
      // Use high gas adjustment to prevent failure.
      try {
        gas = (await tx.simulate()).gasUsed * 1.5;
      } catch (e) {
        console.log(e);
        return;
      }

      await tx.send(
        { amount: [], gas: gas.toString() },
        "",
        {},
        {
          onBroadcasted: (txHash) => {
            console.log(txHash);
          },
        }
      );
      history.replace("/");
    } catch (e) {
      if (e.message === "Request rejected") {
        if (history.location.pathname === "/authz") {
          return;
        }
      }

      history.replace("/");
      notification.push({
        type: "warning",
        placement: "top-center",
        duration: 5,
        content: `Fail to revoke authorization: ${e.message}`,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    }
  };

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      smallTitle={true}
      alternativeTitle={
        new URLSearchParams(history.location.search).get("title") ?? ""
      }
      onBackButton={useCallback(() => {
        history.goBack();
      }, [history])}
      innerStyle={{ background: "#FAFBFD" }}
    >
      <div className={style.container}>
        <div className={style.item}>
          <div className={style.title}>
            <FormattedMessage id="main.authz.grant.grantee.address" />
          </div>
          <div
            className={classNames(style.content, style.clickable)}
            onClick={() => copyAddress(grant.grantee)}
          >
            {grant.grantee}
            <svg
              width="24"
              height="24"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 2H4C2.89543 2 2 2.89543 2 4V8"
                stroke="#95A1B4"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <rect
                x="4.25"
                y="4.25"
                width="5.5"
                height="5.5"
                rx="1.25"
                stroke="#95A1B4"
                strokeWidth="1"
              />
            </svg>
          </div>
        </div>

        <div className={style.item}>
          <div className={style.title}>
            <FormattedMessage id="main.authz.grant.expiration.title" />
          </div>
          {grant.expiration ? (
            <div className={style.content}>
              {new Date() < new Date(grant.expiration) ? (
                <FormattedDate
                  value={grant.expiration}
                  year="numeric"
                  month="2-digit"
                  day="2-digit"
                  hour="2-digit"
                  minute="2-digit"
                  hour12={false}
                />
              ) : (
                <FormattedMessage id="main.authz.grant.expiration.expired" />
              )}
            </div>
          ) : (
            <div className={style.bold}>
              <FormattedMessage id="main.authz.grant.expiration.infinite" />
            </div>
          )}
        </div>
        <pre className={classNames(style.item, style.raw)}>
          {JSON.stringify(grant.authorization, undefined, 2)}
        </pre>

        <div style={{ flex: 1 }} />

        <button
          className={style.revoke}
          onClick={() => onClickRevokeButton(grant)}
        >
          <FormattedMessage id="main.authz.grant.revoke" />
        </button>
      </div>
    </HeaderLayout>
  );
};
