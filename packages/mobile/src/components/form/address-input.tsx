import React, { FunctionComponent, useMemo } from "react";
import {
  EmptyAddressError,
  ENSFailedToFetchError,
  ENSIsFetchingError,
  ENSNotSupportedError,
  InvalidBech32Error,
  IRecipientConfig,
} from "@keplr-wallet/hooks";
import { Input } from "react-native-elements";
import { observer } from "mobx-react-lite";

export interface AddressInputProps {
  recipientConfig: IRecipientConfig;
}

export const AddressInput: FunctionComponent<AddressInputProps> = observer(
  ({ recipientConfig }) => {
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
        errorMessage={errorText}
      />
    );
  }
);
