import React, { FunctionComponent, useMemo, useState } from "react";

import styleToken from "./token.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useHistory } from "react-router";
import { Hash } from "@keplr-wallet/crypto";
import { ObservableQueryBalanceInner } from "@keplr-wallet/stores/build/query/balances";
import classmames from "classnames";
import { UncontrolledTooltip } from "reactstrap";
import { WrongViewingKeyError } from "@keplr-wallet/stores";
import { useNotification } from "../../components/notification";
import { useLoadingIndicator } from "../../components/loading-indicator";
import { DenomHelper } from "@keplr-wallet/common";
import { Dec } from "@keplr-wallet/unit";

const TokenView: FunctionComponent<{
  balance: ObservableQueryBalanceInner;
  onClick: () => void;
}> = observer(({ onClick, balance }) => {
  const { chainStore, accountStore, tokensStore } = useStore();

  const [backgroundColors] = useState([
    "#5e72e4",
    "#11cdef",
    "#2dce89",
    "#fb6340",
  ]);

  const name = balance.currency.coinDenom.toUpperCase();
  const minimalDenom = balance.currency.coinMinimalDenom;
  let amount = balance.balance.trim(true).shrink(true);

  const backgroundColor = useMemo(() => {
    const hash = Hash.sha256(Buffer.from(minimalDenom));
    if (hash.length > 0) {
      return backgroundColors[hash[0] % backgroundColors.length];
    } else {
      return backgroundColors[0];
    }
  }, [backgroundColors, minimalDenom]);

  const error = balance.error;

  // It needs to create the id deterministically according to the currency.
  // But, it is hard to ensure that the id is valid selector because the currency can be suggested from the webpages.
  // So, just hash the minimal denom and encode it to the hex and remove the numbers.
  const validSelector = Buffer.from(Hash.sha256(Buffer.from(minimalDenom)))
    .toString("hex")
    .replace(/\d+/g, "")
    .slice(0, 20);

  const history = useHistory();

  const notification = useNotification();
  const loadingIndicator = useLoadingIndicator();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const createViewingKey = async (): Promise<string | undefined> => {
    if ("type" in balance.currency && balance.currency.type === "secret20") {
      const contractAddress = balance.currency.contractAddress;
      return new Promise((resolve) => {
        accountInfo.secret
          .createSecret20ViewingKey(
            contractAddress,
            "",
            {},
            {},
            (_, viewingKey) => {
              loadingIndicator.setIsLoading("create-veiwing-key", false);

              resolve(viewingKey);
            }
          )
          .then(() => {
            loadingIndicator.setIsLoading("create-veiwing-key", true);
          });
      });
    }
  };

  // If the currency is the IBC Currency.
  // Show the amount as slightly different with other currencies.
  // Show the actual coin denom to the top and just show the coin denom without channel info to the bottom.
  if ("originCurrency" in amount.currency && amount.currency.originCurrency) {
    amount = amount.setCurrency(amount.currency.originCurrency);
  }

  return (
    <div
      className={styleToken.tokenContainer}
      onClick={(e) => {
        e.preventDefault();

        onClick();
      }}
    >
      <div className={styleToken.icon}>
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "100000px",
            backgroundColor,

            display: "flex",
            justifyContent: "center",
            alignItems: "center",

            color: "#FFFFFF",
            fontSize: "16px",
          }}
        >
          {name.length > 0 ? name[0] : "?"}
        </div>
      </div>
      <div className={styleToken.innerContainer}>
        <div className={styleToken.content}>
          <div className={styleToken.name}>{name}</div>
          <div className={styleToken.amount}>
            {amount.maxDecimals(6).toString()}
            {balance.isFetching ? (
              <i className="fas fa-spinner fa-spin ml-1" />
            ) : null}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        {error ? (
          <div className={classmames(styleToken.rightIcon, "mr-2")}>
            <i
              className="fas fa-exclamation-circle text-danger"
              id={validSelector}
            />
            <UncontrolledTooltip target={validSelector}>
              {error.message}
            </UncontrolledTooltip>
          </div>
        ) : null}
        {error?.data && error.data instanceof WrongViewingKeyError ? (
          <div
            className={classmames(styleToken.rightIcon, "mr-2")}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();

              if (
                "type" in balance.currency &&
                balance.currency.type === "secret20"
              ) {
                const viewingKey = await createViewingKey();
                if (!viewingKey) {
                  notification.push({
                    placement: "top-center",
                    type: "danger",
                    duration: 2,
                    content: "Failed to create the viewing key",
                    canDelete: true,
                    transition: {
                      duration: 0.25,
                    },
                  });

                  return;
                }

                const tokenOf = tokensStore.getTokensOf(
                  chainStore.current.chainId
                );

                await tokenOf.addToken({
                  ...balance.currency,
                  viewingKey,
                });

                history.push({
                  pathname: "/",
                });
              }
            }}
          >
            {accountInfo.isSendingMsg === "createSecret20ViewingKey" ? (
              <i className="fa fa-spinner fa-spin fa-fw" />
            ) : (
              <i className="fas fa-wrench" />
            )}
          </div>
        ) : null}
        <div className={styleToken.rightIcon}>
          <i className="fas fa-angle-right" />
        </div>
      </div>
    </div>
  );
});

export const TokensView: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const tokens = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(accountInfo.bech32Address)
    .unstakables.filter((bal) => {
      // Temporary implementation for trimming the 0 balanced native tokens.
      // TODO: Remove this part.
      if (new DenomHelper(bal.currency.coinMinimalDenom).type === "native") {
        return bal.balance.toDec().gt(new Dec("0"));
      }
      return true;
    });

  const history = useHistory();

  return (
    <div className={styleToken.tokensContainer}>
      <h1 className={styleToken.title}>Tokens</h1>
      {tokens.map((token, i) => {
        return (
          <TokenView
            key={i.toString()}
            balance={token}
            onClick={() => {
              history.push({
                pathname: "/send",
                search: `?defaultDenom=${token.currency.coinMinimalDenom}`,
              });
            }}
          />
        );
      })}
    </div>
  );
});
