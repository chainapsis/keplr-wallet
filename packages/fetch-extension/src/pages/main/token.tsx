import React, { FunctionComponent, useMemo, useState } from "react";

import styleToken from "./token.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useNavigate } from "react-router";
import { Hash } from "@keplr-wallet/crypto";
import { UncontrolledTooltip } from "reactstrap";
import {
  WrongViewingKeyError,
  ObservableQueryBalanceInner,
} from "@keplr-wallet/stores";
import { useNotification } from "@components/notification";
import { useLoadingIndicator } from "@components/loading-indicator";
import sendIcon from "@assets/icon/send.png";
import { Dec } from "@keplr-wallet/unit";
import { DenomHelper } from "@keplr-wallet/common";
import { ToolTip } from "@components/tooltip";
import { formatTokenName } from "@utils/format";

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
  const isZeroBal = balance.balance.toDec().equals(new Dec(0));

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

  const navigate = useNavigate();

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
    <div className={styleToken["tokenContainer"]}>
      <div className={styleToken["tokenImg"]}>
        {balance.currency.coinImageUrl ? (
          <div>
            <img
              src={balance.currency.coinImageUrl}
              alt={name}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "100000px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "16px",
              }}
            />
          </div>
        ) : (
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
        )}
      </div>
      <div className={styleToken["tokenName"]}>
        <ToolTip trigger="hover" tooltip={name}>
          {formatTokenName(name)}
        </ToolTip>
      </div>
      <div className={styleToken["tokenBalance"]}>
        {balance.isFetching ? (
          <i className="fas fa-spinner fa-spin ml-1" />
        ) : (
          amount.maxDecimals(6).hideDenom(true).toString()
        )}
      </div>
      {error ? (
        <div style={{ paddingRight: "10px" }}>
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
          style={{ paddingRight: "10px" }}
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

              navigate({
                pathname: "/",
              });
            }
          }}
        >
          {accountInfo.txTypeInProgress === "createSecret20ViewingKey" ? (
            <i className="fa fa-spinner fa-spin fa-fw" />
          ) : (
            <i className="fas fa-wrench" />
          )}
        </div>
      ) : null}
      <img
        onClick={(e) => {
          if (!isZeroBal) {
            e.preventDefault();
            onClick();
          }
        }}
        src={sendIcon}
        style={!isZeroBal ? { cursor: "pointer" } : { opacity: 0.5 }}
        alt="send"
      />
    </div>
  );
});

export const TokensView: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const tokens = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(accountInfo.bech32Address)
    .unstakables.filter((bal) => {
      if (
        chainStore.current.features &&
        chainStore.current.features.includes("terra-classic-fee")
      ) {
        // At present, can't handle stability tax well if it is not registered native token.
        // So, for terra classic, disable other tokens.
        const denom = new DenomHelper(bal.currency.coinMinimalDenom);
        if (denom.type !== "native" || denom.denom.startsWith("ibc/")) {
          return false;
        }

        if (denom.type === "native") {
          return bal.balance.toDec().gt(new Dec("0"));
        }
      }

      return true;
    })
    .sort((a, b) => {
      const aDecIsZero = a.balance.toDec().isZero();
      const bDecIsZero = b.balance.toDec().isZero();

      if (aDecIsZero && !bDecIsZero) {
        return 1;
      }
      if (!aDecIsZero && bDecIsZero) {
        return -1;
      }

      return a.currency.coinDenom < b.currency.coinDenom ? -1 : 1;
    });

  const navigate = useNavigate();

  return (
    <div>
      <div className={styleToken["tokenTitle"]}>Tokens</div>
      <div className={styleToken["tokenContainnerInner"]}>
        {tokens.map((token, i) => {
          return (
            <TokenView
              key={i.toString()}
              balance={token}
              onClick={() => {
                analyticsStore.logEvent("send_click", {
                  pageName: "Token List",
                });
                navigate({
                  pathname: "/send",
                  search: `?defaultDenom=${token.currency.coinMinimalDenom}`,
                });
              }}
            />
          );
        })}
      </div>
    </div>
  );
});
