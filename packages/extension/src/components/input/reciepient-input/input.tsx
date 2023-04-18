import React, { FunctionComponent } from "react";
import { TextInput } from "../text-input";
import { observer } from "mobx-react-lite";
import { EmptyAddressError, IRecipientConfig } from "@keplr-wallet/hooks";
import { ProfileIcon } from "../../icon";
import { Box } from "../../box";
import { ColorPalette } from "../../../styles";
import { Modal } from "../../modal";
import { AddressListModal } from "../../../pages/send/amount/address-list-modal";

export const RecipientInput: FunctionComponent<{
  recipientConfig: IRecipientConfig;
}> = observer(({ recipientConfig }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  return (
    <Box>
      <TextInput
        label="Address"
        onChange={(e) => {
          e.preventDefault();
          recipientConfig.setValue(e.target.value);
        }}
        right={
          <Box
            style={{
              color: ColorPalette["gray-50"],
            }}
          >
            <ProfileIcon width="1rem" height="1rem" />
          </Box>
        }
        rightClick={() => setIsModalOpen(true)}
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

      <Modal isOpen={isModalOpen}>
        <AddressListModal setIsOpen={setIsModalOpen} />
      </Modal>
    </Box>
  );
});
