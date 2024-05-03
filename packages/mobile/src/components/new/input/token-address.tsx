import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import {
  EmptyAddressError,
  ICNSFailedToFetchError,
  ICNSIsFetchingError,
  InvalidBech32Error,
  IRecipientConfig,
  IRecipientConfigWithICNS,
} from "@keplr-wallet/hooks";
import { TextStyle, View, ViewStyle } from "react-native";
import { LoadingSpinner } from "components/spinner";
import { useStyle } from "styles/index";
import { InputCardView } from "components/new/card-view/input-card";
import { ObservableQueryCw20ContactInfoInner } from "@keplr-wallet/stores/build/query/cosmwasm/cw20-contract-info";

function numOfCharacter(str: string, c: string): number {
  return str.split(c).length - 1;
}

export const TokenAddressInput: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  errorLabelStyle?: TextStyle;

  label: string;
  queryTokenInfo?: ObservableQueryCw20ContactInfoInner;

  recipientConfig: IRecipientConfig | IRecipientConfigWithICNS;
}> = observer(
  ({
    labelStyle,
    containerStyle,
    inputContainerStyle,
    errorLabelStyle,
    label,
    recipientConfig,
    queryTokenInfo,
  }) => {
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
      } else if (queryTokenInfo?.tokenInfo == undefined) {
        return "Token add in wrong network";
      }
    }, [error, queryTokenInfo?.tokenInfo]);

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
      <InputCardView
        label={label}
        labelStyle={labelStyle}
        containerStyle={containerStyle}
        inputContainerStyle={inputContainerStyle}
        errorLabelStyle={errorLabelStyle}
        error={errorText}
        value={recipientConfig.rawRecipient}
        onChangeText={(text: any) => {
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
                  style={
                    style.flatten([
                      "absolute",
                      "height-16",
                      "justify-center",
                      "margin-top-2",
                      "margin-left-4",
                    ]) as ViewStyle
                  }
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
        autoCorrect={false}
        autoCapitalize="none"
        autoComplete="off"
      />
    );
  }
);
