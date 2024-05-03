import React, { FunctionComponent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "reactstrap";

import style from "./style.module.scss";
import { EmptyLayout } from "@layouts/empty-layout";
import { FormattedMessage } from "react-intl";
import { useInteractionInfo } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { useStore } from "../../stores";
import { messageAndGroupListenerUnsubscribe } from "@graphQL/messages-api";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { ListAccountsMsg } from "@keplr-wallet/background";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

export const ApproveSwitchAccountByAddressPage: FunctionComponent = observer(
  () => {
    const {
      analyticsStore,
      chatStore,
      keyRingStore,
      accountSwitchStore,
      proposalStore,
      chainStore,
    } = useStore();

    const [isLoadingPlaceholder, setIsLoadingPlaceholder] = useState(true);
    const [addressIndex, setAddressIndex] = useState<number>();
    const navigate = useNavigate();

    const interactionInfo = useInteractionInfo(() => {
      accountSwitchStore.rejectAll();
    });

    useEffect(() => {
      const findAndSetAddressIndex = async () => {
        if (accountSwitchStore.waitingSuggestedAccount) {
          // TODO: update event properties then change chainId below
          const requester = new InExtensionMessageRequester();
          const msg = new ListAccountsMsg();
          const accounts = await requester.sendMessage(BACKGROUND_PORT, msg);

          const isEvm = chainStore.current.features?.includes("evm") ?? false;
          const addresses = accounts.map((account) => {
            if (isEvm) {
              return account.EVMAddress;
            }

            return account.bech32Address;
          });

          const index = addresses.findIndex((a) => {
            return (
              accountSwitchStore.waitingSuggestedAccount &&
              a === accountSwitchStore.waitingSuggestedAccount.data.address
            );
          });

          setAddressIndex(index);
          analyticsStore.logEvent("Account switch suggested", {
            chainId: accountSwitchStore.waitingSuggestedAccount.data.address,
          });
          setIsLoadingPlaceholder(false);
        }
      };

      findAndSetAddressIndex();
    }, [
      keyRingStore,
      chainStore,
      analyticsStore,
      accountSwitchStore,
      accountSwitchStore.waitingSuggestedAccount,
    ]);

    // useEffect(() => {
    //   setTimeout(() => {
    //     setIsLoadingPlaceholder(false);
    //   }, 1000);
    // }, []);

    if (!accountSwitchStore.waitingSuggestedAccount) {
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
                    id="account.switch.title"
                    values={{
                      address:
                        accountSwitchStore.waitingSuggestedAccount?.data
                          .address,
                    }}
                  />
                </h1>

                <div className={style["paragraph"]}>
                  <FormattedMessage
                    id="account.switch.paragraph"
                    values={{
                      host: accountSwitchStore.waitingSuggestedAccount?.data
                        .origin,
                      address:
                        accountSwitchStore.waitingSuggestedAccount?.data
                          .address,
                      // eslint-disable-next-line react/display-name
                      b: (...chunks: any) => <b>{chunks}</b>,
                    }}
                  />
                </div>

                {addressIndex === -1 && (
                  <p>
                    Provided addresses not found in keyring. Nothing to Approve,
                    reject to close this window
                  </p>
                )}
              </div>
            }
            <div className={style["buttons"]}>
              <Button
                className={style["button"]}
                color="danger"
                outline
                disabled={!accountSwitchStore.waitingSuggestedAccount}
                data-loading={accountSwitchStore.isLoading}
                onClick={async (e: any) => {
                  e.preventDefault();

                  await accountSwitchStore.reject();

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
                disabled={
                  !accountSwitchStore.waitingSuggestedAccount ||
                  addressIndex === -1
                }
                data-loading={accountSwitchStore.isLoading}
                onClick={async (e: any) => {
                  e.preventDefault();

                  const address =
                    accountSwitchStore.waitingSuggestedAccount?.data.address;
                  if (address !== undefined && addressIndex !== undefined) {
                    try {
                      accountSwitchStore.approve(address);
                      keyRingStore.changeKeyRing(addressIndex);
                      analyticsStore.logEvent("Account changed");
                      chatStore.userDetailsStore.resetUser();
                      proposalStore.resetProposals();
                      chatStore.messagesStore.resetChatList();
                      chatStore.messagesStore.setIsChatSubscriptionActive(
                        false
                      );
                      messageAndGroupListenerUnsubscribe();
                    } catch (error) {
                      console.log(
                        "error while trying to switch account",
                        error
                      );
                    }
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
  }
);
