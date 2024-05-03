import React, { FunctionComponent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "reactstrap";

import style from "./style.module.scss";
import { EmptyLayout } from "@layouts/empty-layout";
import { FormattedMessage } from "react-intl";
import { useInteractionInfo } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { ToolTip } from "@components/tooltip";
import classNames from "classnames";
import { GithubIcon } from "@components/icon";
import { useStore } from "../../stores";
import { messageAndGroupListenerUnsubscribe } from "@graphQL/messages-api";

export const ApproveSwitchChainPage: FunctionComponent = observer(() => {
  const {
    chainSwitchStore,
    analyticsStore,
    chainStore,
    chatStore,
    proposalStore,
  } = useStore();

  const [isLoadingPlaceholder, setIsLoadingPlaceholder] = useState(true);
  const navigate = useNavigate();

  const interactionInfo = useInteractionInfo(() => {
    chainSwitchStore.rejectAll();
  });

  useEffect(() => {
    if (chainSwitchStore.waitingSuggestedChainId) {
      analyticsStore.logEvent("Chain switch suggested", {
        chainId: chainSwitchStore.waitingSuggestedChainId.data.chainId,
      });
    }
  }, [analyticsStore, chainSwitchStore.waitingSuggestedChainId]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoadingPlaceholder(false);
    }, 1000);
  }, []);

  if (!chainSwitchStore.waitingSuggestedChainId) {
    return null;
  }

  return (
    <EmptyLayout style={{ height: "100%" }}>
      {isLoadingPlaceholder ? (
        <div className={style["container"]}>
          <div className={style["content"]}>
            <div className={style["logo"]}>
              <div className={style["imageContainer"]}>
                <div
                  className={classNames(
                    style["skeleton"],
                    style["skeletonImageBackground"]
                  )}
                />
              </div>
              <div className={style["dots"]}>
                <div
                  className={classNames(
                    style["skeletonDot"],
                    style["skeleton"]
                  )}
                />
                <div
                  className={classNames(
                    style["skeletonDot"],
                    style["skeleton"]
                  )}
                />
                <div
                  className={classNames(
                    style["skeletonDot"],
                    style["skeleton"]
                  )}
                />
              </div>
              <div className={style["imageContainer"]}>
                <div
                  className={classNames(
                    style["skeleton"],
                    style["skeletonImageBackground"]
                  )}
                />
              </div>
            </div>

            <h1 className={style["header"]}>Connecting...</h1>

            <div className={style["skeletonTag"]}>
              <div
                className={classNames(
                  style["skeleton"],
                  style["skeletonGithubLink"]
                )}
              />
            </div>

            <div className={classNames(style["skeletonParagraph"])}>
              <div
                className={classNames(
                  style["skeleton"],
                  style["skeletonTitle"]
                )}
              />
              <div
                className={classNames(
                  style["skeleton"],
                  style["skeletonContent"]
                )}
              />
            </div>

            <div className={style["buttons"]}>
              <div
                className={classNames(
                  style["button"],
                  style["skeleton"],
                  style["skeletonButton"]
                )}
              />
              <div
                className={classNames(
                  style["button"],
                  style["skeleton"],
                  style["skeletonButton"]
                )}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className={style["container"]}>
          {
            <div className={style["content"]}>
              <div className={style["logo"]}>
                <div className={style["imageContainer"]}>
                  <div className={style["imageBackground"]} />
                  <img
                    className={style["logoImage"]}
                    src={require("@assets/logo-256.svg")}
                    alt="chain logo"
                  />
                </div>
                <div className={style["dots"]}>
                  <div className={style["dot"]} />
                  <div className={style["dot"]} />
                  <div className={style["dot"]} />
                </div>
                <div className={style["imageContainer"]}>
                  <div className={style["imageBackground"]} />
                  <img
                    className={style["logoImage"]}
                    src={require("../../public/assets/logo-256.svg")}
                    alt="keplr logo"
                  />
                </div>
              </div>
              <h1 className={style["header"]}>
                <FormattedMessage
                  id="chain.switch.title"
                  values={{
                    chainName:
                      chainSwitchStore.waitingSuggestedChainId?.data.chainId,
                  }}
                />
              </h1>

              <ToolTip
                tooltip={
                  <div className={style["tooltip"]}>
                    <FormattedMessage id="chain.switch.tooltip" />
                  </div>
                }
                trigger="hover"
              >
                <div className={style["tag"]}>
                  {/* <a
                    href={chainSwitchStore.getCommunityChainInfoUrl(
                      chainSwitchStore.waitingSuggestedChainId?.data.chainId
                    )}
                    target="_blank"
                    rel="noreferrer"
                  > */}
                  <div className={style["item"]}>
                    <FormattedMessage id="chain.suggested.community-driven" />
                    <GithubIcon />
                  </div>
                  {/* </a> */}
                </div>
              </ToolTip>

              <div className={style["paragraph"]}>
                <FormattedMessage
                  id="chain.switch.paragraph"
                  values={{
                    host: chainSwitchStore.waitingSuggestedChainId?.data.origin,
                    chainId:
                      chainSwitchStore.waitingSuggestedChainId?.data.chainId,
                    // eslint-disable-next-line react/display-name
                    b: (...chunks: any) => <b>{chunks}</b>,
                  }}
                />
              </div>
            </div>
          }
          <div className={style["buttons"]}>
            <Button
              className={style["button"]}
              color="danger"
              outline
              disabled={!chainSwitchStore.waitingSuggestedChainId}
              data-loading={chainSwitchStore.isLoading}
              onClick={async (e: any) => {
                e.preventDefault();

                await chainSwitchStore.reject();

                if (
                  interactionInfo.interaction &&
                  !interactionInfo.interactionInternal
                ) {
                  window.close();
                } else {
                  navigate("/");
                }
              }}
            >
              <FormattedMessage id="chain.suggested.button.reject" />
            </Button>
            <Button
              className={style["button"]}
              color="primary"
              disabled={!chainSwitchStore.waitingSuggestedChainId}
              data-loading={chainSwitchStore.isLoading}
              onClick={async (e: any) => {
                e.preventDefault();

                const chainId =
                  chainSwitchStore.waitingSuggestedChainId?.data.chainId;
                if (chainId) {
                  chainSwitchStore.approve(chainId);
                  chainStore.selectChain(chainId);
                  chainStore.saveLastViewChainId();
                  chatStore.userDetailsStore.resetUser();
                  proposalStore.resetProposals();
                  chatStore.messagesStore.resetChatList();
                  chatStore.messagesStore.setIsChatSubscriptionActive(false);
                  messageAndGroupListenerUnsubscribe();
                }

                if (
                  interactionInfo.interaction &&
                  !interactionInfo.interactionInternal
                ) {
                  window.close();
                } else {
                  navigate("/");
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
