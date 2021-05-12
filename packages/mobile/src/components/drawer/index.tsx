import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import {
  DrawerContentComponentProps,
  DrawerContentOptions,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { useStore } from "../../stores";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { BaseButton } from "../buttons";

export type DrawerContentProps = DrawerContentComponentProps<DrawerContentOptions>;

export const DrawerContent: FunctionComponent<DrawerContentProps> = observer(
  (props) => {
    const { chainStore } = useStore();
    const navigation = useNavigation();

    return (
      <DrawerContentScrollView {...props}>
        {chainStore.chainInfos.map((chainInfo) => {
          return (
            <BaseButton
              key={chainInfo.chainId}
              title={chainInfo.chainName}
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
