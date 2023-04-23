import React, { FunctionComponent } from "react";
import { TextInput } from "../text-input";
import { observer } from "mobx-react-lite";
import {
  EmptyAddressError,
  IMemoConfig,
  IRecipientConfig,
} from "@keplr-wallet/hooks";
import { ProfileIcon } from "../../icon";
import { Box } from "../../box";
import { AddressBookModal } from "../../address-book-modal";
import { IconButton } from "../../icon-button";

export interface RecipientInputWithAddressBookProps {
  recipientConfig: IRecipientConfig;
  memoConfig: IMemoConfig;
}

export interface RecipientInputWithoutAddressBookProps {
  recipientConfig: IRecipientConfig;
  memoConfig?: undefined;

  hideAddressBookButton: true;
}

export type RecipientInputProps =
  | RecipientInputWithAddressBookProps
  | RecipientInputWithoutAddressBookProps;

export const RecipientInput: FunctionComponent<RecipientInputProps> = observer(
  (props) => {
    const [isAddressBookModalOpen, setIsAddressBookModalOpen] =
      React.useState(false);

    return (
      <Box>
        <TextInput
          label="Address"
          onChange={(e) => {
            e.preventDefault();
            props.recipientConfig.setValue(e.target.value);
          }}
          right={
            props.memoConfig ? (
              <IconButton onClick={() => setIsAddressBookModalOpen(true)}>
                <ProfileIcon width="1.75rem" height="1.75rem" />
              </IconButton>
            ) : null
          }
          value={props.recipientConfig.value}
          error={(() => {
            const uiProperties = props.recipientConfig.uiProperties;

            const err = uiProperties.error || uiProperties.warning;

            if (err instanceof EmptyAddressError) {
              return;
            }

            if (err) {
              return err.message || err.toString();
            }
          })()}
        />

        {props.memoConfig ? (
          <AddressBookModal
            chainId={props.recipientConfig.chainId}
            isOpen={isAddressBookModalOpen}
            close={() => setIsAddressBookModalOpen(false)}
            recipientConfig={props.recipientConfig}
            memoConfig={props.memoConfig}
          />
        ) : null}
      </Box>
    );
  }
);
