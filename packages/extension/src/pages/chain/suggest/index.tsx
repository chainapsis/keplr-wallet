import React, { FunctionComponent, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { Button } from "reactstrap";

import style from "./style.module.scss";
import { EmptyLayout } from "../../../layouts/empty-layout";
import { FormattedMessage } from "react-intl";
import { useInteractionInfo } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { ToolTip } from "../../../components/tooltip";
import classNames from "classnames";
import { GithubIcon, InformationCircleOutline } from "../../../components/icon";

export const ChainSuggestedPage: FunctionComponent = observer(() => {
  const { chainSuggestStore, analyticsStore, uiConfigStore } = useStore();
  const [isRawDataMode, setIsRawDataMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

      // Get community chain information
      chainSuggestStore.fetchCommunityChainInfo();
    }
  }, [
    analyticsStore,
    chainSuggestStore,
    chainSuggestStore.waitingSuggestedChainInfo,
  ]);

  useEffect(() => {
    setIsRawDataMode(!chainSuggestStore.communityChainInfo);
  }, [chainSuggestStore.communityChainInfo]);

  // Set loading page
  useEffect(() => {
    if (!chainSuggestStore.isLoading) {
      setTimeout(() => {
        setIsLoading(chainSuggestStore.isLoading);
      }, 1000);
    } else {
      setIsLoading(chainSuggestStore.isLoading);
    }
  }, [chainSuggestStore.isLoading]);

  if (!chainSuggestStore.waitingSuggestedChainInfo) {
    return null;
  }

  return (
    <EmptyLayout style={{ height: "100%" }}>
      {isLoading ? (
        <div className={style.container}>
          <div className={style.content}>
            <div className={style.logo}>
              <div className={style.imageContainer}>
                <div
                  className={classNames(
                    style.skeleton,
                    style.skeletonImageBackground
                  )}
                />
              </div>
              <div className={style.dots}>
                <div
                  className={classNames(style.skeletonDot, style.skeleton)}
                />
                <div
                  className={classNames(style.skeletonDot, style.skeleton)}
                />
                <div
                  className={classNames(style.skeletonDot, style.skeleton)}
                />
              </div>
              <div className={style.imageContainer}>
                <div
                  className={classNames(
                    style.skeleton,
                    style.skeletonImageBackground
                  )}
                />
              </div>
            </div>

            <h1 className={style.header}>Connecting...</h1>

            <div className={style.skeletonTag}>
              <div
                className={classNames(style.skeleton, style.skeletonGithubLink)}
              />
            </div>

            <div className={classNames(style.skeletonParagraph)}>
              <div
                className={classNames(style.skeleton, style.skeletonTitle)}
              />
              <div
                className={classNames(style.skeleton, style.skeletonContent)}
              />
            </div>

            <div className={style.buttons}>
              <div
                className={classNames(
                  style.button,
                  style.skeleton,
                  style.skeletonButton
                )}
              />
              <div
                className={classNames(
                  style.button,
                  style.skeleton,
                  style.skeletonButton
                )}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className={style.container}>
          {isRawDataMode ? (
            <div className={style.content}>
              {chainSuggestStore.communityChainInfo && (
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
                      chainSuggestStore.waitingSuggestedChainInfo?.data
                        .chainName,
                  }}
                />
              </h1>
              <div className={style.origin}>
                <ToolTip
                  tooltip={
                    <div className={style.tooltip}>
                      <FormattedMessage id="chain.suggested.tooltip" />
                    </div>
                  }
                  trigger="hover"
                >
                  <div className={style.text}>
                    {chainSuggestStore.waitingSuggestedChainInfo?.data.origin}
                  </div>
                </ToolTip>
              </div>
              <div className={style.chainContainer}>
                <div className={style.chainInfoContainer}>
                  <pre className={style.chainInfo}>
                    {JSON.stringify(
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      (({ beta, origin, ...chainInfo }) => chainInfo)(
                        chainSuggestStore.waitingSuggestedChainInfo.data
                      ),
                      undefined,
                      2
                    )}
                  </pre>
                </div>

                {uiConfigStore.isDeveloper &&
                  !chainSuggestStore.communityChainInfo && (
                    <div
                      className={classNames(
                        style.developerInfo,
                        "custom-control custom-checkbox"
                      )}
                    >
                      <input
                        className="custom-control-input"
                        id="use-community-checkbox"
                        type="checkbox"
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="use-community-checkbox"
                        style={{ color: "#323C4A", paddingTop: "1px" }}
                      >
                        <FormattedMessage id="chain.suggested.developer.checkbox" />
                      </label>
                    </div>
                  )}

                <div
                  className={classNames(
                    style.approveInfoContainer,
                    !chainSuggestStore.communityChainInfo
                      ? style.info
                      : style.alert
                  )}
                >
                  <div className={style.titleContainer}>
                    <InformationCircleOutline
                      fill={
                        !chainSuggestStore.communityChainInfo
                          ? "#566172"
                          : "#F0224B"
                      }
                    />
                    <div className={style.text}>
                      <FormattedMessage id="chain.suggested.approve-info.title" />
                    </div>
                  </div>
                  <div className={style.content}>
                    {!chainSuggestStore.communityChainInfo ? (
                      <FormattedMessage id="chain.suggested.approve-info.content" />
                    ) : (
                      <FormattedMessage id="chain.suggested.approve-alert.content" />
                    )}
                  </div>
                  {!chainSuggestStore.communityChainInfo && (
                    <div className={style.link}>
                      <a
                        href={chainSuggestStore.communityChainInfoRepoUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FormattedMessage id="chain.suggested.approve-info.link" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={style.content}>
              <div className={style.logo}>
                <div className={style.imageContainer}>
                  <div className={style.imageBackground} />
                  <img
                    className={style.logoImage}
                    src={
                      chainSuggestStore.communityChainInfo
                        ?.chainSymbolImageUrl ||
                      require("../../../public/assets/logo-256.png")
                    }
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
                      chainSuggestStore.waitingSuggestedChainInfo?.data
                        .chainName,
                  }}
                />
              </h1>

              <ToolTip
                tooltip={
                  <div className={style.tooltip}>
                    <FormattedMessage id="chain.suggested.tooltip" />
                  </div>
                }
                trigger="hover"
              >
                <div className={style.tag}>
                  <a
                    href={chainSuggestStore.getCommunityChainInfoUrl(
                      chainSuggestStore.waitingSuggestedChainInfo?.data.chainId
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div className={style.item}>
                      <FormattedMessage id="chain.suggested.community-driven" />
                      <GithubIcon />
                    </div>
                  </a>
                </div>
              </ToolTip>

              <div className={style.paragraph}>
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
              </div>

              {uiConfigStore.isDeveloper && (
                <div
                  className={style.chainDetailContainer}
                  onClick={() => setIsRawDataMode(true)}
                >
                  <FormattedMessage id="chain.suggested.add-chain-as-suggested" />
                  <img
                    src={require("../../../public/assets/svg/arrow-right-outline.svg")}
                  />
                </div>
              )}
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

                const chainInfo = isRawDataMode
                  ? chainSuggestStore.waitingSuggestedChainInfo?.data
                  : chainSuggestStore.communityChainInfo;

                if (chainInfo) {
                  await chainSuggestStore.approve({
                    ...chainInfo,
                    updateFromRepoDisabled: isRawDataMode,
                  });
                }

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
      )}
    </EmptyLayout>
  );
});
