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
import { RectButton } from "react-native-gesture-handler";
import { Text } from "react-native-elements";
import {
  sf,
  body2,
  fcLow,
  h3,
  h4,
  flexDirectionRow,
  flex1,
  justifyContentAround,
  alignItemsCenter,
  mb4,
  p4,
  bgcPrimary,
  br3,
  mr3,
} from "../../styles";

export type DrawerContentProps = DrawerContentComponentProps<DrawerContentOptions>;

export const DrawerContent: FunctionComponent<DrawerContentProps> = observer(
  (props) => {
    const { chainStore, accountStore, queriesStore, priceStore } = useStore();
    const navigation = useNavigation();

    return (
      <DrawerContentScrollView {...props}>
        <View
          style={sf([
            flexDirectionRow,
            justifyContentAround,
            alignItemsCenter,
            mb4,
          ])}
        >
          <Text style={h3}>Chain</Text>
        </View>
        {chainStore.chainInfos.map((chainInfo) => {
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
                navigation.dispatch(DrawerActions.closeDrawer());
              }}
            >
              <View accessible style={sf([flexDirectionRow, p4])}>
                <View
                  style={sf([{ width: 48, height: 48 }, bgcPrimary, br3, mr3])}
                />
                <View style={flex1}>
                  <Text style={h4}>{chainInfo.chainName}</Text>
                  <Text style={sf([body2, fcLow])}>
                    {totalPrice
                      ? totalPrice.toString()
                      : total.shrink(true).maxDecimals(6).toString()}
                  </Text>
                </View>
              </View>
            </RectButton>
          );
        })}
      </DrawerContentScrollView>
    );
  }
);
