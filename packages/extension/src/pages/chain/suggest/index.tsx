import React, { FunctionComponent, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { Button } from "reactstrap";

import style from "./style.module.scss";
import { EmptyLayout } from "../../../layouts/empty-layout";
import { FormattedMessage } from "react-intl";
import { useInteractionInfo } from "@keplr-wallet/hooks";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import GithubIcon from "../../../components/icon/github";

export const ChainSuggestedPage: FunctionComponent = observer(() => {
  const { chainSuggestStore, analyticsStore, uiConfigStore } = useStore();
  const [isRawDataMode, setIsRawDataMode] = useState(false);
  const history = useHistory();

  const interactionInfo = useInteractionInfo(() => {
    chainSuggestStore.rejectAll();
  });

  useEffect(() => {
    if (chainSuggestStore.waitingSuggestedChainInfo) {
      analyticsStore.logEvent("Chain suggested", {
        chainId: chainSuggestStore.waitingSuggestedChainInfo.data.chainId,
        chainName: chainSuggestStore.waitingSuggestedChainInfo.data.chainName,
        rpc: chainSuggestStore.waitingSuggestedChainInfo.data.rpc,
        rest: chainSuggestStore.waitingSuggestedChainInfo.data.rest,
      });
    }
  }, [analyticsStore, chainSuggestStore.waitingSuggestedChainInfo]);

  useEffect(() => {
    if (chainSuggestStore.waitingSuggestedChainInfo) {
      setIsRawDataMode(
        !chainSuggestStore.waitingSuggestedChainInfo.data.isFromCommunity
      );
    }
  }, [chainSuggestStore.waitingSuggestedChainInfo]);

  if (!chainSuggestStore.waitingSuggestedChainInfo) {
    return null;
  }

  return (
    <EmptyLayout style={{ height: "100%" }}>
      <div className={style.container}>
        {isRawDataMode ? (
          <div className={style.content}>
            {chainSuggestStore.waitingSuggestedChainInfo.data
              .isFromCommunity && (
              <img
                className={style.backButton}
                src={require("../../../public/assets/svg/arrow-left.svg")}
                onClick={() => setIsRawDataMode(false)}
              />
            )}
            <h1 className={style.header}>
              <FormattedMessage
                id="chain.suggested.title"
                values={{
                  chainName:
                    chainSuggestStore.waitingSuggestedChainInfo?.data.chainName,
                }}
              />
            </h1>
            <p className={style.origin}>
              {chainSuggestStore.waitingSuggestedChainInfo?.data.origin}
            </p>
            <div className={style.chainInfoContainer}>
              <pre className={style.chainInfo}>
                {JSON.stringify(
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  (({ isFromCommunity, beta, origin, ...chainInfo }) =>
                    chainInfo)(
                    chainSuggestStore.waitingSuggestedChainInfo.data
                  ),
                  undefined,
                  2
                )}
              </pre>
            </div>
          </div>
        ) : (
          <div className={style.content}>
            {uiConfigStore.showRawSuggestedChainInfo ? (
              <div
                className={style.rawDataButton}
                onClick={() => setIsRawDataMode(true)}
              >
                <span>
                  <FormattedMessage id="chain.suggested.add-chain-as-suggested" />
                </span>
                <div className={style.imageWrapper}>
                  <img
                    src={require("../../../public/assets/svg/for-developer.svg")}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", height: "60px" }} />
            )}
            <div className={style.logo}>
              <div className={style.imageContainer}>
                <div className={style.imageBackground} />
                <img
                  className={style.logoImage}
                  src={`https://raw.githubusercontent.com/danielkim89/cicd-test/main/images/${
                    ChainIdHelper.parse(
                      chainSuggestStore.waitingSuggestedChainInfo.data.chainId
                    ).identifier
                  }.png`}
                  alt="chain logo"
                />
              </div>
              <div className={style.dots}>
                <div className={style.dot} />
                <div className={style.dot} />
                <div className={style.dot} />
              </div>
              <div className={style.imageContainer}>
                <div className={style.imageBackground} />
                <img
                  className={style.logoImage}
                  src={require("../../../public/assets/logo-256.png")}
                  alt="keplr logo"
                />
              </div>
            </div>
            <h1 className={style.header}>
              <FormattedMessage
                id="chain.suggested.title"
                values={{
                  chainName:
                    chainSuggestStore.waitingSuggestedChainInfo?.data.chainName,
                }}
              />
            </h1>
            <div className={style.tag}>
              <div>
                <FormattedMessage id="chain.suggested.community-driven" />
              </div>
            </div>
            <p className={style.paragraph}>
              <FormattedMessage
                id="chain.suggested.paragraph"
                values={{
                  host:
                    chainSuggestStore.waitingSuggestedChainInfo?.data.origin,
                  chainId:
                    chainSuggestStore.waitingSuggestedChainInfo?.data.chainId,
                  // eslint-disable-next-line react/display-name
                  b: (...chunks: any) => <b>{chunks}</b>,
                }}
              />
            </p>
            <div style={{ flex: 1 }} />
            <div className={style.infoWithLink}>
              <div className={style.info}>
                <FormattedMessage id="chain.suggested.chain-info-is-from" />
              </div>
              <a
                href="https://github.com/chainapsis/cicd-test"
                target="_blank"
                rel="noreferrer"
                className={style.githubLink}
              >
                <GithubIcon />
              </a>
            </div>
          </div>
        )}
        <div className={style.buttons}>
          <Button
            className={style.button}
            color="danger"
            outline
            disabled={!chainSuggestStore.waitingSuggestedChainInfo}
            data-loading={chainSuggestStore.isLoading}
            onClick={async (e) => {
              e.preventDefault();

              await chainSuggestStore.reject();

              if (
                interactionInfo.interaction &&
                !interactionInfo.interactionInternal
              ) {
                window.close();
              } else {
                history.push("/");
              }
            }}
          >
            <FormattedMessage id="chain.suggested.button.reject" />
          </Button>
          <Button
            className={style.button}
            color="primary"
            disabled={!chainSuggestStore.waitingSuggestedChainInfo}
            data-loading={chainSuggestStore.isLoading}
            onClick={async (e) => {
              e.preventDefault();

              await chainSuggestStore.approve();

              if (
                interactionInfo.interaction &&
                !interactionInfo.interactionInternal
              ) {
                window.close();
              } else {
                history.push("/");
              }
            }}
          >
            <FormattedMessage id="chain.suggested.button.approve" />
          </Button>
        </div>
      </div>
    </EmptyLayout>
  );
});
