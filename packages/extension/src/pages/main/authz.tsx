import React, { FunctionComponent, useMemo } from "react";
import styleAuthZ from "./authz.module.scss";
import classnames from "classnames";
import { FormattedDate, FormattedMessage } from "react-intl";
import styleStake from "./stake.module.scss";
import { Collapse } from "@components/collapse";
import { AuthZ } from "@keplr-wallet/stores";
import { useHistory } from "react-router";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { Buffer } from "buffer/";
import { ToolTip } from "@components/tooltip";

interface Props {
  grants: AuthZ.Grant[];
}

type grantListType = Record<string, AuthZ.Grant[]>;

export const AuthZView: FunctionComponent<Props> = (props) => {
  const { grants } = props;
  const history = useHistory();

  const grantList = useMemo(() => {
    const tempGrantList: grantListType = {
      Send: [],
      Delegate: [],
      Redelegate: [],
      Undelegate: [],
      "Withdraw Reward": [],
      Vote: [],
      Deposit: [],
      Custom: [],
    };

    const isSendAuthorization = (grant: AuthZ.Grant) =>
      grant.authorization["@type"] === "/cosmos.bank.v1beta1.SendAuthorization";

    const isGenericAuthorization = (grant: AuthZ.Grant) =>
      grant.authorization["@type"] ===
      "/cosmos.authz.v1beta1.GenericAuthorization";

    const isStakeAuthorization = (grant: AuthZ.Grant) =>
      grant.authorization["@type"] ===
      "/cosmos.staking.v1beta1.StakeAuthorization";

    grants.forEach((grant) => {
      if (
        isSendAuthorization(grant) ||
        (isGenericAuthorization(grant) &&
          (grant.authorization as AuthZ.GenericAuthorization).msg ===
            "/cosmos.bank.v1beta1.MsgSend")
      ) {
        tempGrantList.Send.push(grant);
        return;
      }

      if (
        (isStakeAuthorization(grant) &&
          (grant.authorization as AuthZ.StakeAuthorization)
            .authorization_type === "AUTHORIZATION_TYPE_DELEGATE") ||
        (isGenericAuthorization(grant) &&
          (grant.authorization as AuthZ.GenericAuthorization).msg ===
            "/cosmos.staking.v1beta1.MsgDelegate")
      ) {
        tempGrantList.Delegate.push(grant);
        return;
      }

      if (
        (isStakeAuthorization(grant) &&
          (grant.authorization as AuthZ.StakeAuthorization)
            .authorization_type === "AUTHORIZATION_TYPE_REDELEGATE") ||
        (isGenericAuthorization(grant) &&
          (grant.authorization as AuthZ.GenericAuthorization).msg ===
            "/cosmos.staking.v1beta1.MsgBeginRedelegate")
      ) {
        tempGrantList.Redelegate.push(grant);
        return;
      }

      if (
        (isStakeAuthorization(grant) &&
          (grant.authorization as AuthZ.StakeAuthorization)
            .authorization_type === "AUTHORIZATION_TYPE_UNDELEGATE") ||
        (isGenericAuthorization(grant) &&
          (grant.authorization as AuthZ.GenericAuthorization).msg ===
            "/cosmos.staking.v1beta1.MsgUndelegate")
      ) {
        tempGrantList.Undelegate.push(grant);
        return;
      }

      if (
        isGenericAuthorization(grant) &&
        (grant.authorization as AuthZ.GenericAuthorization).msg ===
          "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward"
      ) {
        tempGrantList["Withdraw Reward"].push(grant);
        return;
      }

      if (
        isGenericAuthorization(grant) &&
        (grant.authorization as AuthZ.GenericAuthorization).msg ===
          "/cosmos.gov.v1beta1.MsgVote"
      ) {
        tempGrantList.Vote.push(grant);
        return;
      }

      if (
        isGenericAuthorization(grant) &&
        (grant.authorization as AuthZ.GenericAuthorization).msg ===
          "/cosmos.gov.v1beta1.MsgDeposit"
      ) {
        tempGrantList.Deposit.push(grant);
        return;
      }

      tempGrantList.Custom.push(grant);
    });

    return tempGrantList;
  }, [grants]);

  const onClickAuthZItem = (title: string, grant: AuthZ.Grant) => {
    history.push({
      pathname: "/authz",
      search: `title=${title}&grant=${Buffer.from(
        JSON.stringify(grant)
      ).toString("base64")}`,
    });
  };

  return (
    <div className={styleAuthZ.containerInner}>
      <div className={styleAuthZ.vertical}>
        <p
          className={classnames(
            "h2",
            "my-0",
            "font-weight-normal",
            styleStake.paragraphMain
          )}
        >
          <FormattedMessage id="main.authz.title" />
        </p>

        {grantList
          ? Object.entries(grantList).map(([title, grants]) => {
              const grantsItems = grants.map((grant, index) => {
                return (
                  <div
                    className={styleAuthZ.item}
                    key={index}
                    onClick={() => onClickAuthZItem(title, grant)}
                  >
                    <div className={styleAuthZ.title}>
                      <FormattedMessage id="main.authz.grant.grantee.information" />
                      <ToolTip
                        trigger="hover"
                        options={{ placement: "bottom" }}
                        tooltip={
                          <div className={styleAuthZ.tooltip}>
                            {grant.grantee}
                          </div>
                        }
                      >
                        <span className={styleAuthZ.bold}>
                          {Bech32Address.shortenAddress(grant.grantee, 20)}
                        </span>
                      </ToolTip>
                    </div>
                    {grant.expiration ? (
                      <div className={styleAuthZ.expiration}>
                        <FormattedMessage id="main.authz.grant.expiration.information" />
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
                      <FormattedMessage id="main.authz.grant.expiration.infinite" />
                    )}
                  </div>
                );
              });

              return grantsItems.length > 0 ? (
                <Collapse
                  key={title}
                  title={title}
                  count={`${grantsItems.length}`}
                >
                  <div className={styleAuthZ.grants}>{grantsItems}</div>
                </Collapse>
              ) : null;
            })
          : null}
      </div>
    </div>
  );
};
