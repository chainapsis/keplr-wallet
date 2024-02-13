import React, { FunctionComponent } from "react";
import style from "./style.module.scss";
import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { EthereumBridge } from "./ethereum-bridge";
import { FetchhubBridge } from "./fetchhub-bridge";
import { HeaderLayout } from "@layouts/header-layout";
import { Dec, IntPretty } from "@keplr-wallet/unit";
import { Button } from "reactstrap";

export const BridgePage: FunctionComponent = observer(() => {
  const { chainStore, queriesStore, analyticsStore } = useStore();
  const navigate = useNavigate();

  const bridgeEvmQuery = queriesStore.get(chainStore.current.chainId).evm
    .queryNativeFetBridge;
  const bridgeFetQuery = queriesStore.get(chainStore.current.chainId).cosmwasm
    .queryNativeFetBridge;

  const isLoading = bridgeEvmQuery.isFetching || bridgeFetQuery.isFetching;
  const isError =
    bridgeEvmQuery.error ||
    bridgeFetQuery.error ||
    !bridgeEvmQuery.status ||
    !bridgeFetQuery.status;
  const isPaused =
    (bridgeEvmQuery.status?.paused ?? true) ||
    (bridgeFetQuery.status?.paused ?? true);
  const isEvmCapReached = bridgeEvmQuery.status
    ? new Dec(bridgeEvmQuery.status.supply).gte(
        new Dec(bridgeEvmQuery.status.cap)
      )
    : true;
  const isFetCapReached = bridgeFetQuery.status
    ? new Dec(bridgeFetQuery.status.supply).gte(
        new Dec(bridgeFetQuery.status.cap)
      )
    : true;

  const isEvm = chainStore.current.features?.includes("evm") ?? false;
  return (
    <HeaderLayout
      showChainName={false}
      alternativeTitle={"Bridge"}
      canChangeChainInfo={false}
      onBackButton={() => {
        analyticsStore.logEvent("back_click", { pageName: "Bridge" });
        navigate(-1);
      }}
      rightRenderer={
        <Button
          className={style["historyBtn"]}
          color="primary"
          outline
          onClick={(e) => {
            e.preventDefault();
            analyticsStore.logEvent("bridge_history_click");
            navigate("/bridge-history");
          }}
        >
          History
        </Button>
      }
    >
      {isLoading ? (
        <p className={style["loaderScreen"]}>
          Fetching Bridge details <i className="fa fa-spinner fa-spin fa-fw" />{" "}
        </p>
      ) : isError ? (
        <p className={style["loaderScreen"]}>
          Error fetching bridge details, please try later{" "}
        </p>
      ) : isPaused ? (
        <p className={style["loaderScreen"]}>
          {" "}
          Bridge is currently paused. Please try again later{" "}
        </p>
      ) : (!isEvm && isFetCapReached) || (isEvm && isEvmCapReached) ? (
        <p className={style["loaderScreen"]}>
          {" "}
          Bridge cap reached. Please try again later{" "}
        </p>
      ) : isEvm ? (
        <div>
          <EthereumBridge
            limit={new IntPretty(
              minDec(
                new Dec(bridgeFetQuery.status.supply),
                new Dec(bridgeEvmQuery.status.cap).sub(
                  new Dec(bridgeEvmQuery.status.supply)
                )
              ).quoTruncate(new Dec(1e18))
            )
              .maxDecimals(0)
              .toString()}
            fee={
              bridgeFetQuery.status.fee &&
              new Dec(bridgeFetQuery.status.fee).isPositive()
                ? new IntPretty(
                    new Dec(bridgeFetQuery.status.fee).quoTruncate(
                      new Dec(1e18)
                    )
                  )
                    .maxDecimals(0)
                    .toString()
                : undefined
            }
          />
        </div>
      ) : (
        <div>
          <FetchhubBridge
            limit={new IntPretty(
              minDec(
                new Dec(bridgeEvmQuery.status.supply),
                new Dec(bridgeFetQuery.status.cap).sub(
                  new Dec(bridgeFetQuery.status.supply)
                )
              ).quoTruncate(new Dec(1e18))
            )
              .maxDecimals(0)
              .toString()}
            fee={
              bridgeEvmQuery.status.fee &&
              new Dec(bridgeEvmQuery.status.fee).isPositive()
                ? new IntPretty(
                    new Dec(bridgeEvmQuery.status.fee).quoTruncate(
                      new Dec(1e18)
                    )
                  )
                    .maxDecimals(0)
                    .toString()
                : undefined
            }
          />
        </div>
      )}
    </HeaderLayout>
  );
});

function minDec(...values: Dec[]): Dec {
  const sorted = values.sort((lhs: Dec, rhs: Dec): number => {
    if (lhs.gt(rhs)) {
      return 1;
    } else if (lhs.lt(rhs)) {
      return -1;
    } else {
      return 0;
    }
  });

  return sorted[0];
}
