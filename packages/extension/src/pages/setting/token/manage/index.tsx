import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../../../layouts";
import { useHistory } from "react-router";
import { PageButton } from "../../page-button";

import style from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { Bech32Address } from "@keplr/cosmos";
import { useNotification } from "../../../../components/notification";
import { useConfirm } from "../../../../components/confirm";
import { Secret20Currency } from "@keplr/types";

export const ManageTokenPage: FunctionComponent = observer(() => {
  const history = useHistory();
  const notification = useNotification();
  const confirm = useConfirm();

  const { chainStore, tokensStore } = useStore();

  const appCurrencies = chainStore.current.currencies.filter((currency) => {
    return "type" in currency && currency.type === "secret20";
  });

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle="Token List"
      onBackButton={() => {
        history.goBack();
      }}
    >
      <div className={style.container}>
        {appCurrencies.map((currency) => {
          if (!("type" in currency) || currency.type !== "secret20") {
            return;
          }

          const secret20 = currency as Secret20Currency;

          const icons: React.ReactElement[] = [];

          icons.push(
            <i
              key="copy"
              className="fas fa-copy"
              style={{
                cursor: "pointer",
              }}
              onClick={async (e) => {
                e.preventDefault();

                await navigator.clipboard.writeText(secret20.viewingKey);
                // TODO: Show success tooltip.
                notification.push({
                  placement: "top-center",
                  type: "success",
                  duration: 2,
                  content: "Viewing key copied!",
                  canDelete: true,
                  transition: {
                    duration: 0.25,
                  },
                });
              }}
            />
          );

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
                    paragraph:
                      "Are you sure you’d like to disable this token? You wil not be able to see your balance or transfer until you register a viewing key.",
                  })
                ) {
                  await tokensStore
                    .getTokensOf(chainStore.current.chainId)
                    .removeToken(secret20);
                }
              }}
            />
          );

          return (
            <PageButton
              key={secret20.contractAddress}
              style={{
                cursor: "auto",
              }}
              title={secret20.coinDenom}
              paragraph={Bech32Address.shortenAddress(
                secret20.contractAddress,
                30
              )}
              icons={icons}
            />
          );
        })}
      </div>
    </HeaderLayout>
  );
});
