import React, { FunctionComponent } from "react";
import { TextInput } from "../text-input";
import { observer } from "mobx-react-lite";
import {
  EmptyAddressError,
  IMemoConfig,
  IRecipientConfig,
  IRecipientConfigWithICNS,
} from "@keplr-wallet/hooks";
import { ProfileIcon } from "../../icon";
import { Box } from "../../box";
import { AddressBookModal } from "../../address-book-modal";
import { IconButton } from "../../icon-button";

export interface RecipientInputWithAddressBookProps {
  recipientConfig: IRecipientConfig | IRecipientConfigWithICNS;
  memoConfig: IMemoConfig;
}

export interface RecipientInputWithoutAddressBookProps {
  recipientConfig: IRecipientConfig | IRecipientConfigWithICNS;
  memoConfig?: undefined;

  hideAddressBookButton: true;
}

export type RecipientInputProps =
  | RecipientInputWithAddressBookProps
  | RecipientInputWithoutAddressBookProps;

function numOfCharacter(str: string, c: string): number {
  return str.split(c).length - 1;
}

export const RecipientInput: FunctionComponent<RecipientInputProps> = observer(
  ({ recipientConfig, memoConfig }) => {
    const [isAddressBookModalOpen, setIsAddressBookModalOpen] =
      React.useState(false);

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
      <Box>
        <TextInput
          label="Address"
          value={recipientConfig.value}
          autoComplete="off"
          onChange={(e) => {
            let value = e.target.value;

            if (
              // If icns is possible and users enters ".", complete bech32 prefix automatically.
              "isICNSEnabled" in recipientConfig &&
              recipientConfig.isICNSEnabled &&
              value.length > 0 &&
              value[value.length - 1] === "." &&
              numOfCharacter(value, ".") === 1 &&
              numOfCharacter(recipientConfig.value, ".") === 0
            ) {
              value = value + recipientConfig.icnsExpectedBech32Prefix;
            }

            recipientConfig.setValue(value);

            console.log("value", value);

            e.preventDefault();
          }}
          right={
            memoConfig ? (
              <IconButton onClick={() => setIsAddressBookModalOpen(true)}>
                <ProfileIcon width="1.5rem" height="1.5rem" />
              </IconButton>
            ) : null
          }
          isLoading={isICNSfetching}
          error={(() => {
            const uiProperties = recipientConfig.uiProperties;

            if (isICNSName && !recipientConfig.uiProperties.error) {
              return recipientConfig.recipient;
            }

            const err = uiProperties.error || uiProperties.warning;

            if (err instanceof EmptyAddressError) {
              return;
            }

            if (err) {
              return err.message || err.toString();
            }
          })()}
        />

        {memoConfig ? (
          <AddressBookModal
            chainId={recipientConfig.chainId}
            isOpen={isAddressBookModalOpen}
            close={() => setIsAddressBookModalOpen(false)}
            recipientConfig={recipientConfig}
            memoConfig={memoConfig}
          />
        ) : null}
      </Box>
    );
  }
);
