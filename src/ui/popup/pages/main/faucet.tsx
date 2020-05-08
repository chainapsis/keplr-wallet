import React, { FunctionComponent, useCallback, useState } from "react";
import { observer } from "mobx-react";

import styleFaucet from "./faucet.module.scss";
import classnames from "classnames";
import { Button } from "reactstrap";

import { useNotification } from "../../../components/notification";
import { useStore } from "../../stores";

import Axios, { AxiosError } from "axios";

export const FaucetView: FunctionComponent = observer(() => {
  const { chainStore, accountStore } = useStore();
  const notification = useNotification();

  const [isRequesting, setIsRequesting] = useState(false);

  const requestFaucet = useCallback(() => {
    if (chainStore.chainInfo.faucetUrl) {
      setIsRequesting(true);
      Axios.post(chainStore.chainInfo.faucetUrl, {
        "chain-id": chainStore.chainInfo.chainId,
        address: accountStore.bech32Address
      })
        .then(result => {
          notification.push({
            type: "success",
            content: result?.request?.response,
            duration: 5,
            canDelete: true,
            placement: "top-center",
            transition: {
              duration: 0.25
            }
          });
        })
        .catch((e: AxiosError) => {
          notification.push({
            type: "danger",
            content: e.response?.data?.error || e.message || e,
            duration: 5,
            canDelete: true,
            placement: "top-center",
            transition: {
              duration: 0.25
            }
          });
        })
        .finally(() => {
          setIsRequesting(false);
        });
    }
  }, [
    accountStore.bech32Address,
    chainStore.chainInfo.chainId,
    chainStore.chainInfo.faucetUrl,
    notification
  ]);

  return (
    <div>
      {chainStore.chainInfo.faucetUrl ? (
        <div className={classnames(styleFaucet.containerInner)}>
          <div className={styleFaucet.vertical}>
            <p
              className={classnames(
                "h2",
                "my-0",
                "font-weight-normal",
                styleFaucet.paragraphMain
              )}
            >
              Token Faucet
            </p>
            <p
              className={classnames(
                "h4",
                "my-0",
                "font-weight-normal",
                styleFaucet.paragraphSub
              )}
            >
              Receive test tokens
            </p>
          </div>
          <div style={{ flex: 1 }} />
          <a
            onClick={e => {
              e.preventDefault();
              requestFaucet();
            }}
          >
            <Button
              className={styleFaucet.button}
              color="primary"
              size="sm"
              data-loading={isRequesting}
            >
              Claim
            </Button>
          </a>
        </div>
      ) : null}
      {chainStore.chainInfo.faucetUrl ? (
        <hr className={styleFaucet.hr} />
      ) : null}
      <div className={classnames(styleFaucet.containerInner)}>
        <div className={styleFaucet.vertical}>
          <p
            className={classnames(
              "h2",
              "my-0",
              "font-weight-normal",
              styleFaucet.paragraphMain
            )}
          >
            Install Keplr
          </p>
          <p
            className={classnames(
              "h4",
              "my-0",
              "font-weight-normal",
              styleFaucet.paragraphSub
            )}
          >
            Try Keplr for Cosmos Hub
          </p>
        </div>
        <div style={{ flex: 1 }} />
        <a
          href={
            navigator.userAgent.toLowerCase().indexOf("firefox") > -1
              ? "https://addons.mozilla.org/ko/firefox/addon/keplr/?src=search"
              : "https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap"
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            className={classnames(styleFaucet.button, "px-1")}
            color="primary"
            size="sm"
            outline
          >
            Go to Store
          </Button>
        </a>
      </div>
    </div>
  );
});
