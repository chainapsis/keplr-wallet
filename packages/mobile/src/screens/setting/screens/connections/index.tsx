import React, { FunctionComponent } from "react";
import { PageWithScrollViewInBottomTabView } from "../../../../components/page";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { Text, View } from "react-native";
import { useStyle } from "../../../../styles";
import Svg, { Path } from "react-native-svg";
import { TrashCanIcon } from "../../../../components/icon";
import { TouchableOpacity } from "react-native-gesture-handler";

export const GlobeIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size }) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 24 25">
      <Path
        fill={color}
        d="M12 2.5C8.74107 2.5 5.84869 4.07739 4.02148 6.5H4V6.52734C2.74995 8.19669 2 10.2604 2 12.5C2 18.011 6.489 22.5 12 22.5C17.511 22.5 22 18.011 22 12.5C22 6.989 17.511 2.5 12 2.5ZM15 5.08398C17.9351 6.26736 20 9.13265 20 12.5C20 14.5878 19.2006 16.4783 17.8984 17.9004C17.6426 17.0907 16.8946 16.5 16 16.5C15.448 16.5 15 16.052 15 15.5V13.5C15 12.948 14.552 12.5 14 12.5H10C9.448 12.5 9 12.052 9 11.5C9 10.948 9.448 10.5 10 10.5C10.552 10.5 11 10.052 11 9.5V8.5C11 7.948 11.448 7.5 12 7.5H13C14.105 7.5 15 6.605 15 5.5V5.08398ZM4.20703 10.707L9 15.5V16.5C9 17.605 9.895 18.5 11 18.5V20.4316C7.04577 19.9412 4 16.5907 4 12.5C4 11.8822 4.07552 11.284 4.20703 10.707Z"
      />
    </Svg>
  );
};

export const SettingManageConnectionsScreen: FunctionComponent = observer(
  () => {
    const style = useStyle();
    const { chainStore, permissionStore } = useStore();

    return (
      <PageWithScrollViewInBottomTabView backgroundMode="tertiary">
        {chainStore.chainInfosInUI.map((chainInfo) => {
          const basicAccessInfo = permissionStore.getBasicAccessInfo(
            chainInfo.chainId
          );

          if (basicAccessInfo.origins.length === 0) {
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
