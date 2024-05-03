import React, { FunctionComponent } from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";

import { useLoadingIndicator } from "@components/loading-indicator";
import { messageAndGroupListenerUnsubscribe } from "@graphQL/messages-api";
// import { MultiKeyStoreInfoWithSelectedElem } from "@keplr-wallet/background";
import { Card } from "@components-v2/card";
import { App, AppCoinType } from "@keplr-wallet/ledger-cosmos";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

interface SetKeyRingProps {
  navigateTo?: any;
}
export const SetKeyRingPage: FunctionComponent<SetKeyRingProps> = observer(
  ({ navigateTo }) => {
    const intl = useIntl();
    const navigate = useNavigate();
    const {
      chainStore,
      accountStore,
      keyRingStore,
      analyticsStore,
      chatStore,
      proposalStore,
    } = useStore();

    const accountInfo = accountStore.getAccount(chainStore.current.chainId);
    const loadingIndicator = useLoadingIndicator();
    return (
      <div>
        {keyRingStore.multiKeyStoreInfo.map((keyStore, i) => {
          const bip44HDPath = keyStore.bip44HDPath
            ? keyStore.bip44HDPath
            : {
                account: 0,
                change: 0,
                addressIndex: 0,
              };
          let paragraph = keyStore.meta?.["email"]
            ? keyStore.meta["email"]
            : undefined;
          if (keyStore.type === "keystone") {
            paragraph = "Keystone";
          } else if (keyStore.type === "ledger") {
            const coinType = (() => {
              if (
                keyStore.meta &&
                keyStore.meta["__ledger__cosmos_app_like__"] &&
                keyStore.meta["__ledger__cosmos_app_like__"] !== "Cosmos"
              ) {
                return (
                  AppCoinType[
                    keyStore.meta["__ledger__cosmos_app_like__"] as App
                  ] || 118
                );
              }

              return 118;
            })();

            paragraph = `Ledger - m/44'/${coinType}'/${bip44HDPath.account}'${
              bip44HDPath.change !== 0 || bip44HDPath.addressIndex !== 0
                ? `/${bip44HDPath.change}/${bip44HDPath.addressIndex}`
                : ""
            }`;

            if (
              keyStore.meta &&
              keyStore.meta["__ledger__cosmos_app_like__"] &&
              keyStore.meta["__ledger__cosmos_app_like__"] !== "Cosmos"
            ) {
              paragraph += ` (${keyStore.meta["__ledger__cosmos_app_like__"]})`;
            }
          }
          console.log(paragraph);
          return (
            <Card
              key={i}
              heading={
                keyStore.meta?.["name"]
                  ? keyStore.meta["name"]
                  : intl.formatMessage({
                      id: "setting.keyring.unnamed-account",
                    })
              }
              rightContent={
                keyStore.selected
                  ? require("@assets/svg/wireframe/check.svg")
                  : ""
              }
              subheading={keyStore.selected ? accountInfo.bech32Address : ""}
              isActive={keyStore.selected}
              onClick={
                keyStore.selected
                  ? undefined
                  : async (e: any) => {
                      e.preventDefault();
                      loadingIndicator.setIsLoading("keyring", true);
                      try {
                        await keyRingStore.changeKeyRing(i);
                        analyticsStore.logEvent("Account changed");
                        loadingIndicator.setIsLoading("keyring", false);
                        chatStore.userDetailsStore.resetUser();
                        proposalStore.resetProposals();
                        chatStore.messagesStore.resetChatList();
                        chatStore.messagesStore.setIsChatSubscriptionActive(
                          false
                        );
                        messageAndGroupListenerUnsubscribe();
                        navigate(navigateTo);
                      } catch (e: any) {
                        console.log(`Failed to change keyring: ${e.message}`);
                        loadingIndicator.setIsLoading("keyring", false);
                      }
                    }
              }
            />
          );
        })}
      </div>
    );
  }
);
