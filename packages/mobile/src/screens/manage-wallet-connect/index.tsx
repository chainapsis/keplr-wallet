import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { PageWithScrollView } from "../../components/page";
import { Text, View } from "react-native";
import { useStyle } from "../../styles";
import { WCAppLogo } from "../../components/wallet-connect";
import { UnconnectIcon } from "../../components/icon";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useConfirmModal } from "../../providers/confirm-modal";

export const ManageWalletConnectScreen: FunctionComponent = observer(() => {
  const { walletConnectStore } = useStore();

  const style = useStyle();

  const confirmModal = useConfirmModal();

  return (
    <PageWithScrollView backgroundMode="secondary">
      <View style={style.get("height-card-gap")} />
      {walletConnectStore.sessions.map((session, i) => {
        const appName =
          session.peerMeta?.name || session.peerMeta?.url || "unknown";

        return (
          <React.Fragment key={session.key}>
            <View
              style={style.flatten([
                "height-1",
                "background-color-gray-50",
                "dark:background-color-platinum-500",
              ])}
            />
            <View
              style={style.flatten([
                "flex-row",
                "items-center",
                "background-color-white",
                "dark:background-color-platinum-600",
                "padding-y-25.5",
              ])}
            >
              <WCAppLogo
                logoStyle={style.flatten(["margin-left-20"])}
                altLogoStyle={style.flatten(["margin-left-20"])}
                peerMeta={session.peerMeta}
              />
              <View style={style.flatten(["flex-1", "margin-left-16"])}>
                <Text style={style.flatten(["subtitle2", "color-text-middle"])}>
                  {appName}
                </Text>
              </View>
              <View
                style={style.flatten([
                  "height-1",
                  "overflow-visible",
                  "justify-center",
                ])}
              >
                <TouchableOpacity
                  style={style.flatten(["padding-x-16", "padding-y-24"])}
                  onPress={async () => {
                    if (
                      await confirmModal.confirm({
                        title: "Disconnect Session",
                        paragraph:
                          "Are you sure you want to end this WalletConnect session?",
                        yesButtonText: "Disconnect",
                        noButtonText: "Cancel",
                      })
                    ) {
                      await walletConnectStore.disconnect(session.key);
                    }
                  }}
                >
                  <UnconnectIcon
                    color={
                      style.flatten([
                        "color-gray-100",
                        "dark:color-platinum-300",
                      ]).color
                    }
                    height={28}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {walletConnectStore.sessions.length - 1 === i ? (
              <View
                style={style.flatten([
                  "height-1",
                  "background-color-gray-50",
                  "dark:background-color-platinum-500",
                ])}
              />
            ) : null}
          </React.Fragment>
        );
      })}
      <View style={style.get("height-card-gap")} />
    </PageWithScrollView>
  );
});
