import React, { FunctionComponent } from "react";
import { registerModal } from "../base";
import { Text, View } from "react-native";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/staging/button";
import { AddressBookConfig } from "@keplr-wallet/hooks";

export const AddressDeleteModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  addressBookConfig: AddressBookConfig;
  addressIndex: number;
}> = registerModal(
  ({ close, addressBookConfig, addressIndex }) => {
    const style = useStyle();

    return (
      <View style={style.flatten(["padding-page"])}>
        <View
          style={style.flatten([
            "border-radius-8",
            "overflow-hidden",
            "background-color-white",
            "padding-x-20",
            "padding-y-28",
            "items-center",
          ])}
        >
          <Text
            style={style.flatten([
              "h3",
              "color-text-black-medium",
              "margin-bottom-8",
            ])}
          >
            Delete Address
          </Text>
          <Text
            style={style.flatten([
              "body2",
              "color-text-black-medium",
              "margin-bottom-16",
              "text-center",
            ])}
          >
            Are you sure you want to delete this address?
          </Text>
          <View style={style.flatten(["flex-row"])}>
            <Button
              containerStyle={style.flatten(["flex-1"])}
              text="Cancel"
              mode="outline"
              onPress={() => {
                close();
              }}
            />
            <View style={style.flatten(["width-12"])} />
            <Button
              containerStyle={style.flatten(["flex-1"])}
              text="Delete"
              onPress={() => {
                addressBookConfig.removeAddressBook(addressIndex);
                close();
              }}
            />
          </View>
        </View>
      </View>
    );
  },
  {
    align: "center",
    transitionVelocity: 3000,
  }
);
