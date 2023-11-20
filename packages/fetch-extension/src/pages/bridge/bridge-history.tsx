import { HeaderLayout } from "@layouts/header-layout";
import React, { FunctionComponent } from "react";
import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import style from "./style.module.scss";
import { useStore } from "../../stores";
import { FormattedMessage } from "react-intl";
import { CoinPretty } from "@keplr-wallet/unit";
import { BridgeHistory } from "@keplr-wallet/stores";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { Button } from "reactstrap";
import restartIcon from "@assets/icon/undo.png";

export const proposalOptions = {
  ProposalActive: "PROPOSAL_STATUS_VOTING_PERIOD",
  ProposalPassed: "PROPOSAL_STATUS_PASSED",
  ProposalRejected: "PROPOSAL_STATUS_REJECTED",
  ProposalFailed: "PROPOSAL_STATUS_FAILED",
};

const FETCHSTATION_TXN_URL = "https://www.mintscan.io/fetchai/tx/";
const ETHERSCAN_TXN_URL = "https://etherscan.io/tx/";

export const BridgeHistoryView: FunctionComponent = observer(() => {
  const navigate = useNavigate();

  const { chainStore, accountStore, queriesStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const isEvm = chainStore.current.features?.includes("evm") ?? false;
  const currentQueriesStore = queriesStore.get(chainStore.current.chainId);

  const currentChainBridgeHistoryQuery = isEvm
    ? currentQueriesStore.evm.queryBridgeHistory
    : currentQueriesStore.cosmwasm.queryBridgeHistory;
  const bridgeHistory = currentChainBridgeHistoryQuery.getBridgeHistory(
    accountInfo.bech32Address
  );

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={"Bridge History"}
      onBackButton={() => {
        navigate(-1);
      }}
      showBottomMenu={false}
      rightRenderer={
        <img
          src={restartIcon}
          className={style["refresh"]}
          onClick={(e) => {
            e.preventDefault();

            bridgeHistory.fetch();
          }}
        />
      }
    >
      <div className={style["proposalContainer"]}>
        {bridgeHistory.isFetching ? (
          <div className={style["loaderScreen"]}>
            <i className="fa fa-spinner fa-spin fa-fw" />
          </div>
        ) : bridgeHistory.history.length === 0 ? (
          <div className={style["loaderScreen"]}>
            <p>
              <FormattedMessage id="search.no-result-found" />
            </p>
          </div>
        ) : (
          bridgeHistory.history
            .reverse()
            .map((history) => (
              <BridgeStatus key={history.swapId} history={history} />
            ))
        )}
      </div>
    </HeaderLayout>
  );
});

const BridgeStatus: FunctionComponent<{ history: BridgeHistory }> = observer(
  ({ history }) => {
    const { chainStore, queriesStore } = useStore();
    const isEvm = chainStore.current.features?.includes("evm") ?? false;
    const currentQueriesStore = queriesStore.get(chainStore.current.chainId);

    const counterChainSwapStatusQuery = isEvm
      ? currentQueriesStore.cosmwasm.queryBridgeReverseSwapHash
      : currentQueriesStore.evm.queryBridgeReverseSwapHash;
    const reverseSwapHash = counterChainSwapStatusQuery.getReverseSwapHash(
      history.swapId
    );
    const fetCurrency = chainStore.current.currencies.find(
      (c) => c.coinDenom === "FET"
    );

    return (
      <div className={style["bHistory"]}>
        <div className={style["hContent"]}>
          <p className={style["sId"]}>{`Swap id #${history.swapId}`}</p>
          <p className={style["hTitle"]}>{`Send ${
            fetCurrency
              ? new CoinPretty(fetCurrency, history.amount)
                  .maxDecimals(2)
                  .toString()
              : "0 FET"
          }`}</p>
          <p className={style["hDesc"]}>
            To: {Bech32Address.shortenAddress(history.to, 22, !isEvm)}
          </p>
        </div>

        <div className={style["hStatus"]}>
          {reverseSwapHash.isFetching ? (
            <i
              style={{ position: "absolute", top: "35%" }}
              className="fa fa-spinner fa-spin fa-fw"
            />
          ) : (
            <div>
              <Button
                disabled={!history.transactionHash}
                color="darkgrey"
                className={style["statusButton"]}
                onClick={() => {
                  window.open(
                    `${isEvm ? ETHERSCAN_TXN_URL : FETCHSTATION_TXN_URL}${
                      history.transactionHash
                    }`,
                    "_blank",
                    "noreferrer"
                  );
                }}
              >
                {isEvm ? (
                  <img
                    draggable={false}
                    src={require("@assets/img/ethereum.svg")}
                    className={style["ethLogo"]}
                  />
                ) : (
                  <img
                    draggable={false}
                    src={require("@assets/svg/fetch_logo_black.svg")}
                    className={style["fetLogo"]}
                  />
                )}
                <img
                  draggable={false}
                  className={style["status"]}
                  src={require("@assets/svg/" +
                    `${
                      history.transactionHash ? "gov-tick.svg" : "gov-clock.svg"
                    }`)}
                />
              </Button>
              <img
                className={style["arrowIcon"]}
                src={require("@assets/svg/arrow-right-outline.svg")}
                alt=""
                draggable={false}
              />
              <Button
                disabled={!reverseSwapHash.hash}
                color="darkgrey"
                className={style["statusButton"]}
                onClick={() => {
                  window.open(
                    `${!isEvm ? ETHERSCAN_TXN_URL : FETCHSTATION_TXN_URL}${
                      reverseSwapHash.hash
                    }`,
                    "_blank",
                    "noreferrer"
                  );
                }}
              >
                {!isEvm ? (
                  <img
                    draggable={false}
                    src={require("@assets/img/ethereum.svg")}
                    className={style["ethLogo"]}
                  />
                ) : (
                  <img
                    draggable={false}
                    src={require("@assets/svg/fetch_logo_black.svg")}
                    className={style["fetLogo"]}
                  />
                )}
                <img
                  draggable={false}
                  className={style["status"]}
                  src={require("@assets/svg/" +
                    `${
                      reverseSwapHash.hash ? "gov-tick.svg" : "gov-clock.svg"
                    }`)}
                />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
);
