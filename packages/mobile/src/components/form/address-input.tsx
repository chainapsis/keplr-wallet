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
import FeatherIcon from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { Input } from "./input";
import { colors } from "react-native-elements";

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
        value={recipientConfig.rawRecipient}
        onChangeText={(value) => {
          recipientConfig.setRawRecipient(value);
        }}
        rightIcon={
          hasAddressBook ? (
            <View accessible>
              <FeatherIcon name="book" size={20} color={colors.primary} />
            </View>
          ) : null
        }
        rightIconOnPress={
          hasAddressBook
            ? () => {
                navigation.navigate("Address Book Modal Stack");
              }
            : undefined
        }
        hasCenterBorder={hasAddressBook}
        errorMessage={errorText}
      />
    );
  }
);
