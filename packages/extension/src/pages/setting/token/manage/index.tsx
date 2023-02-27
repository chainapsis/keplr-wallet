import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../../../layouts";
import { useHistory } from "react-router";
import { PageButton } from "../../page-button";

import style from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { useNotification } from "../../../../components/notification";
import { useConfirm } from "../../../../components/confirm";
import {
  CW20Currency,
  ERC20Currency,
  Secret20Currency,
} from "@keplr-wallet/types";
import { useIntl } from "react-intl";
import { ToolTip } from "../../../../components/tooltip";

export const ManageTokenPage: FunctionComponent = observer(() => {
  const history = useHistory();
  const intl = useIntl();
  const notification = useNotification();
  const confirm = useConfirm();

  const { chainStore, tokensStore } = useStore();

  const tokenType = (() => {
    const tokenTypes = ["secretwasm", "cosmwasm", "erc20"];
    for (const type of tokenTypes) {
      const feature = type === "erc20" ? `evmos-${type}` : type;
      if (
        chainStore
          .getChain(chainStore.current.chainId)
          .features?.includes(feature)
      ) {
        return type;
      }
    }
  })() as "secretwasm" | "cosmwasm" | "erc20";

  const appCurrencies = chainStore.current.currencies.filter((currency) => {
    switch (tokenType) {
      case "secretwasm":
        return "type" in currency && currency.type === "secret20";
      case "cosmwasm":
        return "type" in currency && currency.type === "cw20";
      case "erc20":
        return "type" in currency && currency.type === "erc20";
    }
  });

  const copyText = async (text: string, messageId: string) => {
    await navigator.clipboard.writeText(text);

    // TODO: Show success tooltip.
    notification.push({
      placement: "top-center",
      type: "success",
      duration: 2,
      content: intl.formatMessage({
        id: messageId,
      }),
      canDelete: true,
      transition: {
        duration: 0.25,
      },
    });
  };

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "main.menu.token-list",
      })}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <div className={style.container}>
        {appCurrencies.map((currency) => {
          const customToken = currency as
            | CW20Currency
            | Secret20Currency
            | ERC20Currency;

          const customTokenAddress =
            tokenType === "erc20"
              ? customToken.contractAddress.length === 42
                ? `${customToken.contractAddress.slice(
                    0,
                    10
                  )}...${customToken.contractAddress.slice(-8)}`
                : customToken.contractAddress
              : Bech32Address.shortenAddress(customToken.contractAddress, 30);

          const icons: React.ReactElement[] = [];

          icons.push(
            <ToolTip
              trigger="hover"
              options={{
                placement: "top-end",
              }}
              childrenStyle={{ display: "flex" }}
              tooltip={
                <div>
                  {intl.formatMessage({
                    id:
                      "setting.token.manage.notification.contract-address.copy.hover",
                  })}
                </div>
              }
            >
              <i
                key="copy"
                className="fas fa-copy"
                style={{
                  cursor: "pointer",
                }}
                onClick={async (e) => {
                  e.preventDefault();
                  await copyText(
                    customToken.contractAddress,
                    "setting.token.manage.notification.contract-address.copy"
                  );
                }}
              />
            </ToolTip>
          );

          if ("viewingKey" in customToken) {
            icons.push(
              <ToolTip
                trigger="hover"
                options={{
                  placement: "top-end",
                }}
                childrenStyle={{ display: "flex" }}
                tooltip={
                  <div>
                    {intl.formatMessage({
                      id:
                        "setting.token.manage.notification.viewing-key.copy.hover",
                    })}
                  </div>
                }
              >
                <i
                  key="key"
                  className="fas fa-key"
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={async (e) => {
                    e.preventDefault();

                    await copyText(
                      customToken.viewingKey,
                      "setting.token.manage.notification.viewing-key.copy"
                    );
                  }}
                />
              </ToolTip>
            );
          }

          /*
          icons.push(
            <i
              key="connections"
              className="fas fa-link"
              style={{
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.preventDefault();

                history.push(
                  `/setting/connections/viewing-key/${currency.contractAddress}`
                );
              }}
            />
          );
           */

          icons.push(
            <i
              key="trash"
              className="fas fa-trash-alt"
              style={{
                cursor: "pointer",
              }}
              onClick={async (e) => {
                e.preventDefault();

                if (
                  await confirm.confirm({
                    paragraph: intl.formatMessage({
                      id: "setting.token.manage.confirm.remove-token",
                    }),
                  })
                ) {
                  await tokensStore
                    .getTokensOf(chainStore.current.chainId)
                    .removeToken(customToken);
                }
              }}
            />
          );

          return (
            <PageButton
              key={customToken.contractAddress}
              style={{
                cursor: "auto",
              }}
              title={customToken.coinDenom}
              paragraph={customTokenAddress}
              icons={icons}
            />
          );
        })}
      </div>
    </HeaderLayout>
  );
});
