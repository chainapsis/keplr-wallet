import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import {
  DrawerContentComponentProps,
  DrawerContentOptions,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { useStore } from "../../stores";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { View } from "react-native";
import { Text } from "react-native-elements";
import { useStyle } from "../../styles";
import { RectButton } from "../rect-button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VectorCharacter } from "../vector-character";

export type DrawerContentProps = DrawerContentComponentProps<DrawerContentOptions>;

export const DrawerContent: FunctionComponent<DrawerContentProps> = observer(
  (props) => {
    const { chainStore, accountStore, queriesStore, priceStore } = useStore();
    const navigation = useNavigation();

    const safeAreaInsets = useSafeAreaInsets();

    const style = useStyle();

    return (
      <DrawerContentScrollView {...props}>
        <View
          style={{
            marginBottom: safeAreaInsets.bottom,
          }}
        >
          <View style={style.flatten(["justify-center", "height-50"])}>
            <Text
              style={style.flatten([
                "h3",
                "color-text-black-high",
                "margin-left-24",
              ])}
            >
              Chain
            </Text>
          </View>
          {chainStore.chainInfos.map((chainInfo) => {
            const selected = chainStore.current.chainId === chainInfo.chainId;

            const queries = queriesStore.get(chainInfo.chainId);

            const accountInfo = accountStore.getAccount(chainInfo.chainId);

            const balanceStakableQuery = queries.queryBalances.getQueryBech32Address(
              accountInfo.bech32Address
            ).stakable;

            const stakable = balanceStakableQuery.balance;

            const delegated = queries.cosmos.queryDelegations
              .getQueryBech32Address(accountInfo.bech32Address)
              .total.upperCase(true);

            const unbonding = queries.cosmos.queryUnbondingDelegations
              .getQueryBech32Address(accountInfo.bech32Address)
              .total.upperCase(true);

            const stakedSum = delegated.add(unbonding);

            const total = stakable.add(stakedSum);

            const totalPrice = priceStore.calculatePrice(total);
            return (
              <RectButton
                key={chainInfo.chainId}
                onPress={() => {
                  chainStore.selectChain(chainInfo.chainId);
                  chainStore.saveLastViewChainId();
                  navigation.dispatch(DrawerActions.closeDrawer());
                }}
                style={style.flatten([
                  "flex-row",
                  "height-84",
                  "items-center",
                  "padding-x-20",
                ])}
                activeOpacity={1}
                underlayColor={
                  style.get("color-drawer-rect-button-underlay").color
                }
              >
                <View
                  style={style.flatten(
                    [
                      "width-44",
                      "height-44",
                      "border-radius-64",
                      "items-center",
                      "justify-center",
                      "background-color-primary-100",
                      "margin-right-16",
                    ],
                    [selected && "background-color-primary"]
                  )}
                >
                  <VectorCharacter
                    char={chainInfo.chainName[0]}
                    color="white"
                    height={15}
                  />
                </View>
                <View>
                  <Text
                    style={style.flatten([
                      "h4",
                      "color-text-black-medium",
                      "margin-bottom-4",
                    ])}
                  >
                    {chainInfo.chainName}
                  </Text>
                  <Text
                    style={style.flatten(["subtitle2", "color-text-black-low"])}
                  >
                    {totalPrice
                      ? totalPrice.toString()
                      : total.maxDecimals(6).trim(true).shrink(true).toString()}
                  </Text>
                </View>
              </RectButton>
            );
          })}
        </View>
      </DrawerContentScrollView>
    );
  }
);
