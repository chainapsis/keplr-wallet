import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { PageWithScrollView } from "components/page";
import { useStyle } from "styles/index";

import { useStore } from "stores/index";
import { Text, View, ViewStyle } from "react-native";
import { RectButton } from "components/rect-button";
import { CheckIcon } from "components/new/icon/check";
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from "@react-navigation/native";

export const CurrencyScreen: FunctionComponent = observer(() => {
  const { priceStore } = useStore();

  const style = useStyle();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const currencyItems = useMemo(() => {
    return Object.keys(priceStore.supportedVsCurrencies).map((key) => {
      return {
        key,
        label: priceStore.supportedVsCurrencies[key]?.currency.toUpperCase(),
        symbol: priceStore.supportedVsCurrencies[key]?.symbol,
      };
    });
  }, [priceStore.supportedVsCurrencies]);

  return (
    <PageWithScrollView
      backgroundMode="image"
      style={style.flatten(["padding-x-page", "padding-y-page"]) as ViewStyle}
    >
      {currencyItems.map((item) => {
        return (
          <RectButton
            key={item.key}
            style={
              style.flatten(
                ["padding-18", "flex-row", "items-center", "justify-between"],
                [
                  item.key === priceStore.defaultVsCurrency &&
                    "background-color-indigo",
                  "border-radius-12",
                ]
              ) as ViewStyle
            }
            onPress={() => {
              priceStore.setDefaultVsCurrency(item.key);
              navigation.goBack();
            }}
          >
            <Text style={style.flatten(["body3", "color-white"])}>
              {item.label} ({item.symbol})
            </Text>
            {item.key === priceStore.defaultVsCurrency ? <CheckIcon /> : null}
          </RectButton>
        );
      })}
      <View style={style.flatten(["height-page-double-pad"]) as ViewStyle} />
    </PageWithScrollView>
  );
});
