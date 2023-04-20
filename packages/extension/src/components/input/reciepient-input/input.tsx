import React, { FunctionComponent } from "react";
import { TextInput } from "../text-input";
import { observer } from "mobx-react-lite";
import { EmptyAddressError, IRecipientConfig } from "@keplr-wallet/hooks";
import { ProfileIcon } from "../../icon";
import { Box } from "../../box";
import { AddressBookModal } from "../../address-book-modal";
import { IconButton } from "../../icon-button";

export const RecipientInput: FunctionComponent<{
  recipientConfig: IRecipientConfig;
}> = observer(({ recipientConfig }) => {
  const [isAddressBookModalOpen, setIsAddressBookModalOpen] =
    React.useState(false);

  return (
    <Box>
      <TextInput
        label="Address"
        onChange={(e) => {
          e.preventDefault();
          recipientConfig.setValue(e.target.value);
        }}
        right={
          <IconButton onClick={() => setIsAddressBookModalOpen(true)}>
            <ProfileIcon width="1.75rem" height="1.75rem" />
          </IconButton>
        }
        value={recipientConfig.value}
        error={(() => {
          const uiProperties = recipientConfig.uiProperties;

          const err = uiProperties.error || uiProperties.warning;

          if (err instanceof EmptyAddressError) {
            return;
          }

          if (err) {
            return err.message || err.toString();
          }
        })()}
      />

      <AddressBookModal
        isOpen={isAddressBookModalOpen}
        close={() => setIsAddressBookModalOpen(false)}
      />
    </Box>
  );
});
