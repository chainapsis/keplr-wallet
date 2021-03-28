import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import {
  DrawerContentComponentProps,
  DrawerContentOptions,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { useStore } from "../../stores";
import { Button } from "react-native-elements";
import { DrawerActions, useNavigation } from "@react-navigation/native";

export type DrawerContentProps = DrawerContentComponentProps<DrawerContentOptions>;

export const DrawerContent: FunctionComponent<DrawerContentProps> = observer(
  (props) => {
    const { chainStore } = useStore();
    const navigation = useNavigation();

    return (
      <DrawerContentScrollView {...props}>
        {chainStore.chainInfos.map((chainInfo) => {
          return (
            <Button
              key={chainInfo.chainId}
              title={chainInfo.chainName}
              type="clear"
              onPress={() => {
                chainStore.selectChain(chainInfo.chainId);
                navigation.dispatch(DrawerActions.closeDrawer());
              }}
            />
          );
        })}
      </DrawerContentScrollView>
    );
  }
);
