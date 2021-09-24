import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { PageWithScrollView } from "../../components/page";
import { RectButton } from "../../components/rect-button";
import { Text, View } from "react-native";
import { useStyle } from "../../styles";
import { WCAppLogo } from "../../components/wallet-connect";
import { UnconnectIcon } from "../../components/icon";
import { TouchableOpacity } from "react-native-gesture-handler";

export const ManageWalletConnectScreen: FunctionComponent = observer(() => {
  const { walletConnectStore } = useStore();

  const style = useStyle();

  return (
    <PageWithScrollView>
      <View style={style.flatten(["height-card-gap"])} />
      {walletConnectStore.sessions.map((session) => {
        const appName =
          session.peerMeta?.name || session.peerMeta?.url || "unknown";

        return (
          <View
            key={session.key}
            style={style.flatten([
              "flex-row",
              "items-center",
              "justify-between",
              "background-color-white",
              "padding-right-10",
              "padding-y-22",
            ])}
          >
            <View
              style={style.flatten([
                "padding-left-20",
                "flex-row",
                "items-center",
              ])}
            >
              <WCAppLogo peerMeta={session.peerMeta} />
              <Text
                style={style.flatten([
                  "margin-left-16",
                  "subtitle2",
                  "color-text-black-medium",
                ])}
              >
                {appName}
              </Text>
            </View>
            <TouchableOpacity
              style={style.flatten(["padding-10"])}
              onPress={() => {
                walletConnectStore.disconnect(session.key);
              }}
            >
              <UnconnectIcon
                color={style.get("color-text-black-very-very-low").color}
                height={30}
              />
            </TouchableOpacity>
          </View>
        );
      })}
    </PageWithScrollView>
  );
});
