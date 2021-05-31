import React, { FunctionComponent, useMemo } from "react";
import {
  EmptyAddressError,
  ENSFailedToFetchError,
  ENSIsFetchingError,
  ENSNotSupportedError,
  InvalidBech32Error,
  IRecipientConfig,
} from "@keplr-wallet/hooks";
import { View } from "react-native";
import { observer } from "mobx-react-lite";
import { Input } from "./input";
import { RectButton } from "react-native-gesture-handler";
import FeatherIcon from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import {
  alignItemsCenter,
  flex1,
  justifyContentCenter,
  sf,
} from "../../styles";

export interface AddressInputProps {
  recipientConfig: IRecipientConfig;
  hasAddressBook?: boolean;
}

export const AddressInput: FunctionComponent<AddressInputProps> = observer(
  ({ recipientConfig, hasAddressBook }) => {
    const navigation = useNavigation();

    const error = recipientConfig.getError();
    const errorText: string | undefined = useMemo(() => {
      if (error) {
        switch (error.constructor) {
          case EmptyAddressError:
            // No need to show the error to user.
            return;
          case InvalidBech32Error:
            return "Invalid bech32";
          case ENSNotSupportedError:
            return "ENS not supported for this chain";
          case ENSFailedToFetchError:
            return "Failed to fetch from ENS";
          case ENSIsFetchingError:
            return;
          default:
            return "Unknown error";
        }
      }
    }, [error]);

    return (
      <Input
        label="Recipient"
        onChangeText={(value) => {
          recipientConfig.setRawRecipient(value);
        }}
        rightIcon={
          hasAddressBook ? (
            <RectButton
              style={sf([flex1, justifyContentCenter, alignItemsCenter])}
              onPress={() => {
                navigation.navigate("Settings", { screen: "Address Book" });
              }}
            >
              <View accessible>
                <FeatherIcon name="book" size={20} />
              </View>
            </RectButton>
          ) : null
        }
        errorMessage={errorText}
      />
    );
  }
);
