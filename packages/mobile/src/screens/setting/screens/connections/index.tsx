import React, { FunctionComponent } from "react";
import { PageWithScrollViewInBottomTabView } from "../../../../components/page";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { Text, View } from "react-native";
import { useStyle } from "../../../../styles";
import { GlobeIcon, TrashCanIcon } from "../../../../components/icon";
import { TouchableOpacity } from "react-native-gesture-handler";
import { WCV2MessageRequester } from "../../../../stores/wallet-connect-v2/msg-requester";
import { WCMessageRequester } from "../../../../stores/wallet-connect/msg-requester";

export const SettingManageConnectionsScreen: FunctionComponent = observer(
  () => {
    const style = useStyle();
    const { chainStore, permissionStore, walletConnectStore } = useStore();

    return (
      <PageWithScrollViewInBottomTabView backgroundMode="tertiary">
        {chainStore.chainInfos.map((chainInfo) => {
          const basicAccessInfo = permissionStore.getBasicAccessInfo(
            chainInfo.chainId
          );

          if (basicAccessInfo.origins.length === 0) {
            return null;
          }

          if (WCV2MessageRequester.isVirtualURL(basicAccessInfo.origins[0])) {
            return null;
          }

          if (
            WCMessageRequester.isVirtualSessionURL(
              basicAccessInfo.origins[0]
            ) &&
            walletConnectStore.getSession(
              WCMessageRequester.getSessionIdFromVirtualURL(
                basicAccessInfo.origins[0]
              )
            )
          ) {
            return null;
          }

          return (
            <View
              key={chainInfo.chainId}
              style={style.flatten([
                "flex-column",
                "padding-x-20",
                "padding-top-16",
                "padding-bottom-20",
                "margin-top-12",
                "background-color-white",
                "dark:background-color-platinum-600",
              ])}
            >
              <Text
                style={style.flatten([
                  "text-caption1",
                  "padding-y-20",
                  "color-text-low",
                ])}
              >
                {chainInfo.chainName}
              </Text>

              {basicAccessInfo.origins.map((origin) => {
                return (
                  <React.Fragment key={origin}>
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
                        "padding-y-20",
                      ])}
                    >
                      <View style={style.flatten(["margin-right-16"])}>
                        <GlobeIcon
                          size={24}
                          color={style.flatten(["color-blue-400"]).color}
                        />
                      </View>
                      <Text
                        style={style.flatten([
                          "subtitle3",
                          "color-platinum-400",
                          "dark:color-platinum-50",
                        ])}
                      >
                        {origin}
                      </Text>

                      <View style={style.flatten(["flex-1"])} />

                      <TouchableOpacity
                        style={style.flatten([
                          "padding-left-8",
                          "padding-y-12",
                        ])}
                        onPress={async () => {
                          await basicAccessInfo.removeOrigin(origin);
                        }}
                      >
                        <TrashCanIcon
                          color={
                            style.flatten([
                              "color-gray-100",
                              "dark:color-gray-200",
                            ]).color
                          }
                          size={24}
                        />
                      </TouchableOpacity>
                    </View>
                  </React.Fragment>
                );
              })}
            </View>
          );
        })}
      </PageWithScrollViewInBottomTabView>
    );
  }
);
