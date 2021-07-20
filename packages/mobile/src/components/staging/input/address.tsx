import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import {
  EmptyAddressError,
  ENSFailedToFetchError,
  ENSIsFetchingError,
  ENSNotSupportedError,
  InvalidBech32Error,
  IRecipientConfig,
} from "@keplr-wallet/hooks";
import { TextStyle, View, ViewStyle } from "react-native";
import { TextInput } from "./input";
import { ObservableEnsFetcher } from "@keplr-wallet/ens";
import { LoadingSpinner } from "../spinner";
import { useStyle } from "../../../styles";

export const AddressInput: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  errorLabelStyle?: TextStyle;

  label: string;

  recipientConfig: IRecipientConfig;

  disableAddressBook?: boolean;
}> = observer(
  ({
    labelStyle,
    containerStyle,
    inputContainerStyle,
    errorLabelStyle,
    label,
    recipientConfig,
  }) => {
    const style = useStyle();

    const isENSAddress = ObservableEnsFetcher.isValidENS(
      recipientConfig.rawRecipient
    );

    const error = recipientConfig.getError();
    const errorText: string | undefined = useMemo(() => {
      if (error) {
        switch (error.constructor) {
          case EmptyAddressError:
            // No need to show the error to user.
            return;
          case InvalidBech32Error:
            return "Invalid address";
          case ENSNotSupportedError:
            return "ENS not supported";
          case ENSFailedToFetchError:
            return "Failed to fetch the address from ENS";
          case ENSIsFetchingError:
            return;
          default:
            return "Unknown error";
        }
      }
    }, [error]);

    const isENSLoading: boolean = error instanceof ENSIsFetchingError;

    return (
      <TextInput
        label={label}
        labelStyle={labelStyle}
        containerStyle={containerStyle}
        inputContainerStyle={inputContainerStyle}
        errorLabelStyle={errorLabelStyle}
        error={errorText}
        value={recipientConfig.rawRecipient}
        onChangeText={(text) => {
          recipientConfig.setRawRecipient(text);
        }}
        paragraph={
          isENSAddress ? (
            isENSLoading ? (
              <View>
                <View
                  style={style.flatten([
                    "absolute",
                    "height-16",
                    "justify-center",
                  ])}
                >
                  <LoadingSpinner
                    size={14}
                    color={style.get("color-loading-spinner").color}
                  />
                </View>
              </View>
            ) : (
              recipientConfig.recipient
            )
          ) : undefined
        }
        autoCorrect={false}
        autoCapitalize="none"
        autoCompleteType="off"
      />
    );
  }
);
