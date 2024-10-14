import React from "react";
import { TextInput } from "../../../../../components/input";
import { observer } from "mobx-react-lite";
import {
  EmptyAddressError,
  IRecipientConfig,
} from "@keplr-wallet/hooks-starknet";
import { ProfileIcon } from "../../../../../components/icon";
import { Box } from "../../../../../components/box";
import { AddressBookModal } from "../../address-book-modal";
import { IconButton } from "../../../../../components/icon-button";
import { ColorPalette } from "../../../../../styles";
import { useStore } from "../../../../../stores";
import { useIntl } from "react-intl";
import { useTheme } from "styled-components";

export interface RecipientInputWithAddressBookProps {
  historyType: string;
  recipientConfig: IRecipientConfig;

  permitAddressBookSelfKeyInfo?: boolean;
}

export interface RecipientInputWithoutAddressBookProps {
  recipientConfig: IRecipientConfig;

  hideAddressBookButton: true;
}

export type RecipientInputProps = (
  | RecipientInputWithAddressBookProps
  | RecipientInputWithoutAddressBookProps
) & {
  bottom?: React.ReactNode;
};

export const RecipientInput = observer<RecipientInputProps, HTMLInputElement>(
  (props, ref) => {
    const { analyticsStore } = useStore();
    const intl = useIntl();
    const theme = useTheme();
    const { recipientConfig } = props;

    const [isAddressBookModalOpen, setIsAddressBookModalOpen] =
      React.useState(false);

    return (
      <Box>
        <TextInput
          ref={ref}
          label={intl.formatMessage({
            id: "components.input.recipient-input.wallet-address-only-label",
          })}
          value={recipientConfig.value}
          autoComplete="off"
          onChange={(e) => {
            const value = e.target.value;
            recipientConfig.setValue(value);

            e.preventDefault();
          }}
          right={
            "historyType" in props ? (
              <IconButton
                onClick={() => {
                  analyticsStore.logEvent("click_addressBookButton");
                  setIsAddressBookModalOpen(true);
                }}
                hoverColor={
                  theme.mode === "light"
                    ? ColorPalette["gray-50"]
                    : ColorPalette["gray-500"]
                }
                padding="0.25rem"
              >
                <ProfileIcon width="1.5rem" height="1.5rem" />
              </IconButton>
            ) : null
          }
          bottom={props.bottom}
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

        {"historyType" in props ? (
          <AddressBookModal
            isOpen={isAddressBookModalOpen}
            close={() => setIsAddressBookModalOpen(false)}
            historyType={props.historyType}
            recipientConfig={recipientConfig}
            permitSelfKeyInfo={props.permitAddressBookSelfKeyInfo}
          />
        ) : null}
      </Box>
    );
  },
  {
    forwardRef: true,
  }
);
