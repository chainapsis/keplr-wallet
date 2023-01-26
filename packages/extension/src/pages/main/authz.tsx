import React, { FunctionComponent } from "react";
import styleAuthZ from "./authz.module.scss";
import classnames from "classnames";
import { FormattedDate, FormattedMessage } from "react-intl";
import styleStake from "./stake.module.scss";
import { Collapse } from "../../components/collapse";
import { AuthZ } from "@keplr-wallet/stores";
import { useHistory } from "react-router";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { Buffer } from "buffer/";

interface Props {
  grants: AuthZ.Grant[];
}

interface GrantFilter {
  name: string;
  filter: (grant: AuthZ.Grant) => boolean;
}

export const AuthZView: FunctionComponent<Props> = (props) => {
  const { grants } = props;
  const history = useHistory();

  const isSendAuthorization = (grant: AuthZ.Grant) =>
    grant.authorization["@type"] === "/cosmos.bank.v1beta1.SendAuthorization";

  const isGenericAuthorization = (grant: AuthZ.Grant) =>
    grant.authorization["@type"] ===
    "/cosmos.authz.v1beta1.GenericAuthorization";

  const isStakeAuthorization = (grant: AuthZ.Grant) =>
    grant.authorization["@type"] ===
    "/cosmos.staking.v1beta1.StakeAuthorization";

  const grantFilters: GrantFilter[] = [
    {
      name: "Send",
      filter: (grant: AuthZ.Grant) =>
        isSendAuthorization(grant) ||
        (isGenericAuthorization(grant) &&
          (grant.authorization as AuthZ.GenericAuthorization).msg ===
            "/cosmos.bank.v1beta1.MsgSend"),
    },
    {
      name: "Delegate",
      filter: (grant: AuthZ.Grant) =>
        (isStakeAuthorization(grant) &&
          (grant.authorization as AuthZ.StakeAuthorization)
            .authorization_type === "AUTHORIZATION_TYPE_DELEGATE") ||
        (isGenericAuthorization(grant) &&
          (grant.authorization as AuthZ.GenericAuthorization).msg ===
            "/cosmos.staking.v1beta1.MsgDelegate"),
    },
    {
      name: "Redelegate",
      filter: (grant: AuthZ.Grant) =>
        (isStakeAuthorization(grant) &&
          (grant.authorization as AuthZ.StakeAuthorization)
            .authorization_type === "AUTHORIZATION_TYPE_REDELEGATE") ||
        (isGenericAuthorization(grant) &&
          (grant.authorization as AuthZ.GenericAuthorization).msg ===
            "/cosmos.staking.v1beta1.MsgBeginRedelegate"),
    },
    {
      name: "Undelegate",
      filter: (grant: AuthZ.Grant) =>
        (isStakeAuthorization(grant) &&
          (grant.authorization as AuthZ.StakeAuthorization)
            .authorization_type === "AUTHORIZATION_TYPE_UNDELEGATE") ||
        (isGenericAuthorization(grant) &&
          (grant.authorization as AuthZ.GenericAuthorization).msg ===
            "/cosmos.staking.v1beta1.MsgUndelegate"),
    },
    {
      name: "Withdraw Reward",
      filter: (grant: AuthZ.Grant) =>
        isGenericAuthorization(grant) &&
        (grant.authorization as AuthZ.GenericAuthorization).msg ===
          "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
    },
    {
      name: "Vote",
      filter: (grant: AuthZ.Grant) =>
        isGenericAuthorization(grant) &&
        (grant.authorization as AuthZ.GenericAuthorization).msg ===
          "/cosmos.gov.v1beta1.MsgVote",
    },
    {
      name: "Deposit",
      filter: (grant: AuthZ.Grant) =>
        isGenericAuthorization(grant) &&
        (grant.authorization as AuthZ.GenericAuthorization).msg ===
          "/cosmos.gov.v1beta1.MsgDeposit",
    },
    {
      name: "Custom",
      filter: (grant: AuthZ.Grant) =>
        isGenericAuthorization(grant) &&
        ![
          "/cosmos.bank.v1beta1.MsgSend",
          "/cosmos.staking.v1beta1.MsgDelegate",
          "/cosmos.staking.v1beta1.MsgBeginRedelegate",
          "/cosmos.staking.v1beta1.MsgUndelegate",
          "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
          "/cosmos.gov.v1beta1.MsgDeposit",
          "/cosmos.gov.v1beta1.MsgVote",
        ].includes((grant.authorization as AuthZ.GenericAuthorization).msg),
    },
  ];

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

        {grantFilters.map((grantFilter) => {
          const filteredGrant = grants.filter(grantFilter.filter);

          const grantsItems = filteredGrant.map((grant, index) => {
            return (
              <div
                className={styleAuthZ.item}
                key={index}
                onClick={() => onClickAuthZItem(grantFilter.name, grant)}
              >
                <div className={styleAuthZ.title}>
                  <FormattedMessage id="main.authz.grant.grantee.information" />
                  <span className={styleAuthZ.bold}>
                    {Bech32Address.shortenAddress(grant.grantee, 20)}
                  </span>
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
                ) : null}
              </div>
            );
          });

          return grantsItems.length > 0 ? (
            <Collapse
              key={grantFilter.name}
              title={grantFilter.name}
              count={`${grantsItems.length}`}
            >
              <div className={styleAuthZ.grants}>{grantsItems}</div>
            </Collapse>
          ) : null;
        })}
      </div>
    </div>
  );
};
