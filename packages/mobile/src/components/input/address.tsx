import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import {
  EmptyAddressError,
  ICNSFailedToFetchError,
  ICNSIsFetchingError,
  IMemoConfig,
  InvalidBech32Error,
  IRecipientConfig,
  IRecipientConfigWithICNS,
} from "@keplr-wallet/hooks";
import { TextStyle, View, ViewStyle } from "react-native";
import { TextInput } from "./input";
import { LoadingSpinner } from "../spinner";
import { useStyle } from "../../styles";
import { AddressBookIcon } from "../icon";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSmartNavigation } from "../../navigation";

function numOfCharacter(str: string, c: string): number {
  return str.split(c).length - 1;
}

export const AddressInput: FunctionComponent<
  {
    labelStyle?: TextStyle;
    containerStyle?: ViewStyle;
    inputContainerStyle?: ViewStyle;
    errorLabelStyle?: TextStyle;

    label: string;

    recipientConfig: IRecipientConfig | IRecipientConfigWithICNS;
  } & (
    | {
        memoConfig?: IMemoConfig;
        disableAddressBook: true;
      }
    | {
        memoConfig: IMemoConfig;
        disableAddressBook?: false;
      }
  )
> = observer(
  ({
    labelStyle,
    containerStyle,
    inputContainerStyle,
    errorLabelStyle,
    label,
    recipientConfig,
    memoConfig,
    disableAddressBook,
  }) => {
    const smartNavigation = useSmartNavigation();

    const style = useStyle();

    const error = recipientConfig.error;
    const errorText: string | undefined = useMemo(() => {
      if (error) {
        switch (error.constructor) {
          case EmptyAddressError:
            // No need to show the error to user.
            return;
          case InvalidBech32Error:
            return "Invalid address";
          case ICNSFailedToFetchError:
            return "Failed to fetch the address from ICNS";
          case ICNSIsFetchingError:
            return;
          default:
            return "Unknown error";
        }
      }
    }, [error]);

    const isICNSName: boolean = (() => {
      if ("isICNSName" in recipientConfig) {
        return recipientConfig.isICNSName;
      }
      return false;
    })();

    const isICNSfetching: boolean = (() => {
      if ("isICNSFetching" in recipientConfig) {
        return recipientConfig.isICNSFetching;
      }
      return false;
    })();

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
          if (
            // If icns is possible and users enters ".", complete bech32 prefix automatically.
            "isICNSEnabled" in recipientConfig &&
            recipientConfig.isICNSEnabled &&
            text.length > 0 &&
            text[text.length - 1] === "." &&
            numOfCharacter(text, ".") === 1 &&
            numOfCharacter(recipientConfig.rawRecipient, ".") === 0
          ) {
            text = text + recipientConfig.icnsExpectedBech32Prefix;
          }
          recipientConfig.setRawRecipient(text);
        }}
        paragraph={
          isICNSName ? (
            isICNSfetching ? (
              <View>
                <View
                  style={style.flatten([
                    "absolute",
                    "height-16",
                    "justify-center",
                    "margin-top-2",
                    "margin-left-4",
                  ])}
                >
                  <LoadingSpinner
                    size={14}
                    color={
                      style.flatten(["color-blue-400", "dark:color-blue-300"])
                        .color
                    }
                  />
                </View>
              </View>
            ) : (
              recipientConfig.recipient
            )
          ) : undefined
        }
        inputRight={
          disableAddressBook ? null : (
            <View
              style={style.flatten([
                "height-1",
                "overflow-visible",
                "justify-center",
              ])}
            >
              <TouchableOpacity
                style={style.flatten(["padding-4"])}
                onPress={() => {
                  smartNavigation.navigateSmart("AddressBook", {
                    recipientConfig,
                    memoConfig,
                  });
                }}
              >
                <AddressBookIcon
                  color={
                    style.flatten(["color-blue-400", "dark:color-blue-100"])
                      .color
                  }
                  height={18}
                />
              </TouchableOpacity>
            </View>
          )
        }
        autoCorrect={false}
        autoCapitalize="none"
        autoCompleteType="off"
      />
    );
  }
);
